# Part 1 — Virtual File System (VFS)

## What it is
A plain TypeScript module (`web/components/mdx/TerminalSandbox/vfs.ts`).  
No React, no state — a pure data structure + utility functions.

## Responsibility
Represent a Linux-like directory tree in memory.  
Be the single source of truth for the filesystem state at any point in time.

## Data shape

```ts
type VFSEntry =
  | { kind: 'file'; content: string }
  | { kind: 'dir' };

type VFSMap = Map<string, VFSEntry>;
// Keys are absolute POSIX paths: '/', '/home', '/home/user/readme.txt'
```

## Functions to export

| Function | Purpose |
|---|---|
| `createVFS(preload?)` | Return a fresh VFSMap with `/` and optionally pre-populated files |
| `resolvePath(cwd, input)` | Resolve a relative or absolute path string against cwd |
| `parentOf(abs)` | `/a/b/c` → `/a/b` |
| `basename(abs)` | `/a/b/c` → `c` |
| `listDir(vfs, absDir)` | Return sorted immediate children (names only) |
| `cloneVFS(vfs)` | Deep-copy the map (used by git for snapshots) |
| `ensureDirs(vfs, absPath)` | Create all missing ancestor directories of a path |

## Preload format (used by MDX authors)

```ts
// Files to inject before the sandbox starts
const preload: Record<string, string> = {
  '/home/user/hello.txt': 'Hello, world!\n',
  '/home/user/project/index.html': '<h1>Hi</h1>\n',
};
```

## Notes
- All paths stored and returned as absolute POSIX strings.
- No symlinks, permissions, or timestamps — YAGNI.
- `cloneVFS` is called by the git engine, not by components directly.
- Used by Part 2 (shell) and Part 3 (git plugin) — ship this first.
