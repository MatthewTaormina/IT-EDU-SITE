'use client';

/**
 * LinuxMachine — TerminalApp
 *
 * The terminal window component. Hosts the shell.ts interpreter from TerminalSandbox,
 * bridging it into the MachineContext VFS so that file operations are shared across
 * all desktop apps.
 *
 * Shell ↔ Machine VFS bridge
 * ─────────────────────────
 * The machine uses DesktopVFSMap which has 'url' and 'symlink' entry kinds plus an
 * `origin` tag.  The shell only knows VFSMap (plain file/dir).  On each command:
 *   1. Shell runs against its local VFSMap copy (seeded from last sync).
 *   2. After the command, mergeShellVFS() reconstructs the full DesktopVFSMap by:
 *      - Preserving all url/symlink entries from the original (shell can't touch them).
 *      - Carrying over origin tags where content is unchanged; new/changed entries
 *        become origin:'local' so sessionStorage picks them up.
 *   3. kernel.syncShellVFS(merged) dispatches VFS_REPLACE to update machine state.
 *
 * Nano
 * ────
 * `nano [file]` is intercepted before reaching the shell.  The terminal switches to
 * a full-window TUI overlay (NanoView) with standard nano key bindings.  On save,
 * kernel.writeFile() is called directly so the file is immediately visible to other apps.
 *
 * AODA
 * ────
 * - aria-live="polite" on the output buffer (each new line is announced).
 * - role="alert" + aria-live="assertive" on stderr lines.
 * - Hidden sr-only live region for nano status announcements.
 * - Ctrl+G displays key bindings in the sr-only region.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {
  createShell,
  createShellState,
  type ShellState,
  type OutputLine,
} from '../../../mdx/TerminalSandbox/shell';
import { gitPlugin } from '../../../mdx/TerminalSandbox/gitPlugin';
import type { VFSMap } from '../../../mdx/TerminalSandbox/vfs';
import { useKernel, useMachineState } from '../../LinuxMachine/MachineContext';
import type {
  DesktopVFSMap,
  DesktopVFSEntry,
  TerminalAppState,
  VFSOrigin,
} from '../../LinuxMachine/MachineTypes';

// ─── VFS bridge helpers ───────────────────────────────────────────────────────

/**
 * Strip DesktopVFSMap down to a plain VFSMap the shell can work with.
 * 'url' and 'symlink' entries are dropped — the shell can't operate on them.
 */
function desktopVFSToShellVFS(desktopVFS: DesktopVFSMap): VFSMap {
  const shellVFS: VFSMap = new Map();
  for (const [path, entry] of desktopVFS) {
    if (entry.kind === 'file') {
      shellVFS.set(path, { kind: 'file', content: entry.content });
    } else if (entry.kind === 'dir') {
      shellVFS.set(path, { kind: 'dir' });
    }
    // url + symlink entries omitted
  }
  return shellVFS;
}

/**
 * Reconstruct a DesktopVFSMap after the shell has run a command.
 *
 * Merge rules:
 *   • All 'url' and 'symlink' entries from the original are preserved (shell
 *     can never create or delete them).
 *   • File/dir entries that the shell left unchanged keep their original
 *     origin tag so read-only remote content is not promoted to 'local'.
 *   • Entries the shell created or modified become origin:'local'.
 *   • Entries that existed as file/dir in the original but are missing from
 *     the shell VFS result (deleted by the shell) are omitted.
 */
function mergeShellVFS(
  shellVFS: VFSMap,
  originalDesktopVFS: DesktopVFSMap,
): DesktopVFSMap {
  const result: DesktopVFSMap = new Map();

  // Step 1 — carry over entries the shell cannot modify
  for (const [path, entry] of originalDesktopVFS) {
    if (entry.kind === 'url' || entry.kind === 'symlink') {
      result.set(path, entry);
    }
  }

  // Step 2 — overlay shell results, preserving origin where content is unchanged
  for (const [path, entry] of shellVFS) {
    const orig = originalDesktopVFS.get(path);
    if (entry.kind === 'file') {
      const unchanged =
        orig?.kind === 'file' && orig.content === entry.content;
      const origin: VFSOrigin = unchanged ? (orig as { origin: VFSOrigin }).origin : 'local';
      const readOnly =
        orig && 'readOnly' in orig && orig.readOnly ? true : undefined;
      const e: DesktopVFSEntry = readOnly
        ? { kind: 'file', content: entry.content, readOnly, origin }
        : { kind: 'file', content: entry.content, origin };
      result.set(path, e);
    } else {
      const origin: VFSOrigin = orig?.kind === 'dir' ? orig.origin : 'local';
      result.set(path, { kind: 'dir', origin });
    }
  }

  return result;
}

// ─── Nano TUI types ───────────────────────────────────────────────────────────

type NanoPendingAction = 'quit-confirm';

interface NanoState {
  filePath: string | null;
  content: string;
  dirty: boolean;
  /** Status text displayed in the nano footer and announced via aria-live */
  announcement: string;
  /** Non-null when we're waiting for Y/N confirmation */
  pendingAction: NanoPendingAction | null;
}

// ─── Shell singleton factory ──────────────────────────────────────────────────

function makeShell() {
  const shell = createShell();
  shell.registerPlugin(gitPlugin);
  return shell;
}

// ─── TerminalApp ──────────────────────────────────────────────────────────────

export interface TerminalAppProps {
  /** Machine window ID — used to update window appState in the kernel */
  windowId: string;
  /** Last-saved app state for this window (cwd / history) */
  appState: TerminalAppState;
}

export function TerminalApp({ windowId, appState }: TerminalAppProps) {
  const kernel       = useKernel();
  const machineState = useMachineState();

  // ── Shell (created once per mount) ─────────────────────────────────────
  const shellRef = useRef<ReturnType<typeof makeShell>>(null!);
  if (!shellRef.current) shellRef.current = makeShell();

  // ── Shell state (owns the working-copy VFS) ─────────────────────────────
  const [shellState, setShellState] = useState<ShellState>(() =>
    createShellState(desktopVFSToShellVFS(machineState.vfs), {
      cwd: appState.cwd,
      env: { ...machineState.env },
      history: appState.history,
    }),
  );

  // ── Output lines ────────────────────────────────────────────────────────
  const [lines, setLines] = useState<OutputLine[]>([
    { kind: 'info', text: `Welcome to ${machineState.hostname}. Type 'help' for available commands.` },
  ]);

  // ── CLI input ───────────────────────────────────────────────────────────
  const [inputValue,  setInputValue]  = useState('');
  const [historyPos,  setHistoryPos]  = useState(-1); // −1 = typing new cmd

  // ── Nano state ──────────────────────────────────────────────────────────
  const [nano, setNano] = useState<NanoState | null>(null);

  // ── DOM refs ────────────────────────────────────────────────────────────
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const nanoTextRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Focus the active input on container click
  const handleContainerClick = useCallback(() => {
    (nano ? nanoTextRef : inputRef).current?.focus();
  }, [nano]);

  // ── Run a shell command ─────────────────────────────────────────────────
  const runCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();

      // ── Intercept: nano ────────────────────────────────────────────────
      const nanoMatch = /^nano(?:\s+(.+))?$/.exec(trimmed);
      if (nanoMatch !== null) {
        const rawPath = nanoMatch[1]?.trim() ?? null;
        const absPath = rawPath
          ? rawPath.startsWith('/')
            ? rawPath
            : `${shellState.cwd}/${rawPath}`
          : null;

        const existingContent = absPath ? (kernel.readFile(absPath) ?? '') : '';

        setShellState(s => ({ ...s, history: [...s.history, trimmed] }));
        setHistoryPos(-1);
        setInputValue('');
        setLines(prev => [
          ...prev,
          { kind: 'info', text: `${shellState.cwd}$ ${trimmed}` },
        ]);
        setNano({
          filePath: absPath,
          content: existingContent,
          dirty: false,
          announcement: absPath ? `nano: editing ${absPath}` : 'nano: new buffer',
          pendingAction: null,
        });
        return;
      }

      // ── Normal shell command ───────────────────────────────────────────
      const result = shellRef.current.run(trimmed, shellState);

      if (result.clear) {
        setLines([]);
      } else {
        setLines(prev => [
          ...prev,
          { kind: 'info', text: `${shellState.cwd}$ ${trimmed}` },
          ...result.output,
        ]);
      }

      setShellState(result.state);
      setHistoryPos(-1);
      setInputValue('');

      // Sync changed VFS entries back to the machine
      const merged = mergeShellVFS(result.state.vfs, machineState.vfs);
      kernel.syncShellVFS(merged);

      // Persist cwd + history to the window's appState
      kernel.updateWindowAppState(windowId, {
        cwd: result.state.cwd,
        history: result.state.history,
      } satisfies TerminalAppState);
    },
    [shellState, machineState.vfs, kernel, windowId],
  );

  // ── CLI keyboard handler ────────────────────────────────────────────────
  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runCommand(inputValue);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const hist = shellState.history;
        if (hist.length === 0) return;
        const next = Math.min(historyPos + 1, hist.length - 1);
        setHistoryPos(next);
        setInputValue(hist[hist.length - 1 - next] ?? '');
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyPos <= 0) {
          setHistoryPos(-1);
          setInputValue('');
          return;
        }
        const next = historyPos - 1;
        const hist = shellState.history;
        setHistoryPos(next);
        setInputValue(hist[hist.length - 1 - next] ?? '');
        return;
      }

      // Ctrl+C — cancel current line
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        setLines(prev => [
          ...prev,
          { kind: 'info', text: `${shellState.cwd}$ ${inputValue}^C` },
        ]);
        setInputValue('');
        setHistoryPos(-1);
        return;
      }

      // Ctrl+L — clear screen
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setLines([]);
        return;
      }
    },
    [inputValue, historyPos, shellState, runCommand],
  );

  // ── Nano: save current buffer ─────────────────────────────────────────────
  const nanoSaveBuffer = useCallback(
    (currentNano: NanoState): boolean => {
      if (!currentNano.filePath) return false;
      kernel.writeFile(currentNano.filePath, currentNano.content);
      // Keep terminal shell VFS in sync too
      setShellState(s => {
        const newVFS: VFSMap = new Map(s.vfs);
        newVFS.set(currentNano.filePath!, {
          kind: 'file',
          content: currentNano.content,
        });
        return { ...s, vfs: newVFS };
      });
      return true;
    },
    [kernel],
  );

  // ── Nano: close the editor ──────────────────────────────────────────────
  const nanoClose = useCallback(
    (savedPath: string | null) => {
      setNano(null);
      setLines(prev => [
        ...prev,
        {
          kind: 'info' as const,
          text: savedPath ? `nano: wrote ${savedPath}` : 'nano: closed',
        },
      ]);
      // Return focus to CLI input
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [],
  );

  // ── Nano keyboard handler ───────────────────────────────────────────────
  const handleNanoKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!nano) return;

      if (e.ctrlKey) {
        const key = e.key.toLowerCase();

        if (key === 'x') {
          e.preventDefault();
          if (nano.dirty && nano.pendingAction === null) {
            // First ^X on a dirty buffer → ask to save
            setNano(s =>
              s
                ? {
                    ...s,
                    pendingAction: 'quit-confirm',
                    announcement: 'Save modified buffer? (Y = Yes  N = Discard  ^C = Cancel)',
                  }
                : null,
            );
          } else {
            nanoClose(null);
          }
          return;
        }

        if (key === 'o' || key === 's') {
          e.preventDefault();
          if (nanoSaveBuffer(nano)) {
            setNano(s =>
              s ? { ...s, dirty: false, announcement: `Wrote ${s.filePath}` } : null,
            );
          } else {
            setNano(s =>
              s
                ? { ...s, announcement: 'No file name. Specify a file with nano <path>.' }
                : null,
            );
          }
          return;
        }

        if (key === 'k') {
          // Cut current line
          e.preventDefault();
          const ta = nanoTextRef.current;
          if (!ta) return;
          const pos   = ta.selectionStart ?? 0;
          const allLines = nano.content.split('\n');
          let offset = 0;
          let lineIdx = 0;
          for (let i = 0; i < allLines.length; i++) {
            if (offset + allLines[i].length >= pos) { lineIdx = i; break; }
            offset += allLines[i].length + 1;
          }
          const newLines = [...allLines];
          newLines.splice(lineIdx, 1);
          setNano(s =>
            s ? { ...s, content: newLines.join('\n'), dirty: true, announcement: 'Cut line' } : null,
          );
          return;
        }

        if (key === 'g') {
          e.preventDefault();
          setNano(s =>
            s
              ? {
                  ...s,
                  announcement:
                    'Keys: ^X Exit  ^O Write  ^K Cut Line  ^G Help  ^C Cancel',
                }
              : null,
          );
          return;
        }

        if (key === 'c') {
          if (nano.pendingAction) {
            e.preventDefault();
            setNano(s => s ? { ...s, pendingAction: null, announcement: 'Cancelled.' } : null);
          }
          return;
        }
      }

      // Y/N when confirming quit
      if (nano.pendingAction === 'quit-confirm') {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          const saved = nanoSaveBuffer(nano);
          nanoClose(saved ? nano.filePath : null);
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          nanoClose(null);
          return;
        }
      }

      // Any printable key clears a pending quit-confirm
      if (
        nano.pendingAction &&
        (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter')
      ) {
        setNano(s => s ? { ...s, pendingAction: null } : null);
        return;
      }

      // Mark buffer dirty on any text mutation key
      if (!nano.dirty && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter')) {
        setNano(s => s ? { ...s, dirty: true } : null);
      }
    },
    [nano, nanoSaveBuffer, nanoClose],
  );

  // ── Render: nano mode ───────────────────────────────────────────────────
  if (nano) {
    return (
      <NanoView
        nano={nano}
        textRef={nanoTextRef}
        onChange={content => setNano(s => s ? { ...s, content, dirty: true } : null)}
        onKeyDown={handleNanoKeyDown}
      />
    );
  }

  // ── Render: terminal mode ──────────────────────────────────────────────
  const prompt = `${shellState.cwd}$ `;

  return (
    <div
      className="flex flex-col h-full font-mono text-sm select-text"
      style={{ background: '#0d1117', color: '#c9d1d9' }}
      onClick={handleContainerClick}
    >
      {/* Output buffer */}
      <div
        className="flex-1 overflow-y-auto p-3"
        aria-label="Terminal output"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {lines.map((line, i) => (
          <OutputRow key={i} line={line} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        className="flex items-center gap-1 px-3 py-2 shrink-0 border-t"
        style={{ borderColor: '#21262d' }}
      >
        <span
          className="shrink-0"
          style={{ color: '#3fb950' }}
          aria-hidden="true"
        >
          {prompt}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={`Shell input — current directory: ${shellState.cwd}`}
          className="flex-1 bg-transparent outline-none min-w-0"
          style={{ color: '#c9d1d9', caretColor: '#3fb950' }}
          onChange={e => {
            setInputValue(e.target.value);
            setHistoryPos(-1);
          }}
          onKeyDown={handleInputKeyDown}
        />
      </div>
    </div>
  );
}

// ─── Output line renderer ──────────────────────────────────────────────────────

function OutputRow({ line }: { line: OutputLine }) {
  const color =
    line.kind === 'stderr' ? '#ff7b72' :
    line.kind === 'info'   ? '#6e7681' :
    '#c9d1d9';

  return (
    <div
      style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: '1.5' }}
      role={line.kind === 'stderr' ? 'alert' : undefined}
    >
      {line.text}
    </div>
  );
}

// ─── Nano TUI ──────────────────────────────────────────────────────────────────

interface NanoViewProps {
  nano:      NanoState;
  textRef:   RefObject<HTMLTextAreaElement | null>;
  onChange:  (content: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

const NANO_BINDINGS = [
  ['^G', 'Help'],
  ['^X', 'Exit'],
  ['^O', 'Write'],
  ['^K', 'Cut'],
  ['^C', 'Cancel'],
] as const;

function NanoView({ nano, textRef, onChange, onKeyDown }: NanoViewProps) {
  const displayName = nano.filePath
    ? nano.filePath.split('/').pop() ?? nano.filePath
    : 'New Buffer';
  const title = `GNU nano — ${displayName}${nano.dirty ? ' *' : ''}`;

  const statusText =
    nano.pendingAction === 'quit-confirm'
      ? 'Save modified buffer? (Y = Yes  N = Discard  ^C = Cancel)'
      : nano.announcement || '\u00a0';

  return (
    <div
      className="flex flex-col h-full font-mono text-sm"
      style={{ background: '#0d1117', color: '#c9d1d9' }}
      role="application"
      aria-label={`nano text editor${nano.filePath ? `: ${nano.filePath}` : ''}`}
    >
      {/* ── Title bar ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 text-center py-1 px-3 text-xs font-semibold"
        style={{ background: '#161b22', color: '#58a6ff' }}
        aria-hidden="true"
      >
        {title}
      </div>

      {/* ── Editor area ───────────────────────────────────────────────── */}
      <textarea
        ref={textRef}
        value={nano.content}
        autoFocus
        spellCheck={false}
        className="flex-1 p-3 bg-transparent resize-none outline-none"
        style={{ color: '#c9d1d9', caretColor: '#58a6ff' }}
        aria-label={
          `Text editor${nano.filePath ? ` — ${nano.filePath}` : ''}. ` +
          (nano.dirty ? 'Has unsaved changes.' : 'No unsaved changes.')
        }
        aria-multiline="true"
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      {/* ── Status line ───────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-3 py-1 text-xs"
        style={{ background: '#161b22', color: '#f0883e' }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusText}
      </div>

      {/* ── Key binding bar ───────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-wrap gap-x-5 gap-y-0.5 px-3 py-1 text-xs"
        style={{ background: '#21262d', color: '#8b949e' }}
        aria-label="Nano key bindings"
      >
        {NANO_BINDINGS.map(([key, label]) => (
          <span key={key}>
            <kbd
              className="not-italic font-semibold"
              style={{ color: '#c9d1d9' }}
              aria-label={key.replace('^', 'Control+')}
            >
              {key}
            </kbd>
            {' '}{label}
          </span>
        ))}
      </div>

      {/* ── Screen-reader-only live region ────────────────────────────── */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {nano.announcement}
      </div>
    </div>
  );
}
