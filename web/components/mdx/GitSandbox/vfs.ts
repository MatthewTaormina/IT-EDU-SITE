/**
 * DEPRECATED — this file is superseded by TerminalSandbox/vfs.ts
 * Do not import from here. This folder will be removed.
 * @see web/components/mdx/TerminalSandbox/vfs.ts
 */

export type VFSEntry =
  | { kind: 'file'; content: string }
  | { kind: 'dir' };

export type VFSMap = Map<string, VFSEntry>;

/** Normalise and resolve a path relative to cwd. */
export function resolvePath(cwd: string, input: string): string {
  const base = input.startsWith('/') ? '' : cwd;
  const parts = `${base}/${input}`.split('/').filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') { resolved.pop(); continue; }
    resolved.push(part);
  }
  return '/' + resolved.join('/');
}

/** Return the parent path of an absolute path. */
export function parentOf(absPath: string): string {
  const idx = absPath.lastIndexOf('/');
  return idx === 0 ? '/' : absPath.slice(0, idx);
}

/** Return the basename of an absolute path. */
export function basename(absPath: string): string {
  return absPath.slice(absPath.lastIndexOf('/') + 1);
}

/** List immediate children of a directory. */
export function listDir(vfs: VFSMap, absDir: string): string[] {
  const prefix = absDir === '/' ? '/' : absDir + '/';
  const results: string[] = [];
  for (const key of vfs.keys()) {
    if (key === absDir) continue;
    if (!key.startsWith(prefix)) continue;
    // Only direct children — no slash after the prefix
    const rest = key.slice(prefix.length);
    if (!rest.includes('/')) results.push(basename(key));
  }
  return results.sort();
}

/** Create a deep clone of a VFS (used for git snapshots). */
export function cloneVFS(vfs: VFSMap): VFSMap {
  const copy: VFSMap = new Map();
  for (const [k, v] of vfs) {
    copy.set(k, v.kind === 'file' ? { kind: 'file', content: v.content } : { kind: 'dir' });
  }
  return copy;
}

/** Build a fresh VFS with a root directory pre-created. */
export function createVFS(preload?: Record<string, string>): VFSMap {
  const vfs: VFSMap = new Map();
  vfs.set('/', { kind: 'dir' });

  if (preload) {
    for (const [path, content] of Object.entries(preload)) {
      const abs = path.startsWith('/') ? path : '/' + path;
      // Ensure all ancestor directories exist
      const parts = abs.split('/').filter(Boolean);
      let cur = '/';
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur === '/' ? `/${parts[i]}` : `${cur}/${parts[i]}`;
        if (!vfs.has(cur)) vfs.set(cur, { kind: 'dir' });
      }
      vfs.set(abs, { kind: 'file', content });
    }
  }

  return vfs;
}
