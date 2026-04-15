/**
 * Virtual File System (VFS) — Part 1 of TerminalSandbox
 *
 * A pure TypeScript in-memory POSIX-like file system.
 * No React, no side-effects — only data structures and pure functions.
 *
 * Keys in VFSMap are absolute POSIX paths, always starting with '/'.
 * Example: '/', '/home', '/home/user', '/home/user/readme.txt'
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type VFSEntry =
  | { kind: 'file'; content: string }
  | { kind: 'dir' };

/** The core map: absolute path → entry */
export type VFSMap = Map<string, VFSEntry>;

// ─── Path utilities ───────────────────────────────────────────────────────────

/**
 * Resolve `input` relative to `cwd`, handling `.` and `..`.
 * If `input` starts with '/' it is treated as absolute.
 */
export function resolvePath(cwd: string, input: string): string {
  const base = input.startsWith('/') ? '' : cwd;
  const raw = base === '/' ? `/${input}` : `${base}/${input}`;
  const parts = raw.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') { stack.pop(); continue; }
    stack.push(part);
  }
  return '/' + stack.join('/');
}

/**
 * Return the parent directory of an absolute path.
 * parentOf('/a/b/c') === '/a/b'
 * parentOf('/a')     === '/'
 */
export function parentOf(absPath: string): string {
  if (absPath === '/') return '/';
  const idx = absPath.lastIndexOf('/');
  return idx === 0 ? '/' : absPath.slice(0, idx);
}

/**
 * Return the final segment of an absolute path.
 * basename('/a/b/c') === 'c'
 */
export function basename(absPath: string): string {
  if (absPath === '/') return '/';
  return absPath.slice(absPath.lastIndexOf('/') + 1);
}

// ─── Directory operations ─────────────────────────────────────────────────────

/**
 * List the immediate children of a directory.
 * Returns bare names (not full paths), sorted alphabetically.
 */
export function listDir(vfs: VFSMap, absDir: string): string[] {
  const prefix = absDir === '/' ? '/' : absDir + '/';
  const results: string[] = [];
  for (const key of vfs.keys()) {
    if (key === absDir) continue;
    if (!key.startsWith(prefix)) continue;
    // Only direct children — no additional slash after the prefix segment
    const rest = key.slice(prefix.length);
    if (rest.length > 0 && !rest.includes('/')) {
      results.push(rest);
    }
  }
  return results.sort();
}

/**
 * Ensure all ancestor directories of `absPath` exist in `vfs`.
 * For a file path like '/a/b/c.txt' this creates '/a' and '/a/b'.
 * For a dir path like '/a/b/c' pass the path itself; ancestors are '/a', '/a/b'.
 */
export function ensureDirs(vfs: VFSMap, absPath: string): void {
  const parts = absPath.split('/').filter(Boolean);
  // Walk all segments except the last (the file/dir name itself)
  let cur = '/';
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur === '/' ? `/${parts[i]}` : `${cur}/${parts[i]}`;
    if (!vfs.has(cur)) vfs.set(cur, { kind: 'dir' });
  }
}

// ─── Factory & clone ──────────────────────────────────────────────────────────

/**
 * Create a fresh VFS.
 * Optionally pre-populate files from a `preload` record.
 *
 * @param preload - Map of absolute (or relative-from-root) paths → file content.
 *
 * @example
 * const vfs = createVFS({
 *   '/home/user/hello.txt': 'Hello, world!\n',
 *   '/home/user/project/index.html': '<h1>Hi</h1>\n',
 * });
 */
export function createVFS(preload?: Record<string, string>): VFSMap {
  const vfs: VFSMap = new Map();
  vfs.set('/', { kind: 'dir' });

  if (preload) {
    for (const [rawPath, content] of Object.entries(preload)) {
      const abs = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
      ensureDirs(vfs, abs);
      vfs.set(abs, { kind: 'file', content });
    }
  }

  return vfs;
}

/**
 * Deep-clone a VFSMap.
 * Used by the git engine to snapshot the working tree at commit time.
 */
export function cloneVFS(vfs: VFSMap): VFSMap {
  const copy: VFSMap = new Map();
  for (const [k, v] of vfs) {
    copy.set(k, v.kind === 'file' ? { kind: 'file', content: v.content } : { kind: 'dir' });
  }
  return copy;
}
