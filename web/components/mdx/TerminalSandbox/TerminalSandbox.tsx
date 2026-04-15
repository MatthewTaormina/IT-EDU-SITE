'use client';

/**
 * TerminalSandbox — Part 4 of TerminalSandbox
 *
 * A React client component that renders a dark terminal window backed by the
 * VFS + Shell + Git plugin built in Parts 1–3.
 *
 * Intentionally stays dark regardless of the site's light/dark theme.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { createVFS } from './vfs';
import { createShell, createShellState, type ShellState, type OutputLine } from './shell';
import { gitPlugin } from './gitPlugin';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TerminalSandboxProps {
  /** Files to pre-populate in the VFS before first command. */
  preload?: Record<string, string>;
  /** Working directory the shell starts in. Defaults to '/home/user'. */
  initialCwd?: string;
  /** Commands to run automatically on mount (tutorial setup steps). */
  initialCommands?: string[];
  /** Whether to mount the git plugin. Defaults to true. */
  git?: boolean;
  /** Terminal height as a CSS value, e.g. '24rem' or '400px'. Defaults to '24rem'. */
  height?: string;
  /** Label shown in the title bar. */
  label?: string;
}

// ─── Displayed line (includes the echoed prompt+command) ──────────────────────

interface DisplayLine {
  id: number;
  kind: OutputLine['kind'] | 'command';
  text: string;
}

// ─── Colour constants (terminal always dark) ──────────────────────────────────

const COLORS = {
  bg:      '#0d1117',
  border:  '#30363d',
  bar:     '#161b22',
  fg:      '#e6edf3',
  prompt:  '#58a6ff',
  stderr:  '#f85149',
  info:    '#3fb950',
  muted:   '#8b949e',
  command: '#e6edf3',
} as const;

// ─── Shell factory (extracted so it can be called on Reset too) ────────────────

function buildShell(withGit: boolean) {
  const shell = createShell();
  if (withGit) shell.registerPlugin(gitPlugin);
  return shell;
}

function buildInitialState(
  preload: Record<string, string> | undefined,
  initialCwd: string | undefined,
): ShellState {
  const vfs = createVFS(preload);
  return createShellState(vfs, initialCwd ? { cwd: initialCwd } : undefined);
}

// ─── Prompt string helper ──────────────────────────────────────────────────────

function formatPrompt(state: ShellState): string {
  const home = state.env['HOME'] ?? '/home/user';
  const cwd = state.cwd === home
    ? '~'
    : state.cwd.startsWith(home + '/')
      ? '~' + state.cwd.slice(home.length)
      : state.cwd;
  return `${cwd} $ `;
}

// ─── Component ────────────────────────────────────────────────────────────────

let lineId = 0;
function nextId() { return ++lineId; }

export default function TerminalSandbox({
  preload,
  initialCwd,
  initialCommands = [],
  git = true,
  height = '24rem',
  label,
}: TerminalSandboxProps) {
  // Shell is stable for the lifetime of this mount; Reset replaces everything.
  const shellRef = useRef(buildShell(git));

  const [shellState, setShellState] = useState<ShellState>(() =>
    buildInitialState(preload, initialCwd),
  );
  const [lines, setLines] = useState<DisplayLine[]>([]);
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);   // -1 = not browsing history

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Scroll to bottom whenever lines change ──────────────────────────────────
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // ── Run a command and update display ───────────────────────────────────────
  const runCommand = useCallback((cmd: string, state: ShellState): ShellState => {
    const prompt = formatPrompt(state);
    const result = shellRef.current.run(cmd, state);

    const newDisplayLines: DisplayLine[] = [];

    // Echo the command (unless it's a silent auto-run setup command with no text)
    if (cmd.trim()) {
      newDisplayLines.push({ id: nextId(), kind: 'command', text: prompt + cmd });
    }

    for (const line of result.output) {
      newDisplayLines.push({ id: nextId(), kind: line.kind, text: line.text });
    }

    if (result.clear) {
      setLines(newDisplayLines.filter(l => l.kind !== 'command' || cmd.trim() === ''));
    } else {
      setLines(prev => [...prev, ...newDisplayLines]);
    }

    return result.state;
  }, []);

  // ── Play initial commands on mount ─────────────────────────────────────────
  useEffect(() => {
    if (initialCommands.length === 0) return;
    let state = buildInitialState(preload, initialCwd);
    for (const cmd of initialCommands) {
      state = runCommand(cmd, state);
    }
    setShellState(state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount only

  // ── Submit handler ─────────────────────────────────────────────────────────
  function handleSubmit() {
    const cmd = input;
    setInput('');
    setHistIdx(-1);
    const next = runCommand(cmd, shellState);
    setShellState(next);
  }

  // ── Keyboard handler ───────────────────────────────────────────────────────
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }

    const history = shellState.history;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(history[next] ?? '');
      }
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function handleReset() {
    shellRef.current = buildShell(git);
    lineId = 0;
    const fresh = buildInitialState(preload, initialCwd);
    setLines([]);
    setInput('');
    setHistIdx(-1);

    if (initialCommands.length > 0) {
      let state = fresh;
      for (const cmd of initialCommands) {
        state = runCommand(cmd, state);
      }
      setShellState(state);
    } else {
      setShellState(fresh);
    }
  }

  // ── Line colour ────────────────────────────────────────────────────────────
  function lineColor(kind: DisplayLine['kind']): string {
    switch (kind) {
      case 'stderr':  return COLORS.stderr;
      case 'info':    return COLORS.info;
      case 'command': return COLORS.fg;
      default:        return COLORS.fg;
    }
  }

  const prompt = formatPrompt(shellState);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      role="region"
      aria-label={label ?? 'Terminal sandbox'}
      style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}
      className="rounded-lg border overflow-hidden font-mono text-sm my-6 not-prose"
    >
      {/* Title bar */}
      <div
        style={{ backgroundColor: COLORS.bar, borderColor: COLORS.border }}
        className="flex items-center justify-between px-4 py-2 border-b select-none"
      >
        {/* Traffic-light dots */}
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block" />
          </span>
          {label && (
            <span style={{ color: COLORS.muted }} className="text-xs">
              {label}
            </span>
          )}
        </div>

        <button
          onClick={handleReset}
          aria-label="Reset terminal"
          style={{ color: COLORS.muted, borderColor: COLORS.border }}
          className="text-xs px-2 py-0.5 rounded border hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff] transition-opacity"
        >
          Reset
        </button>
      </div>

      {/* Output area */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        ref={outputRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => inputRef.current?.focus()}
        style={{ backgroundColor: COLORS.bg, height, color: COLORS.fg }}
        className="overflow-y-auto px-4 pt-3 pb-1 cursor-text"
      >
        {lines.map(line => (
          <pre
            key={line.id}
            style={{ color: lineColor(line.kind) }}
            className="whitespace-pre-wrap break-words font-mono leading-relaxed m-0 p-0"
          >
            {line.text}
          </pre>
        ))}
      </div>

      {/* Input line */}
      <div
        style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}
        className="flex items-center px-4 py-2 border-t gap-0"
      >
        <span
          style={{ color: COLORS.prompt }}
          aria-hidden="true"
          className="font-mono text-sm whitespace-pre shrink-0"
        >
          {prompt}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setHistIdx(-1); }}
          onKeyDown={handleKeyDown}
          aria-label="Terminal input"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          style={{
            backgroundColor: 'transparent',
            color: COLORS.fg,
            caretColor: COLORS.fg,
            outline: 'none',
          }}
          className="flex-1 font-mono text-sm min-w-0 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
