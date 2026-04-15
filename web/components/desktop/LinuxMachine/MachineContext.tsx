'use client';

/**
 * LinuxMachine — React context + Kernel API
 *
 * This is the OS. It owns one DesktopVFSMap and exposes a stable `kernel`
 * object that is the syscall surface for every app in the desktop.
 *
 * Architecture:
 *   LinuxMachineProvider   ← holds useReducer, hydrates session, loads state file
 *     └── MachineContext   ← provides { state, kernel } to all descendants
 *           ├── TerminalApp  → calls kernel.syncShellVFS() after each command
 *           ├── BrowserApp   → calls kernel.writeFile() for downloads
 *           ├── EmailApp     → calls kernel.readFile('/var/mail/inbox/...')
 *           └── TextEditorApp → calls kernel.writeFile(path, content) on save
 *
 * The `kernel` object is intentionally stable (created once with useMemo +
 * a stateRef so reads always see fresh state without re-creating the object
 * on every VFS change).
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Dispatch,
} from 'react';

import type {
  MachineState,
  MachineAction,
  DesktopVFSMap,
  DesktopVFSEntry,
  AppId,
  AppState,
  KernelAPI,
  VFetchResponse,
  TerminalAppState,
  BrowserAppState,
  TextEditorAppState,
  EmailAppState,
  TicketAppState,
  FileExplorerAppState,
} from './MachineTypes';
import { machineReducer } from './MachineReducer';
import { buildInitialState, loadManifest, loadRemoteVFS } from './stateLoader';
import { serializeMachineState, deserializeMachineState, mergeLocalDelta } from './machineStorage';

// ─── VFS read helpers (used inside kernel, isolated from shell.ts) ─────────────

function kernelListDir(vfs: DesktopVFSMap, absDir: string): string[] {
  const prefix = absDir === '/' ? '/' : absDir + '/';
  const results: string[] = [];
  for (const key of vfs.keys()) {
    if (key === absDir) continue;
    if (!key.startsWith(prefix)) continue;
    const rest = key.slice(prefix.length);
    if (rest.length > 0 && !rest.includes('/')) results.push(rest);
  }
  return results.sort();
}

function kernelReadFile(vfs: DesktopVFSMap, path: string): string | null {
  const entry = vfs.get(path);
  if (!entry) return null;
  // Resolve one level of symlink
  if (entry.kind === 'symlink') {
    const target = vfs.get(entry.target);
    if (!target || target.kind !== 'file') return null;
    return target.content;
  }
  if (entry.kind !== 'file') return null;
  return entry.content;
}

// ─── sandbox:// URL parser ───────────────────────────────────────────────────────

/**
 * Parses a `sandbox://` launch URL into its components.
 *
 * Examples:
 *   sandbox://terminal?cwd=/var/log   → { slug:'terminal', segments:[], params:{cwd:'/var/log'} }
 *   sandbox://ticket-app/detail/42    → { slug:'ticket-app', segments:['detail','42'], params:{} }
 *   sandbox://file-explorer?cwd=/etc  → { slug:'file-explorer', segments:[], params:{cwd:'/etc'} }
 */
function parseSandboxUrl(url: string): {
  slug:     string;
  segments: string[];
  params:   URLSearchParams;
} {
  if (!url.startsWith('sandbox://')) {
    return { slug: '', segments: [], params: new URLSearchParams() };
  }
  const withoutScheme = url.slice('sandbox://'.length);
  const qIdx = withoutScheme.indexOf('?');
  const pathPart  = qIdx === -1 ? withoutScheme : withoutScheme.slice(0, qIdx);
  const queryPart = qIdx === -1 ? '' : withoutScheme.slice(qIdx + 1);
  const parts    = pathPart.split('/').filter(Boolean);
  const slug     = parts[0] ?? '';
  const segments = parts.slice(1);
  return { slug, segments, params: new URLSearchParams(queryPart) };
}

// ─── sessionStorage key ─────────────────────────────────────────────────────────

function sessionKey(machineId: string): string {
  return `linux-machine-${machineId}`;
}

// ─── Context shape ──────────────────────────────────────────────────────────────

export interface MachineContextValue {
  state: MachineState;
  dispatch: Dispatch<MachineAction>;
  kernel: KernelAPI;
  /** True while the endpoint is being fetched on first boot */
  booting: boolean;
  /** Non-null if the endpoint could not be loaded */
  bootError: string | null;
  /**
   * Base URL of the state endpoint, forwarded from props.
   * Apps use this to fetch their own sub-resources at window-open time:
   *   `loadAppResource(stateEndpoint, 'mail/inbox.json')`
   */
  stateEndpoint: string | undefined;
}

const MachineContext = createContext<MachineContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────────

export interface LinuxMachineProviderProps {
  children: ReactNode;
  /**
   * Unique ID used to scope this machine's sessionStorage entry.
   * Defaults to "default". Use a unique value per page if you embed
   * multiple <LinuxMachine> instances.
   */
  machineId?: string;
  /**
   * Base URL of the state endpoint, e.g. '/desktop-states/project-01'.
   * The provider fetches:
   *   {endpoint}/manifest.json  ← machine config
   *   {endpoint}/vfs.json       ← read-only baseline filesystem
   * If omitted, the machine boots with a generic blank filesystem.
   */
  stateEndpoint?: string;
}

export function LinuxMachineProvider({
  children,
  machineId = 'default',
  stateEndpoint,
}: LinuxMachineProviderProps) {
  // ── Bootstrap state ─────────────────────────────────────────────────────────
  // Lazy initializer: try local delta from sessionStorage, fall back to blank.
  // If there's a stateEndpoint, the boot effect below will fetch remote data
  // and call MACHINE_RESET with the merged result.
  const [state, dispatch] = useReducer(
    machineReducer,
    undefined,
    (): MachineState => {
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(sessionKey(machineId));
        if (raw) {
          const delta = deserializeMachineState(raw);
          // Return the partial (local-only) delta as the optimistic initial state.
          // The boot effect immediately fetches remote and replaces this via
          // MACHINE_RESET with a properly merged state.
          if (delta) return delta;
        }
      }
      return buildInitialState(null);
    },
  );

  const [booting,   setBooting]   = useState(!!stateEndpoint);
  const [bootError, setBootError] = useState<string | null>(null);

  // Prevent double-fetch in StrictMode / concurrent renders
  const hasFetchedRef = useRef(false);

  // ── Boot: fetch remote manifest + VFS, merge with local delta ────────────────
  useEffect(() => {
    if (!stateEndpoint || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function boot() {
      const manifest = await loadManifest(stateEndpoint!);
      if (!manifest) {
        setBootError(`Could not load desktop state: ${stateEndpoint}/manifest.json`);
        setBooting(false);
        return;
      }

      // vfs.json is optional — a manifest-only boot is valid
      const vfsPath = manifest.resources?.vfs ?? 'vfs.json';
      const remoteVFS = await loadRemoteVFS(stateEndpoint!, vfsPath);

      // Build the pure remote base (origin:'remote' entries only)
      const remoteBase = buildInitialState(manifest, remoteVFS ?? null, stateEndpoint);

      // Check for an existing local delta from this session
      const raw = typeof window !== 'undefined'
        ? sessionStorage.getItem(sessionKey(machineId))
        : null;
      const localDelta = raw ? deserializeMachineState(raw) : null;

      const finalState = localDelta
        ? mergeLocalDelta(remoteBase, localDelta)
        : remoteBase;

      dispatch({ type: 'MACHINE_RESET', state: finalState });
      setBooting(false);
    }

    boot();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── Persist to sessionStorage after every state change ───────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(sessionKey(machineId), serializeMachineState(state));
  }, [state, machineId]);

  // ── Stable kernel object ─────────────────────────────────────────────────────
  //
  // The kernel is created once via useMemo with [dispatch] as deps (dispatch is
  // stable for the lifetime of the component). State reads go through a ref so
  // they always see fresh values without re-creating the object on every render.
  //
  const stateRef = useRef(state);
  stateRef.current = state; // keep in sync with the latest render

  const kernel = useMemo<KernelAPI>(() => ({

    // ── VFS reads ─────────────────────────────────────────────────────────────

    readFile(path) {
      return kernelReadFile(stateRef.current.vfs, path);
    },

    readEntry(path): DesktopVFSEntry | undefined {
      return stateRef.current.vfs.get(path);
    },

    listDir(path) {
      return kernelListDir(stateRef.current.vfs, path);
    },

    exists(path) {
      return stateRef.current.vfs.has(path);
    },

    // ── VFS writes ────────────────────────────────────────────────────────────

    writeFile(path, content) {
      dispatch({ type: 'VFS_WRITE', path, content });
    },

    writeUrlEntry(path, href, mimeType) {
      dispatch({ type: 'VFS_WRITE_URL', path, href, mimeType });
    },

    mkdir(path, parents) {
      dispatch({ type: 'VFS_MKDIR', path, parents });
    },

    deleteEntry(path, recursive) {
      dispatch({ type: 'VFS_DELETE', path, recursive });
    },

    move(from, to) {
      dispatch({ type: 'VFS_MOVE', from, to });
    },

    // ── Shell bridge ──────────────────────────────────────────────────────────
    //
    // Called by TerminalApp after every shell command:
    //
    //   const result = shell.run(input, shellState);
    //   kernel.syncShellVFS(result.state.vfs as unknown as DesktopVFSMap);
    //   kernel.updateWindowAppState(windowId, { cwd: result.state.cwd, ... });
    //
    // The cast is safe: the shell's VFS started as a cloned copy of the machine
    // VFS (including any 'url'/'symlink' entries). Shell commands only ever
    // create 'file' / 'dir' entries, so any extended entries survive unchanged.

    syncShellVFS(vfs) {
      dispatch({ type: 'VFS_REPLACE', vfs });
    },

    // ── Window management ─────────────────────────────────────────────────────

    openWindow(app, title, appState, position) {
      dispatch({ type: 'WINDOW_OPEN', app, title, appState, position });
    },

    closeWindow(id) {
      dispatch({ type: 'WINDOW_CLOSE', id });
    },

    focusWindow(id) {
      dispatch({ type: 'WINDOW_FOCUS', id });
    },

    minimizeWindow(id) {
      dispatch({ type: 'WINDOW_MINIMIZE', id });
    },

    restoreWindow(id) {
      dispatch({ type: 'WINDOW_RESTORE', id });
    },

    maximizeWindow(id) {
      dispatch({ type: 'WINDOW_MAXIMIZE', id });
    },

    setWindowTitle(id, title) {
      dispatch({ type: 'WINDOW_SET_TITLE', id, title });
    },

    updateWindowAppState(id, appState) {
      dispatch({ type: 'WINDOW_UPDATE_APP_STATE', id, appState });
    },

    moveWindow(id, x, y) {
      dispatch({ type: 'WINDOW_MOVE', id, x, y });
    },

    resizeWindow(id, width, height) {
      dispatch({ type: 'WINDOW_RESIZE', id, width, height });
    },

    // ── Process management ────────────────────────────────────────────────────

    spawnProcess(name, windowId) {
      dispatch({ type: 'PROCESS_SPAWN', name, windowId });
    },

    killProcess(pid) {
      dispatch({ type: 'PROCESS_KILL', pid });
    },

    // ── Virtual HTTP (simulated network) ─────────────────────────────────────
    //
    // Routes:
    //   sandbox://api/{path}  → reads /var/api/{path}.json from VFS
    //                           → falls back to {stateEndpoint}/api/{path}
    //   anything else         → 404

    async vfetch(url: string): Promise<VFetchResponse> {
      const notFound = (): VFetchResponse => ({
        ok: false, status: 404, statusText: 'Not Found', data: null, text: '',
      });

      if (!url.startsWith('sandbox://api/')) return notFound();

      const subPath = url.slice('sandbox://api/'.length); // e.g. 'tickets/abc.json'

      // Try VFS first: /var/api/{subPath} (with or without .json extension)
      const vfsPath = subPath.endsWith('.json')
        ? `/var/api/${subPath}`
        : `/var/api/${subPath}.json`;

      const raw = kernelReadFile(stateRef.current.vfs, vfsPath);
      if (raw !== null) {
        let data: unknown = null;
        try { data = JSON.parse(raw); } catch { /* text-only */ }
        return { ok: true, status: 200, statusText: 'OK', data, text: raw };
      }

      // Fall back to real endpoint
      const endpoint = stateRef.current.stateEndpoint;
      if (endpoint) {
        try {
          const fetchUrl = `${endpoint.replace(/\/$/, '')}/api/${subPath}`;
          const res = await fetch(fetchUrl, { credentials: 'same-origin' });
          const text = await res.text();
          let data: unknown = null;
          try { data = JSON.parse(text); } catch { /* text-only */ }
          return {
            ok:         res.ok,
            status:     res.status,
            statusText: res.statusText,
            data,
            text,
          };
        } catch {
          return { ok: false, status: 503, statusText: 'Service Unavailable', data: null, text: '' };
        }
      }

      return notFound();
    },

    // ── "Open With" — sandbox:// URL dispatcher ────────────────────────────────
    //
    // Full app launch API.  Every desktop app is addressable by a canonical
    // sandbox:// URL.  Query-param style is preferred; legacy path style for
    // ticket-app and file-explorer is kept for backward compatibility.
    //
    // Route table:
    //   sandbox://terminal                          → Terminal (HOME cwd)
    //   sandbox://terminal?cwd=<path>               → Terminal at <path>
    //   sandbox://browser                           → Browser (about:home)
    //   sandbox://browser?url=<url>                 → Browser at <url>
    //   sandbox://text-editor                       → Text Editor (new buffer)
    //   sandbox://text-editor?path=<path>           → Text Editor opens <path>
    //   sandbox://email                             → Email (inbox)
    //   sandbox://email?view=compose                → Email compose
    //   sandbox://email?view=sent                   → Email sent
    //   sandbox://email?view=message&id=<id>        → Email message <id>
    //   sandbox://ticket-app                        → Ticket list
    //   sandbox://ticket-app?view=new               → New ticket
    //   sandbox://ticket-app?view=detail&id=<id>    → Ticket detail <id>
    //   sandbox://ticket-app/new                    → New ticket (legacy)
    //   sandbox://ticket-app/detail/<id>            → Ticket detail (legacy)
    //   sandbox://file-explorer                     → File Explorer (HOME)
    //   sandbox://file-explorer?cwd=<path>          → File Explorer at <path>
    //   sandbox://file-explorer/<path>              → File Explorer at <path> (legacy)

    openWith(url: string): void {
      if (!url.startsWith('sandbox://')) return;

      const { slug, segments, params } = parseSandboxUrl(url);
      const home = stateRef.current.env['HOME'] ?? '/home/user';

      switch (slug) {

        case 'terminal': {
          const cwd = params.get('cwd') ?? home;
          const appState: TerminalAppState = { cwd, history: [] };
          dispatch({ type: 'WINDOW_OPEN', app: 'terminal', title: 'Terminal', appState });
          break;
        }

        case 'browser': {
          const target = params.get('url') ?? 'about:home';
          const appState: BrowserAppState = { url: target, history: [target], historyIndex: 0 };
          dispatch({ type: 'WINDOW_OPEN', app: 'browser', title: 'Browser', appState });
          break;
        }

        case 'text-editor': {
          const filePath = params.get('path') ?? null;
          const content  = filePath ? (kernelReadFile(stateRef.current.vfs, filePath) ?? '') : '';
          const title    = filePath ? (filePath.split('/').at(-1) ?? 'Text Editor') : 'Text Editor';
          const appState: TextEditorAppState = { filePath, content, dirty: false, cursorLine: 1, cursorCol: 1 };
          dispatch({ type: 'WINDOW_OPEN', app: 'text-editor', title, appState });
          break;
        }

        case 'email': {
          const rawView = params.get('view') ?? 'inbox';
          const view = (['inbox', 'compose', 'sent', 'message'] as const).includes(
            rawView as EmailAppState['view'],
          )
            ? (rawView as EmailAppState['view'])
            : ('inbox' as const);
          const openMessageId = params.get('id') ?? undefined;
          const appState: EmailAppState = { view, openMessageId };
          dispatch({ type: 'WINDOW_OPEN', app: 'email', title: 'Email', appState });
          break;
        }

        case 'ticket-app': {
          // Query-param style takes priority; legacy path style as fallback.
          const viewParam = params.get('view');
          const idParam   = params.get('id');
          const sub       = segments[0] ?? '';
          let appState: TicketAppState;
          if (viewParam === 'new' || sub === 'new') {
            appState = { view: 'new' };
          } else if ((viewParam === 'detail' && idParam) || (sub === 'detail' && segments[1])) {
            appState = { view: 'detail', openTicketId: idParam ?? segments[1] };
          } else {
            appState = { view: 'list' };
          }
          dispatch({ type: 'WINDOW_OPEN', app: 'ticket-app', title: 'Ticket Manager', appState });
          break;
        }

        case 'file-explorer': {
          // Query-param style takes priority; legacy path segments as fallback.
          const cwdParam  = params.get('cwd');
          const pathParts = segments.join('/');
          const cwd = cwdParam
            ?? (pathParts ? (pathParts.startsWith('/') ? pathParts : `/${pathParts}`) : home);
          const appState: FileExplorerAppState = { cwd, selectedPath: null };
          dispatch({ type: 'WINDOW_OPEN', app: 'file-explorer', title: 'File Explorer', appState });
          break;
        }

        default:
          // Unrecognised slug — silently ignore
          break;
      }
    },

  // dispatch is stable for the lifetime of the component — kernel is created once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dispatch]);

  const value = useMemo<MachineContextValue>(
    () => ({ state, dispatch, kernel, booting, bootError, stateEndpoint }),
    [state, dispatch, kernel, booting, bootError, stateEndpoint],
  );

  return (
    <MachineContext.Provider value={value}>
      {children}
    </MachineContext.Provider>
  );
}

// ─── Consumer hooks ─────────────────────────────────────────────────────────────

/** Full context — use when you need both state and kernel. */
export function useMachine(): MachineContextValue {
  const ctx = useContext(MachineContext);
  if (!ctx) {
    throw new Error('useMachine() must be called inside <LinuxMachineProvider>');
  }
  return ctx;
}

/**
 * Kernel-only hook — use in app components that only call syscalls.
 * Does NOT subscribe to state changes, so the component won't re-render
 * on every VFS write. Use for pure write-only components.
 */
export function useKernel(): KernelAPI {
  const ctx = useContext(MachineContext);
  if (!ctx) {
    throw new Error('useKernel() must be called inside <LinuxMachineProvider>');
  }
  return ctx.kernel;
}

/**
 * State-only hook — use in components that render from state but don't
 * need to call kernel methods directly.
 */
export function useMachineState(): MachineState {
  const ctx = useContext(MachineContext);
  if (!ctx) {
    throw new Error('useMachineState() must be called inside <LinuxMachineProvider>');
  }
  return ctx.state;
}

/**
 * Returns the base endpoint URL for the current machine session.
 * Apps call this to construct sub-resource URLs:
 *
 *   const endpoint = useStateEndpoint();
 *   const inbox = await loadAppResource(endpoint, 'mail/inbox.json');
 *
 * Returns undefined when the machine was booted without an endpoint.
 */
export function useStateEndpoint(): string | undefined {
  const ctx = useContext(MachineContext);
  if (!ctx) {
    throw new Error('useStateEndpoint() must be called inside <LinuxMachineProvider>');
  }
  return ctx.stateEndpoint;
}
