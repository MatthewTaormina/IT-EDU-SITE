# Part 2 — Linux Shell Interpreter

## What it is
A plain TypeScript module (`web/components/mdx/TerminalSandbox/shell.ts`).  
No React. Receives a command string + current state, returns new state + output lines.

## Responsibility
Parse a command string, dispatch to built-in command handlers, return results.  
Owns the working directory (`cwd`) and the VFS reference.  
Exposes a plugin interface so external modules (e.g. git) can register their own top-level commands.

## State shape

```ts
interface ShellState {
  vfs: VFSMap;        // current filesystem — mutated in place by commands
  cwd: string;        // absolute path, e.g. '/home/user'
  env: Record<string, string>; // e.g. { USER: 'user', HOME: '/home/user' }
  history: string[];  // command input history (for ↑/↓ in UI)
}
```

## Return value of `runCommand`

```ts
interface CommandResult {
  output: OutputLine[];  // lines to print to terminal
  state: ShellState;     // updated state (may be same object)
}

type OutputLine =
  | { kind: 'stdout'; text: string }
  | { kind: 'stderr'; text: string }  // rendered in red
  | { kind: 'info';   text: string }; // rendered in muted colour
```

## Built-in commands

| Command | Behaviour |
|---|---|
| `pwd` | Print `cwd` |
| `ls [-a] [path]` | List directory contents; `-a` includes `.git` etc. |
| `cd [path]` | Change `cwd`; `cd` alone → `HOME`; error if not a dir |
| `mkdir [-p] name` | Create directory; `-p` creates parents |
| `touch file` | Create empty file or update (no-op on existing) |
| `cat file` | Print file contents |
| `echo [text] [> file]` | Print text or redirect to file |
| `rm [-r] path` | Remove file or directory (`-r` required for dirs) |
| `mv src dst` | Rename/move file or directory |
| `cp [-r] src dst` | Copy file or directory |
| `clear` | Signal to UI to clear screen (returns special `clear` flag) |
| `help` | Print available commands |

## Plugin interface

```ts
type CommandPlugin = {
  name: string;  // top-level command token, e.g. 'git'
  run: (args: string[], state: ShellState) => CommandResult;
};

function registerPlugin(shell: Shell, plugin: CommandPlugin): void;
```

## Notes
- Quote handling: split on spaces, respect `"..."` as single token.
- `>` redirect: any command producing stdout can pipe to a file.
- No pipes (`|`), no background processes, no globbing — YAGNI.
- Part 3 (git) registers itself as a plugin; shell has zero knowledge of git.
- Ship after Part 1 (VFS).
