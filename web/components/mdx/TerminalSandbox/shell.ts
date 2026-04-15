/**
 * Linux Shell Interpreter — Part 2 of TerminalSandbox
 *
 * Pure TypeScript — no React, no side-effects outside the returned state.
 * Receives a command string + current ShellState, returns new state + output.
 *
 * External modules (e.g. the git plugin) register themselves via
 * `createShell()` → `shell.registerPlugin(plugin)`.
 */

import {
  type VFSMap,
  type VFSEntry,
  resolvePath,
  parentOf,
  basename,
  listDir,
  ensureDirs,
  cloneVFS,
} from './vfs';

// ─── Public types ──────────────────────────────────────────────────────────────

export type OutputLine =
  | { kind: 'stdout'; text: string }
  | { kind: 'stderr'; text: string }
  | { kind: 'info';   text: string };

export interface ShellState {
  vfs: VFSMap;
  cwd: string;
  env: Record<string, string>;
  history: string[];
}

export interface CommandResult {
  output: OutputLine[];
  /** True when the UI should clear the visible output buffer. */
  clear?: boolean;
  state: ShellState;
}

export type CommandPlugin = {
  /** Top-level command token, e.g. 'git'. Must be lowercase. */
  name: string;
  run: (args: string[], state: ShellState) => CommandResult;
};

export interface Shell {
  run: (input: string, state: ShellState) => CommandResult;
  registerPlugin: (plugin: CommandPlugin) => void;
}

// ─── Factory ───────────────────────────────────────────────────────────────────

export function createShell(): Shell {
  const plugins = new Map<string, CommandPlugin>();

  function registerPlugin(plugin: CommandPlugin): void {
    plugins.set(plugin.name, plugin);
  }

  function run(input: string, state: ShellState): CommandResult {
    const trimmed = input.trim();

    // Empty input — just push to history and return
    if (!trimmed) {
      return { output: [], state: { ...state, history: [...state.history, input] } };
    }

    const tokens = tokenise(trimmed);
    const [cmd, ...rawArgs] = tokens;

    // Check for output redirect:  cmd arg1 arg2 > file.txt
    let redirectTarget: string | null = null;
    let args = rawArgs;
    const gtIdx = rawArgs.indexOf('>');
    if (gtIdx !== -1) {
      redirectTarget = rawArgs[gtIdx + 1] ?? null;
      args = rawArgs.slice(0, gtIdx);
    }

    const newHistory = [...state.history, trimmed];
    const baseState: ShellState = { ...state, history: newHistory };

    let result: CommandResult;

    // Dispatch to plugin first, then builtins
    if (plugins.has(cmd)) {
      result = plugins.get(cmd)!.run(args, baseState);
    } else {
      result = dispatch(cmd, args, baseState);
    }

    // Handle > redirect: write stdout lines to a file
    if (redirectTarget && result.output.length > 0) {
      const absTarget = resolvePath(result.state.cwd, redirectTarget);
      const content = result.output
        .filter(l => l.kind === 'stdout')
        .map(l => l.text)
        .join('\n');
      ensureDirs(result.state.vfs, absTarget);
      result.state.vfs.set(absTarget, { kind: 'file', content });
      // Suppress stdout from terminal display when redirected
      result = {
        ...result,
        output: result.output.filter(l => l.kind !== 'stdout'),
      };
    }

    return result;
  }

  return { run, registerPlugin };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Tokenise a command line, respecting "double quoted" strings. */
function tokenise(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ' ' && !inQuote) {
      if (current.length > 0) { tokens.push(current); current = ''; }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function stdout(text: string): OutputLine { return { kind: 'stdout', text }; }
function stderr(text: string): OutputLine { return { kind: 'stderr', text }; }
function info(text: string):   OutputLine { return { kind: 'info',   text }; }

function ok(lines: OutputLine[], state: ShellState): CommandResult {
  return { output: lines, state };
}
function err(message: string, state: ShellState): CommandResult {
  return { output: [stderr(message)], state };
}

/** Expand ~ in a path using HOME env var. */
function expandHome(path: string, env: Record<string, string>): string {
  if (path === '~') return env['HOME'] ?? '/';
  if (path.startsWith('~/')) return (env['HOME'] ?? '') + path.slice(1);
  return path;
}

// ─── Command dispatch ─────────────────────────────────────────────────────────

function dispatch(cmd: string, args: string[], state: ShellState): CommandResult {
  switch (cmd) {
    case 'pwd':    return cmdPwd(args, state);
    case 'ls':     return cmdLs(args, state);
    case 'cd':     return cmdCd(args, state);
    case 'mkdir':  return cmdMkdir(args, state);
    case 'touch':  return cmdTouch(args, state);
    case 'cat':    return cmdCat(args, state);
    case 'echo':   return cmdEcho(args, state);
    case 'rm':     return cmdRm(args, state);
    case 'mv':     return cmdMv(args, state);
    case 'cp':     return cmdCp(args, state);
    case 'clear':  return { output: [], clear: true, state };
    case 'help':   return cmdHelp(state);
    default:
      return err(`${cmd}: command not found`, state);
  }
}

// ─── Built-in implementations ─────────────────────────────────────────────────

function cmdPwd(_args: string[], state: ShellState): CommandResult {
  return ok([stdout(state.cwd)], state);
}

function cmdLs(args: string[], state: ShellState): CommandResult {
  const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
  const pathArgs = args.filter(a => !a.startsWith('-'));
  const target = pathArgs[0]
    ? resolvePath(state.cwd, expandHome(pathArgs[0], state.env))
    : state.cwd;

  const entry = state.vfs.get(target);
  if (!entry) return err(`ls: cannot access '${pathArgs[0] ?? '.'}': No such file or directory`, state);

  if (entry.kind === 'file') {
    return ok([stdout(basename(target))], state);
  }

  let children = listDir(state.vfs, target);
  if (!showHidden) children = children.filter(n => !n.startsWith('.'));

  if (children.length === 0) return ok([], state);

  // Annotate directories with trailing /
  const formatted = children.map(name => {
    const childPath = target === '/' ? `/${name}` : `${target}/${name}`;
    const childEntry = state.vfs.get(childPath);
    return childEntry?.kind === 'dir' ? name + '/' : name;
  });

  return ok([stdout(formatted.join('  '))], state);
}

function cmdCd(args: string[], state: ShellState): CommandResult {
  const dest = args[0] ? expandHome(args[0], state.env) : (state.env['HOME'] ?? '/');
  const abs = resolvePath(state.cwd, dest);
  const entry = state.vfs.get(abs);
  if (!entry) return err(`cd: ${args[0] ?? '~'}: No such file or directory`, state);
  if (entry.kind !== 'dir') return err(`cd: ${args[0]}: Not a directory`, state);
  return ok([], { ...state, cwd: abs });
}

function cmdMkdir(args: string[], state: ShellState): CommandResult {
  const parents = args.includes('-p');
  const names = args.filter(a => !a.startsWith('-'));
  if (names.length === 0) return err('mkdir: missing operand', state);

  for (const name of names) {
    const abs = resolvePath(state.cwd, expandHome(name, state.env));
    if (state.vfs.has(abs)) return err(`mkdir: cannot create directory '${name}': File exists`, state);
    const parent = parentOf(abs);
    if (!state.vfs.has(parent)) {
      if (!parents) return err(`mkdir: cannot create directory '${name}': No such file or directory`, state);
      ensureDirs(state.vfs, abs);
    }
    state.vfs.set(abs, { kind: 'dir' });
  }
  return ok([], state);
}

function cmdTouch(args: string[], state: ShellState): CommandResult {
  if (args.length === 0) return err('touch: missing file operand', state);
  for (const name of args) {
    const abs = resolvePath(state.cwd, expandHome(name, state.env));
    if (!state.vfs.has(abs)) {
      ensureDirs(state.vfs, abs);
      state.vfs.set(abs, { kind: 'file', content: '' });
    }
    // If it already exists, no-op (no mtime tracking)
  }
  return ok([], state);
}

function cmdCat(args: string[], state: ShellState): CommandResult {
  if (args.length === 0) return err('cat: missing file operand', state);
  const output: OutputLine[] = [];
  for (const name of args) {
    const abs = resolvePath(state.cwd, expandHome(name, state.env));
    const entry = state.vfs.get(abs);
    if (!entry) return err(`cat: ${name}: No such file or directory`, state);
    if (entry.kind === 'dir') return err(`cat: ${name}: Is a directory`, state);
    // Emit each line separately so the terminal renders naturally
    for (const line of entry.content.split('\n')) {
      output.push(stdout(line));
    }
    // Remove trailing empty line from split if content ends with \n
    if (output.length > 0 && output[output.length - 1].text === '') {
      output.pop();
    }
  }
  return ok(output, state);
}

function cmdEcho(args: string[], state: ShellState): CommandResult {
  // args have already had > and redirect target stripped by caller if present
  const text = args.join(' ');
  return ok([stdout(text)], state);
}

function cmdRm(args: string[], state: ShellState): CommandResult {
  const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
  const names = args.filter(a => !a.startsWith('-'));
  if (names.length === 0) return err('rm: missing operand', state);

  for (const name of names) {
    const abs = resolvePath(state.cwd, expandHome(name, state.env));
    const entry = state.vfs.get(abs);
    if (!entry) return err(`rm: cannot remove '${name}': No such file or directory`, state);
    if (entry.kind === 'dir' && !recursive) {
      return err(`rm: cannot remove '${name}': Is a directory (use -r)`, state);
    }
    // Remove the entry and all descendants
    const toDelete = [...state.vfs.keys()].filter(k => k === abs || k.startsWith(abs + '/'));
    for (const k of toDelete) state.vfs.delete(k);
  }
  return ok([], state);
}

function cmdMv(args: string[], state: ShellState): CommandResult {
  const names = args.filter(a => !a.startsWith('-'));
  if (names.length < 2) return err('mv: missing destination operand', state);
  const [srcRaw, dstRaw] = names;
  const src = resolvePath(state.cwd, expandHome(srcRaw, state.env));
  let dst = resolvePath(state.cwd, expandHome(dstRaw, state.env));

  const srcEntry = state.vfs.get(src);
  if (!srcEntry) return err(`mv: cannot stat '${srcRaw}': No such file or directory`, state);

  // If dst is an existing directory, move src inside it
  const dstEntry = state.vfs.get(dst);
  if (dstEntry?.kind === 'dir') {
    dst = dst === '/' ? `/${basename(src)}` : `${dst}/${basename(src)}`;
  }

  // Move all keys under src → under dst
  const moves: [string, VFSEntry][] = [];
  for (const [k, v] of state.vfs) {
    if (k === src || k.startsWith(src + '/')) {
      moves.push([k, v]);
    }
  }
  for (const [k, v] of moves) {
    const newKey = dst + k.slice(src.length);
    ensureDirs(state.vfs, newKey);
    state.vfs.set(newKey, v);
    state.vfs.delete(k);
  }
  return ok([], state);
}

function cmdCp(args: string[], state: ShellState): CommandResult {
  const recursive = args.includes('-r') || args.includes('-R');
  const names = args.filter(a => !a.startsWith('-'));
  if (names.length < 2) return err('cp: missing destination operand', state);
  const [srcRaw, dstRaw] = names;
  const src = resolvePath(state.cwd, expandHome(srcRaw, state.env));
  let dst = resolvePath(state.cwd, expandHome(dstRaw, state.env));

  const srcEntry = state.vfs.get(src);
  if (!srcEntry) return err(`cp: cannot stat '${srcRaw}': No such file or directory`, state);
  if (srcEntry.kind === 'dir' && !recursive) {
    return err(`cp: omitting directory '${srcRaw}' (use -r)`, state);
  }

  const dstEntry = state.vfs.get(dst);
  if (dstEntry?.kind === 'dir') {
    dst = dst === '/' ? `/${basename(src)}` : `${dst}/${basename(src)}`;
  }

  const copies: [string, VFSEntry][] = [];
  for (const [k, v] of state.vfs) {
    if (k === src || k.startsWith(src + '/')) {
      copies.push([k, v]);
    }
  }
  for (const [k, v] of copies) {
    const newKey = dst + k.slice(src.length);
    ensureDirs(state.vfs, newKey);
    state.vfs.set(newKey, v.kind === 'file' ? { kind: 'file', content: v.content } : { kind: 'dir' });
  }
  return ok([], state);
}

function cmdHelp(state: ShellState): CommandResult {
  const builtins = [
    'pwd                     Print working directory',
    'ls [-a] [path]          List directory contents',
    'cd [path]               Change directory',
    'mkdir [-p] <dir>        Create directory',
    'touch <file>            Create empty file',
    'cat <file>              Print file contents',
    'echo <text> [> file]    Print text (or redirect to file)',
    'rm [-r] <path>          Remove file or directory',
    'mv <src> <dst>          Move or rename',
    'cp [-r] <src> <dst>     Copy file or directory',
    'clear                   Clear terminal output',
    'help                    Show this help',
  ];
  return ok(
    [info('Built-in commands:'), ...builtins.map(stdout)],
    state,
  );
}

// ─── Initial state factory ────────────────────────────────────────────────────

/**
 * Build a default ShellState.
 * Callers should pass the VFS returned by `createVFS()`.
 */
export function createShellState(
  vfs: VFSMap,
  overrides?: Partial<Omit<ShellState, 'vfs'>>,
): ShellState {
  const home = overrides?.cwd ?? '/home/user';
  // Ensure the home directory exists
  if (!vfs.has('/home')) vfs.set('/home', { kind: 'dir' });
  if (!vfs.has(home))   vfs.set(home,    { kind: 'dir' });

  return {
    vfs,
    cwd: home,
    env: {
      HOME: home,
      USER: 'user',
      SHELL: '/bin/sh',
      ...overrides?.env,
    },
    history: [],
    ...overrides,
  };
}
