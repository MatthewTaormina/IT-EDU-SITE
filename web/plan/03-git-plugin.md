# Part 3 — Git Plugin

## What it is
A plain TypeScript module (`web/components/mdx/TerminalSandbox/gitPlugin.ts`).  
Registers itself with the shell as the `git` command handler.  
Implements the subset of git commands needed for the intro curriculum.

## Responsibility
Maintain a `GitRepo` state object stored inside `ShellState.env['__git__']` as a JSON string  
(keeps the shell state interface clean — no extra fields).

## Git repo state shape

```ts
interface GitRepo {
  initialized: boolean;
  HEAD: string;                          // branch name or commit hash
  branches: Record<string, string>;       // branch name → commit hash
  commits: Record<string, GitCommit>;     // hash → commit object
  index: Record<string, string>;          // staged: path → content
  config: { name: string; email: string };
}

interface GitCommit {
  hash: string;        // fake 7-char hex, deterministic from content
  message: string;
  author: string;
  timestamp: string;   // ISO string
  parent: string | null;
  tree: Record<string, string>;  // path → content snapshot at commit time
}
```

## Supported subcommands

| Subcommand | Behaviour |
|---|---|
| `git init` | Create `.git/` in vfs, initialise GitRepo state, set branch to `main` |
| `git config user.name <name>` | Set `config.name` |
| `git config user.email <email>` | Set `config.email` |
| `git status` | Show untracked, modified, and staged files vs HEAD |
| `git add <path\|.>` | Stage file(s) from vfs into index |
| `git diff [--staged]` | Show unstaged or staged changes vs HEAD |
| `git commit -m <msg>` | Create commit from index; error if nothing staged |
| `git log [--oneline]` | Print commit history from HEAD |
| `git branch [name]` | List branches or create a new one |
| `git checkout <branch\|hash>` | Switch branch; update vfs to match that commit's tree |
| `git checkout -b <name>` | Create and switch to new branch |
| `git merge <branch>` | Fast-forward merge only for now (log error if diverged) |
| `git reset HEAD <file>` | Unstage a file |
| `git restore <file>` | Discard working-tree changes (restore from HEAD) |

## Diff output format

Produce a simplified unified diff — no need for real patch headers,  
just `+` prefix for added lines, `-` prefix for removed lines, context lines unchanged.

## Notes
- Commit hashes are fake but unique: `sha1(message + timestamp)[0..6]` or just an incrementing counter prefixed with `a1b2c3`.
- `git checkout` restores the VFS tracked files to the commit's tree snapshot; untracked files are left alone.
- No remote commands (`push`, `pull`, `fetch`, `clone`) — out of scope for the intro curriculum.
- Registers via `registerPlugin(shell, gitPlugin)`.
- Ship after Part 2 (shell).
