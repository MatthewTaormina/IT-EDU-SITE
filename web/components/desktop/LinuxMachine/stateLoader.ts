/**
 * LinuxMachine — State endpoint loader
 *
 * Fetches machine configuration from a structured static API endpoint.
 * All fetched data is marked origin:'remote' — it is NEVER written to
 * sessionStorage. On each fresh boot the remote baseline is re-fetched and
 * the user's local delta (from sessionStorage) is overlaid on top.
 *
 * Sub-endpoint structure
 * ──────────────────────
 *   {base}/manifest.json  ← machine identity + launch config (required)
 *   {base}/vfs.json       ← read-only baseline filesystem (optional)
 *
 * Apps fetch their own domain data as needed (via loadAppResource):
 *   {base}/mail/inbox.json   ← EmailApp
 *   {base}/mail/sent.json    ← EmailApp
 *   (future) {base}/bookmarks.json ← BrowserApp
 *
 * In the future these endpoints become real API routes backed by
 * S3 / a database for persistent user saves.
 */

import type {
  DesktopStateManifest,
  VFSStateFile,
  MachineState,
  DesktopVFSMap,
  AppState,
  AppId,
  WindowEntry,
} from './MachineTypes';

// ─── Default window dimensions ────────────────────────────────────────────────

const DEFAULT_WINDOW_SIZES: Record<AppId, { width: number; height: number }> = {
  terminal:      { width: 720,  height: 480 },
  browser:       { width: 1024, height: 700 },
  email:         { width: 800,  height: 560 },
  'text-editor': { width: 640,  height: 480 },
};

// ─── Remote VFS builder ───────────────────────────────────────────────────────

/**
 * Ensure ancestor directories exist, all tagged origin:'remote'.
 */
function ensureDirs(vfs: DesktopVFSMap, absPath: string): void {
  const parts = absPath.split('/').filter(Boolean);
  let cur = '/';
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur === '/' ? `/${parts[i]}` : `${cur}/${parts[i]}`;
    if (!vfs.has(cur)) vfs.set(cur, { kind: 'dir', origin: 'remote' });
  }
}

/**
 * Minimal Debian-like directory tree + system stubs.
 * All entries are origin:'remote' — never written to sessionStorage.
 */
function buildRemoteVFS(hostname: string): DesktopVFSMap {
  const vfs: DesktopVFSMap = new Map();
  vfs.set('/', { kind: 'dir', origin: 'remote' });

  const sysDirs = [
    '/bin', '/etc', '/home', '/tmp',
    '/usr', '/usr/bin', '/usr/local', '/usr/local/bin',
    '/var', '/var/log', '/var/mail', '/var/mail/inbox', '/var/mail/sent',
    '/proc',
  ];
  for (const d of sysDirs) vfs.set(d, { kind: 'dir', origin: 'remote' });

  const bins = ['bash', 'cat', 'cp', 'echo', 'ls', 'mkdir', 'mv', 'rm', 'sh', 'touch'];
  for (const b of bins) {
    vfs.set(`/bin/${b}`, { kind: 'file', content: '', readOnly: true, origin: 'remote' });
  }

  vfs.set('/etc/hostname', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: `${hostname}\n`,
  });
  vfs.set('/etc/os-release', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: [
      'NAME="FictOS"',
      'VERSION="1.0 (Sandbox Edition)"',
      'ID=fictos',
      'ID_LIKE=debian',
      'PRETTY_NAME="FictOS 1.0 (Sandbox Edition)"',
      '',
    ].join('\n'),
  });
  vfs.set('/etc/motd', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: `Welcome to ${hostname}.\nFictOS 1.0 — sandbox environment.\nType 'help' for available commands.\n`,
  });

  return vfs;
}

/**
 * Ingest vfs.json entries into an existing VFS. All entries become origin:'remote'.
 */
function ingestRemoteVFS(vfs: DesktopVFSMap, vfsData: VFSStateFile): void {
  for (const [rawPath, entry] of Object.entries(vfsData)) {
    const abs = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    ensureDirs(vfs, abs);
    if (typeof entry === 'string') {
      vfs.set(abs, { kind: 'file', content: entry, readOnly: true, origin: 'remote' });
    } else {
      vfs.set(abs, {
        kind: 'url',
        href: (entry as { url: string; mimeType: string }).url,
        mimeType: (entry as { url: string; mimeType: string }).mimeType,
        readOnly: true,
        origin: 'remote',
      });
    }
  }
}

// ─── Default app state ────────────────────────────────────────────────────────

function defaultAppState(app: AppId, env: Record<string, string>): AppState {
  switch (app) {
    case 'terminal':
      return { cwd: env['HOME'] ?? '/home/user', history: [] };
    case 'browser':
      return { url: 'about:home', history: ['about:home'], historyIndex: 0 };
    case 'email':
      return { view: 'inbox' };
    case 'text-editor':
      return { filePath: null, content: '', dirty: false, cursorLine: 1, cursorCol: 1 };
  }
}

// ─── buildInitialState ────────────────────────────────────────────────────────

/**
 * Construct a MachineState containing ONLY remote (origin:'remote') VFS entries.
 * MachineContext overlays the local delta from sessionStorage on top after calling
 * this function.
 *
 * @param manifest      Fetched from {endpoint}/manifest.json, or null for blank boot.
 * @param remoteVFS     Fetched from {endpoint}/vfs.json, or null/undefined.
 * @param stateEndpoint Base URL stored in state so apps can fetch sub-resources.
 */
export function buildInitialState(
  manifest: DesktopStateManifest | null,
  remoteVFS?: VFSStateFile | null,
  stateEndpoint?: string,
): MachineState {
  const hostname = manifest?.hostname ?? 'devbox';
  const user     = manifest?.user     ?? 'user';
  const home     = `/home/${user}`;

  const vfs = buildRemoteVFS(hostname);

  for (const d of [home, `${home}/Desktop`, `${home}/Downloads`, `${home}/Documents`, `${home}/.config`]) {
    vfs.set(d, { kind: 'dir', origin: 'remote' });
  }

  if (remoteVFS) ingestRemoteVFS(vfs, remoteVFS);

  const env: Record<string, string> = {
    HOME:     home,
    USER:     user,
    HOSTNAME: hostname,
    SHELL:    '/bin/bash',
    PATH:     '/usr/local/bin:/usr/bin:/bin',
    TERM:     'xterm-256color',
    LANG:     'en_CA.UTF-8',
  };

  const windowSpecs = manifest?.initialWindows ?? [];
  const windows: WindowEntry[] = windowSpecs.map((spec, i) => ({
    id:           `w${i}`,
    app:          spec.app,
    title:        spec.title,
    displayState: 'normal',
    position:     { x: 40 + i * 24, y: 40 + i * 24 },
    size:         DEFAULT_WINDOW_SIZES[spec.app] ?? { width: 720, height: 480 },
    zIndex:       i + 1,
    appState:     spec.appState ?? defaultAppState(spec.app, env),
  }));

  return {
    hostname,
    user,
    vfs,
    windows,
    nextWindowId:        windows.length,
    focusedWindowId:     windows.length > 0 ? windows[windows.length - 1].id : null,
    processes:           [],
    nextPid:             1,
    browserAllowedSites: manifest?.browserAllowedSites ?? [],
    env,
    stateEndpoint,
  };
}

// ─── Remote fetch helpers ─────────────────────────────────────────────────────

/** Fetch and validate manifest.json from a state endpoint base URL. */
export async function loadManifest(
  endpoint: string,
): Promise<DesktopStateManifest | null> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/manifest.json`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') return null;
    const manifest = data as Partial<DesktopStateManifest>;
    if (manifest.version !== 1) return null;
    return manifest as DesktopStateManifest;
  } catch {
    return null;
  }
}

/**
 * Fetch vfs.json from a state endpoint.
 * The path can be overridden via manifest.resources.vfs (relative to base).
 */
export async function loadRemoteVFS(
  endpoint: string,
  path = 'vfs.json',
): Promise<VFSStateFile | null> {
  try {
    const base = endpoint.replace(/\/$/, '');
    const url  = path.startsWith('http') ? path : `${base}/${path}`;
    const res  = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return data as VFSStateFile;
  } catch {
    return null;
  }
}

/**
 * Fetch any app-specific sub-resource from the state endpoint.
 * Called by apps at window-open time — NOT at boot time.
 *
 * @param endpoint  Base endpoint from `state.stateEndpoint`
 * @param subPath   Relative path, e.g. 'mail/inbox.json'
 * @returns Parsed JSON or null on any failure
 */
export async function loadAppResource<T = unknown>(
  endpoint: string,
  subPath: string,
): Promise<T | null> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/${subPath}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}
