/**
 * LinuxMachine — sessionStorage serialization
 *
 * STORAGE STRATEGY
 * ────────────────
 * Only mutable (origin:'local') state is written to sessionStorage.
 * Read-only remote content (origin:'remote') is excluded — it will be
 * re-fetched from the state endpoint on every fresh boot, keeping the
 * stored payload small and ensuring remote changes are always picked up.
 *
 * ON HYDRATION
 * ────────────
 * `deserializeMachineState` returns a delta containing only local VFS
 * entries + mutable UI state (windows, processes, env changes).
 * `mergeLocalDelta` overlays this onto a freshly-built remote base state.
 *
 * Stored under key `linux-machine-{machineId}` in sessionStorage.
 * Tab-scoped: cleared automatically when the browser tab closes.
 */

import type { MachineState, DesktopVFSMap, DesktopVFSEntry } from './MachineTypes';

// ─── Wire format ──────────────────────────────────────────────────────────────

/** Only local VFS entries are stored — [path, entry] tuples */
type LocalVFSPairs = [string, DesktopVFSEntry][];

interface StoredDelta extends Omit<MachineState, 'vfs'> {
  /** Only origin:'local' VFS entries */
  localVFS: LocalVFSPairs;
  /** Wire format version — increment when shape changes */
  _v: 2;
}

// ─── Serialize (write to sessionStorage) ─────────────────────────────────────

/**
 * Serialize only the mutable (origin:'local') parts of MachineState.
 * Remote VFS entries are excluded — they will be re-fetched on next boot.
 */
export function serializeMachineState(state: MachineState): string {
  const localVFS: LocalVFSPairs = [];
  for (const [path, entry] of state.vfs) {
    if (entry.origin === 'local') localVFS.push([path, entry]);
  }

  const delta: StoredDelta = {
    ...state,
    localVFS,
    _v: 2,
  };
  return JSON.stringify(delta);
}

// ─── Deserialize (read from sessionStorage) ───────────────────────────────────

/**
 * Load the stored delta.
 * Returns a MachineState where `vfs` contains ONLY local entries.
 * Caller must call `mergeLocalDelta(remoteBase, delta)` to produce the full state.
 */
export function deserializeMachineState(raw: string): MachineState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const wire = parsed as Partial<StoredDelta>;
    if (wire._v !== 2) return null; // discard v1 sessions from before this refactor

    if (!Array.isArray(wire.localVFS)) return null;

    // Reconstruct local-only VFS
    const vfs: DesktopVFSMap = new Map(
      (wire.localVFS as [unknown, unknown][]).filter(
        (pair): pair is [string, DesktopVFSEntry] =>
          Array.isArray(pair) &&
          typeof pair[0] === 'string' &&
          pair[1] !== null &&
          typeof pair[1] === 'object' &&
          typeof (pair[1] as DesktopVFSEntry).kind === 'string',
      ),
    );

    if (
      typeof wire.hostname !== 'string' ||
      typeof wire.user     !== 'string' ||
      !Array.isArray(wire.windows) ||
      typeof wire.nextWindowId !== 'number' ||
      typeof wire.nextPid      !== 'number'
    ) {
      return null;
    }

    return {
      hostname:            wire.hostname,
      user:                wire.user,
      vfs,                 // local entries only — caller merges remote on top
      windows:             wire.windows ?? [],
      nextWindowId:        wire.nextWindowId,
      focusedWindowId:     wire.focusedWindowId ?? null,
      processes:           wire.processes ?? [],
      nextPid:             wire.nextPid,
      browserAllowedSites: wire.browserAllowedSites ?? [],
      env:                 wire.env ?? {},
      stateEndpoint:       wire.stateEndpoint,
    };
  } catch {
    return null;
  }
}

// ─── Merge ────────────────────────────────────────────────────────────────────

/**
 * Overlay local mutations from the stored delta onto a freshly-built remote state.
 *
 * Merge rules:
 *   • VFS: all entries from `remoteBase.vfs` (origin:'remote') are kept.
 *     Local entries from `delta.vfs` are overlaid on top, taking precedence.
 *   • Windows, processes, env, nextWindowId, nextPid, focusedWindowId:
 *     taken from `delta` (the user's live session state).
 *   • hostname, user, browserAllowedSites, stateEndpoint:
 *     taken from `remoteBase` (authoritative config, not user-editable).
 */
export function mergeLocalDelta(
  remoteBase: MachineState,
  delta: MachineState,
): MachineState {
  // Start with all remote entries, then overlay local ones
  const vfs: DesktopVFSMap = new Map(remoteBase.vfs);
  for (const [path, entry] of delta.vfs) {
    vfs.set(path, entry);
  }

  return {
    // Identity + config always comes from remote
    hostname:            remoteBase.hostname,
    user:                remoteBase.user,
    browserAllowedSites: remoteBase.browserAllowedSites,
    stateEndpoint:       remoteBase.stateEndpoint,
    // Merged VFS
    vfs,
    // Mutable session state always comes from delta
    windows:             delta.windows,
    nextWindowId:        delta.nextWindowId,
    focusedWindowId:     delta.focusedWindowId,
    processes:           delta.processes,
    nextPid:             delta.nextPid,
    // Env: remote provides defaults, delta may have user-set vars on top
    env:                 { ...remoteBase.env, ...delta.env },
  };
}
