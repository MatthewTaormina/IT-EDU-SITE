/**
 * vfs-overlay.ts
 *
 * Client-side types and helpers for the three-layer static VFS API.
 *
 * URL structure
 * ─────────────
 *   /vfs/base/{linux-path}    ← remote layer  (buildRemoteVFS)
 *   /vfs/setup/{linux-path}   ← setup layer   (vfs.json overlay)
 *   /vfs/active/{linux-path}  ← active layer  (user delta)
 *
 * Each directory in every layer has an index.json manifest:
 *   /vfs/base/etc/index.json
 *   /vfs/setup/home/learner/index.json
 *   /vfs/active/home/learner/index.json
 *
 * Overlay resolution order: active → setup → base (active wins).
 * Directory listings are merged across all three layers so that entries
 * from every layer are visible, with the active entry winning on conflict.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type LayerName = 'base' | 'setup' | 'active';

/** Relative to the layer; mirrors DesktopVFSEntry kinds. */
export type ManifestEntryType = 'file' | 'dir' | 'url' | 'symlink';

export interface ManifestEntry {
  name:      string;
  type:      ManifestEntryType;
  /** Byte size; present for `type === 'file'` only. */
  size?:     number;
  readOnly?: boolean;
  /** Present for `type === 'symlink'`. */
  target?:   string;
  /** Present for `type === 'url'`. */
  href?:     string;
}

export interface LayerManifest {
  path:    string;
  layer:   LayerName;
  entries: ManifestEntry[];
}

/** A manifest entry enriched with the layer it was resolved from. */
export interface ResolvedEntry extends ManifestEntry {
  resolvedLayer: LayerName;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Resolution order: highest priority first. */
export const LAYER_PRIORITY: readonly LayerName[] = ['active', 'setup', 'base'] as const;

// ── Low-level fetch helpers ───────────────────────────────────────────────────

/**
 * Fetch the index.json manifest for `dir` in the given layer.
 * Returns `null` on any network or parse error (e.g. 404 for missing layer).
 */
export async function fetchLayerManifest(
  layer: LayerName,
  dir: string,
): Promise<LayerManifest | null> {
  // Normalise: strip trailing slash, add leading slash.
  const norm = dir === '/' ? '' : dir.replace(/\/$/, '');
  const url  = `/vfs/${layer}${norm}/index.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return data as LayerManifest;
  } catch {
    return null;
  }
}

/**
 * Fetch raw text content of a VFS file from a specific layer.
 * Returns `null` on any error.
 */
export async function fetchLayerFile(
  layer: LayerName,
  absPath: string,
): Promise<string | null> {
  const url = `/vfs/${layer}${absPath}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── Overlay resolution ────────────────────────────────────────────────────────

/**
 * Fetch all three layer manifests for `dir` in parallel and merge them.
 *
 * Resolution rules:
 * - Entries are deduplicated by name; the first layer in LAYER_PRIORITY wins.
 * - Directories present in any layer are always included (union merge).
 */
export async function listMergedDir(dir: string): Promise<ResolvedEntry[]> {
  const manifests = await Promise.all(
    (['base', 'setup', 'active'] as LayerName[]).map(l => fetchLayerManifest(l, dir)),
  );

  const seen = new Map<string, ResolvedEntry>();

  for (const layer of LAYER_PRIORITY) {
    const manifest = manifests.find(m => m?.layer === layer);
    for (const entry of manifest?.entries ?? []) {
      if (!seen.has(entry.name)) {
        seen.set(entry.name, { ...entry, resolvedLayer: layer });
      }
    }
  }

  return [...seen.values()].sort((a, b) => {
    // Directories first, then alphabetical.
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Resolve a file at `absPath` across all layers (active → setup → base).
 *
 * @returns `{ content, layer }` from the winning layer, or `null` if not found
 *          in any layer.
 */
export async function resolveFile(
  absPath: string,
): Promise<{ content: string; layer: LayerName } | null> {
  for (const layer of LAYER_PRIORITY) {
    const content = await fetchLayerFile(layer, absPath);
    if (content !== null) return { content, layer };
  }
  return null;
}

/**
 * Resolve a single directory entry by name within `dir`.
 * Checks all layers in priority order; returns the first match.
 */
export async function resolveEntry(
  dir: string,
  name: string,
): Promise<ResolvedEntry | null> {
  for (const layer of LAYER_PRIORITY) {
    const manifest = await fetchLayerManifest(layer, dir);
    const entry    = manifest?.entries.find(e => e.name === name);
    if (entry) return { ...entry, resolvedLayer: layer };
  }
  return null;
}
