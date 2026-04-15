#!/usr/bin/env node
/**
 * generate-vfs-manifests.mjs
 *
 * Crawls a VFS source directory (or a vfs.json flat-map) and writes an
 * index.json manifest into every folder.  Produces the static layer tree
 * consumed by the layered-VFS API at /vfs/{layer}/{linux-path}.
 *
 * Usage — directory source (base layer):
 *   node scripts/generate-vfs-manifests.mjs \
 *     --layer base --src tmp/vfs-base --out public/vfs/base
 *
 * Usage — vfs.json flat-map source (setup layer):
 *   node scripts/generate-vfs-manifests.mjs \
 *     --layer setup --src public/desktop-states/default/vfs.json \
 *     --out public/vfs/setup
 *
 * Usage — empty active layer initialisation:
 *   node scripts/generate-vfs-manifests.mjs \
 *     --layer active --out public/vfs/active
 *   (--src may be omitted for the active layer; an empty root manifest is written)
 *
 * Flags:
 *   --layer   base | setup | active   (required)
 *   --src     path to source dir, OR path to a vfs.json flat-map file
 *             Relative paths are resolved from web/ (one level above scripts/).
 *             Optional when --layer active (produces an empty root manifest).
 *   --out     output directory (created if missing); relative to web/.  (required)
 *   --dry-run print what would be written without writing
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  existsSync,
} from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
// Paths are resolved relative to web/ (parent of scripts/).
const webDir = join(__dir, '..');

// ── Arg parsing ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1] ?? true;
      i++;
    }
  }
  return args;
}

const args  = parseArgs(process.argv.slice(2));
const LAYER = args.layer;
const SRC   = args.src ? join(webDir, args.src) : null;
const OUT   = args.out ? join(webDir, args.out) : null;
const DRY   = Boolean(args['dry-run']);

if (!LAYER || !['base', 'setup', 'active'].includes(LAYER)) {
  console.error('--layer must be one of: base, setup, active');
  process.exit(1);
}
if (!OUT) {
  console.error('--out is required');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function write(filePath, data) {
  if (DRY) { console.log('[dry-run] write', filePath); return; }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function ensureDir(p) {
  if (!DRY) mkdirSync(p, { recursive: true });
}

function sortEntries(entries) {
  return entries.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });
}

// ── Mode A: crawl a real directory tree ───────────────────────────────────────

function crawlDir(srcDir, outDir, absVfsPath = '/') {
  ensureDir(outDir);
  const names   = readdirSync(srcDir).filter(n => n !== 'index.json');
  const entries = [];

  for (const name of names) {
    const srcChild = join(srcDir, name);
    const outChild = join(outDir, name);
    const stat     = statSync(srcChild);

    if (stat.isDirectory()) {
      const childVfsPath = absVfsPath === '/' ? `/${name}` : `${absVfsPath}/${name}`;
      entries.push({ name, type: 'dir' });
      crawlDir(srcChild, outChild, childVfsPath);
    } else {
      entries.push({ name, type: 'file', size: stat.size, readOnly: LAYER !== 'active' });
      if (!DRY) {
        const content = readFileSync(srcChild);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(outChild, content);
      } else {
        console.log('[dry-run] copy', srcChild, '->', outChild);
      }
    }
  }

  write(join(outDir, 'index.json'), {
    path:    absVfsPath,
    layer:   LAYER,
    entries: sortEntries(entries),
  });

  console.log(`✓ ${absVfsPath}  (${entries.length} entries)`);
}

// ── Mode B: ingest a vfs.json flat-map ───────────────────────────────────────
//
//  vfs.json format: { "/absolute/path": "file content" | { url, mimeType } }

function crawlVfsJson(vfsJsonPath, outDir) {
  const raw = JSON.parse(readFileSync(vfsJsonPath, 'utf8'));

  // Build an in-memory directory tree so we can write manifests for every
  // directory implied by path prefixes, even if not listed explicitly.
  const dirChildren = new Map(); // absDir → Map<name, entry>

  function addToParent(absPath, entry) {
    const parent = absPath.split('/').slice(0, -1).join('/') || '/';
    if (!dirChildren.has(parent)) dirChildren.set(parent, new Map());
    dirChildren.get(parent).set(entry.name, entry);
  }

  function ensureAncestors(absPath) {
    const parts = absPath.split('/').filter(Boolean);
    let cur = '/';
    for (let i = 0; i < parts.length - 1; i++) {
      const prev = cur;
      cur = cur === '/' ? `/${parts[i]}` : `${cur}/${parts[i]}`;
      // Add this directory entry to its parent
      addToParent(cur, { name: parts[i], type: 'dir' });
      // Ensure the directory node itself exists in dirChildren
      if (!dirChildren.has(cur)) dirChildren.set(cur, new Map());
    }
  }

  for (const [rawPath, value] of Object.entries(raw)) {
    const absPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    ensureAncestors(absPath);
    const name = basename(absPath);
    if (typeof value === 'string') {
      addToParent(absPath, {
        name,
        type:     'file',
        size:     Buffer.byteLength(value, 'utf8'),
        readOnly: true,
      });
      const outPath = join(outDir, absPath.slice(1));
      if (!DRY) {
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, value, 'utf8');
      } else {
        console.log('[dry-run] write file', outPath);
      }
    } else {
      // url entry: { url, mimeType }
      addToParent(absPath, { name, type: 'url', href: value.url, readOnly: true });
    }
  }

  // Write index.json for every directory we found (sorted for determinism).
  for (const [dir, children] of [...dirChildren.entries()].sort()) {
    const entries = sortEntries([...children.values()]);
    const relPath = dir === '/' ? '' : dir.slice(1);
    write(join(outDir, relPath, 'index.json'), { path: dir, layer: LAYER, entries });
    console.log(`✓ ${dir}  (${entries.length} entries)`);
  }
}

// ── Mode C: empty active layer ────────────────────────────────────────────────

function writeEmptyActive(outDir) {
  write(join(outDir, 'index.json'), { path: '/', layer: 'active', entries: [] });
  console.log('✓ /  (0 entries) — empty active layer');
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (!SRC) {
  // Active layer with no --src: just emit an empty root manifest.
  if (LAYER !== 'active') {
    console.error('--src is required when --layer is not "active"');
    process.exit(1);
  }
  console.log(`Initialising empty active layer → ${OUT}`);
  writeEmptyActive(OUT);
} else {
  const srcStat = existsSync(SRC) && statSync(SRC);
  if (!srcStat) {
    console.error('--src path does not exist:', SRC);
    process.exit(1);
  }

  if (srcStat.isDirectory()) {
    console.log(`Crawling directory: ${SRC} → ${OUT}  (layer: ${LAYER})`);
    crawlDir(SRC, OUT);
  } else if (SRC.endsWith('.json')) {
    console.log(`Ingesting vfs.json: ${SRC} → ${OUT}  (layer: ${LAYER})`);
    crawlVfsJson(SRC, OUT);
  } else {
    console.error('--src must be a directory or a .json file');
    process.exit(1);
  }
}

console.log('\nDone.');
