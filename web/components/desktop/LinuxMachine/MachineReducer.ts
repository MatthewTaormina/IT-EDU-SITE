/**
 * LinuxMachine — Pure state reducer
 *
 * All state transitions for the desktop OS pass through this function.
 * No React, no side-effects — pure (state, action) → state.
 *
 * VFS operations mirror the POSIX semantics from TerminalSandbox/vfs.ts
 * but operate on DesktopVFSMap which supports 'url' and 'symlink' entries.
 */

import type {
  MachineState,
  MachineAction,
  DesktopVFSMap,
  DesktopVFSEntry,
  WindowEntry,
  AppState,
  AppId,
} from './MachineTypes';

// ─── VFS helpers ──────────────────────────────────────────────────────────────
// Mirrors shell.ts helpers so semantics are identical across both surfaces.

function resolvePath(cwd: string, input: string): string {
  const base = input.startsWith('/') ? '' : cwd;
  const raw  = base === '/' ? `/${input}` : `${base}/${input}`;
  const parts = raw.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.')  continue;
    if (part === '..') { stack.pop(); continue; }
    stack.push(part);
  }
  return '/' + stack.join('/');
}

function parentOf(absPath: string): string {
  if (absPath === '/') return '/';
  const idx = absPath.lastIndexOf('/');
  return idx === 0 ? '/' : absPath.slice(0, idx);
}

function basename(absPath: string): string {
  if (absPath === '/') return '/';
  return absPath.slice(absPath.lastIndexOf('/') + 1);
}

function ensureDirs(vfs: DesktopVFSMap, absPath: string): void {
  const parts = absPath.split('/').filter(Boolean);
  let cur = '/';
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur === '/' ? `/${parts[i]}` : `${cur}/${parts[i]}`;
    // Only create if missing; preserve origin of directories that already exist
    if (!vfs.has(cur)) vfs.set(cur, { kind: 'dir', origin: 'local' });
  }
}

function cloneVFS(vfs: DesktopVFSMap): DesktopVFSMap {
  const copy: DesktopVFSMap = new Map();
  for (const [k, v] of vfs) {
    // Shallow copy — entry objects are treated as value types
    copy.set(k, { ...v } as DesktopVFSEntry);
  }
  return copy;
}

// ─── Window helpers ───────────────────────────────────────────────────────────

const DEFAULT_WINDOW_SIZES: Record<AppId, { width: number; height: number }> = {
  terminal:      { width: 720,  height: 480 },
  browser:       { width: 1024, height: 700 },
  email:         { width: 800,  height: 560 },
  'text-editor': { width: 640,  height: 480 },
};

/** Cascade-position each new window 24px offset from the previous. */
function cascadePosition(windows: WindowEntry[]): { x: number; y: number } {
  const offset = (windows.length % 8) * 24;
  return { x: 40 + offset, y: 40 + offset };
}

function maxZIndex(windows: WindowEntry[]): number {
  return windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
}

function mapWindow(
  windows: WindowEntry[],
  id: string,
  fn: (w: WindowEntry) => WindowEntry,
): WindowEntry[] {
  return windows.map(w => (w.id === id ? fn(w) : w));
}

/** Build the default inner state for a newly opened app window. */
function defaultAppState(app: AppId, env: Record<string, string>): AppState {
  switch (app) {
    case 'terminal':
      return { cwd: env['HOME'] ?? '/home/user', history: [] };
    case 'browser':
      return { url: 'about:home', history: ['about:home'], historyIndex: 0 };
    case 'email':
      return { view: 'inbox' };
    case 'text-editor':
      return { filePath: null, content: '', dirty: false, cursorLine: 1, cursorCol: 1 };
  }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function machineReducer(
  state: MachineState,
  action: MachineAction,
): MachineState {
  switch (action.type) {

    // ── VFS ───────────────────────────────────────────────────────────────────

    case 'VFS_WRITE': {
      const abs = action.path.startsWith('/') ? action.path : `/${action.path}`;
      const existing = state.vfs.get(abs);
      // Read-only guard — url entries and explicitly locked files cannot be overwritten
      if (existing && 'readOnly' in existing && existing.readOnly) return state;
      const vfs = cloneVFS(state.vfs);
      ensureDirs(vfs, abs);
      vfs.set(abs, { kind: 'file', content: action.content, origin: 'local' });
      return { ...state, vfs };
    }

    case 'VFS_WRITE_URL': {
      const abs = action.path.startsWith('/') ? action.path : `/${action.path}`;
      const vfs = cloneVFS(state.vfs);
      ensureDirs(vfs, abs);
      // User-initiated url entries (browser downloads) are local — they should persist
      vfs.set(abs, { kind: 'url', href: action.href, mimeType: action.mimeType, readOnly: true, origin: 'local' });
      return { ...state, vfs };
    }

    case 'VFS_MKDIR': {
      const abs = action.path.startsWith('/') ? action.path : `/${action.path}`;
      if (state.vfs.has(abs)) return state; // already exists — no-op
      const parent = parentOf(abs);
      if (!state.vfs.has(parent) && !action.parents) return state;
      const vfs = cloneVFS(state.vfs);
      if (action.parents) ensureDirs(vfs, abs + '/__sentinel__');
      vfs.set(abs, { kind: 'dir', origin: 'local' });
      return { ...state, vfs };
    }

    case 'VFS_DELETE': {
      const abs = action.path.startsWith('/') ? action.path : `/${action.path}`;
      const entry = state.vfs.get(abs);
      if (!entry) return state;
      if (entry.kind === 'dir' && !action.recursive) return state;
      const vfs = cloneVFS(state.vfs);
      for (const key of [...vfs.keys()]) {
        if (key === abs || key.startsWith(abs + '/')) vfs.delete(key);
      }
      return { ...state, vfs };
    }

    case 'VFS_MOVE': {
      const src = action.from.startsWith('/') ? action.from : `/${action.from}`;
      const rawDst = action.to.startsWith('/') ? action.to : `/${action.to}`;
      const srcEntry = state.vfs.get(src);
      if (!srcEntry) return state;
      const vfs = cloneVFS(state.vfs);
      // If destination is an existing directory, move src inside it
      const dstEntry = vfs.get(rawDst);
      const dst = dstEntry?.kind === 'dir'
        ? (rawDst === '/' ? `/${basename(src)}` : `${rawDst}/${basename(src)}`)
        : rawDst;
      const moves: [string, DesktopVFSEntry][] = [];
      for (const [k, v] of vfs) {
        if (k === src || k.startsWith(src + '/')) moves.push([k, v]);
      }
      for (const [k, v] of moves) {
        const newKey = dst + k.slice(src.length);
        ensureDirs(vfs, newKey);
        vfs.set(newKey, v);
        vfs.delete(k);
      }
      return { ...state, vfs };
    }

    // ── Windows ───────────────────────────────────────────────────────────────

    case 'WINDOW_OPEN': {
      const id       = `w${state.nextWindowId}`;
      const size     = action.size     ?? DEFAULT_WINDOW_SIZES[action.app];
      const position = action.position ?? cascadePosition(state.windows);
      const appState = action.appState ?? defaultAppState(action.app, state.env);
      const newWindow: WindowEntry = {
        id,
        app: action.app,
        title: action.title,
        displayState: 'normal',
        position,
        size,
        zIndex: maxZIndex(state.windows) + 1,
        appState,
      };
      return {
        ...state,
        windows: [...state.windows, newWindow],
        nextWindowId: state.nextWindowId + 1,
        focusedWindowId: id,
      };
    }

    case 'WINDOW_CLOSE': {
      const remaining = state.windows.filter(w => w.id !== action.id);
      // Focus the highest-z visible window after close
      const nextFocus = remaining
        .filter(w => w.displayState !== 'minimized')
        .sort((a, b) => b.zIndex - a.zIndex)
        .at(0)?.id ?? null;
      return {
        ...state,
        windows: remaining,
        focusedWindowId: state.focusedWindowId === action.id ? nextFocus : state.focusedWindowId,
      };
    }

    case 'WINDOW_FOCUS': {
      const newZ = maxZIndex(state.windows) + 1;
      return {
        ...state,
        focusedWindowId: action.id,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w,
          zIndex: newZ,
          displayState: w.displayState === 'minimized' ? 'normal' : w.displayState,
        })),
      };
    }

    case 'WINDOW_MINIMIZE': {
      const remaining = state.windows
        .filter(w => w.id !== action.id && w.displayState !== 'minimized')
        .sort((a, b) => b.zIndex - a.zIndex);
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, displayState: 'minimized',
        })),
        focusedWindowId: state.focusedWindowId === action.id
          ? (remaining.at(0)?.id ?? null)
          : state.focusedWindowId,
      };
    }

    case 'WINDOW_MAXIMIZE':
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, displayState: 'maximized',
        })),
        focusedWindowId: action.id,
      };

    case 'WINDOW_RESTORE':
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, displayState: 'normal',
        })),
        focusedWindowId: action.id,
      };

    case 'WINDOW_MOVE':
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, position: { x: action.x, y: action.y },
        })),
      };

    case 'WINDOW_RESIZE':
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, size: { width: action.width, height: action.height },
        })),
      };

    case 'WINDOW_SET_TITLE':
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, title: action.title,
        })),
      };

    case 'WINDOW_UPDATE_APP_STATE':
      return {
        ...state,
        windows: mapWindow(state.windows, action.id, w => ({
          ...w, appState: action.appState,
        })),
      };

    // ── Processes ─────────────────────────────────────────────────────────────

    case 'PROCESS_SPAWN': {
      const pid = state.nextPid;
      return {
        ...state,
        nextPid: pid + 1,
        processes: [
          ...state.processes,
          {
            pid,
            name: action.name,
            status: 'running',
            startedAt: Date.now(),
            windowId: action.windowId,
          },
        ],
      };
    }

    case 'PROCESS_KILL':
      return {
        ...state,
        processes: state.processes.filter(p => p.pid !== action.pid),
      };

    case 'PROCESS_UPDATE_STATUS':
      return {
        ...state,
        processes: state.processes.map(p =>
          p.pid === action.pid ? { ...p, status: action.status } : p,
        ),
      };

    // ── Shell bridge ───────────────────────────────────────────────────────

    case 'VFS_REPLACE': {
      // The shell's VFS started as a clone of the machine VFS (remote + local
      // entries). Re-tag any entry that was originally remote: the shell only
      // creates file/dir entries, so any entry whose origin is still 'remote'
      // arrived intact from the clone and needs no re-tagging. Entries the
      // shell created are plain {kind:'file'|'dir'} objects — we defensively
      // ensure they carry origin:'local' so sessionStorage picks them up.
      const vfs: DesktopVFSMap = new Map();
      for (const [path, entry] of action.vfs) {
        if (entry.kind === 'file' || entry.kind === 'dir') {
          vfs.set(path, { ...entry, origin: entry.origin ?? 'local' } as DesktopVFSEntry);
        } else {
          vfs.set(path, entry);
        }
      }
      return { ...state, vfs };
    }

    // ── Boot ──────────────────────────────────────────────────────────────────

    case 'MACHINE_RESET':
      return action.state;

    default:
      return state;
  }
}
