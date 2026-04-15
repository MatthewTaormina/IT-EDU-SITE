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
  terminal:        { width: 720,  height: 480 },
  browser:         { width: 1024, height: 700 },
  email:           { width: 800,  height: 560 },
  'text-editor':   { width: 640,  height: 480 },
  'ticket-app':    { width: 900,  height: 600 },
  'file-explorer': { width: 820,  height: 540 },
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
 * AC 3.1: Full Linux filesystem view.
 */
function buildRemoteVFS(hostname: string): DesktopVFSMap {
  const vfs: DesktopVFSMap = new Map();
  vfs.set('/', { kind: 'dir', origin: 'remote' });

  const sysDirs = [
    // FHS top-level
    '/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/lib64',
    '/media', '/mnt', '/opt', '/proc', '/run', '/sbin', '/srv',
    '/tmp', '/usr', '/var',
    // /usr subtree
    '/usr/bin', '/usr/lib', '/usr/local', '/usr/local/bin', '/usr/local/lib',
    '/usr/sbin', '/usr/share', '/usr/share/doc',
    // /var subtree
    '/var/api', '/var/cache', '/var/lib', '/var/log',
    '/var/mail', '/var/mail/inbox', '/var/mail/sent',
    '/var/run', '/var/spool', '/var/tickets', '/var/tmp', '/var/www',
    // /proc stubs
    '/proc/sys', '/proc/net',
    // /dev stubs
    '/dev/pts',
    // /run stubs
    '/run/lock',
  ];
  for (const d of sysDirs) vfs.set(d, { kind: 'dir', origin: 'remote' });

  const bins = ['bash', 'cat', 'cp', 'echo', 'ls', 'mkdir', 'mv', 'rm', 'sh', 'touch'];
  for (const b of bins) {
    vfs.set(`/bin/${b}`, { kind: 'file', content: '', readOnly: true, origin: 'remote' });
  }

  const sbins = ['init', 'shutdown', 'reboot'];
  for (const b of sbins) {
    vfs.set(`/sbin/${b}`, { kind: 'file', content: '', readOnly: true, origin: 'remote' });
  }

  // /dev stubs (AC 3.1: devices visible to user)
  const devStubs = [
    ['null',   'c', '1', '3'],
    ['zero',   'c', '1', '5'],
    ['random', 'c', '1', '8'],
    ['tty',    'c', '5', '0'],
    ['sda',    'b', '8', '0'],
  ] as const;
  for (const [name, type, major, minor] of devStubs) {
    vfs.set(`/dev/${name}`, {
      kind: 'file',
      content: `${type === 'c' ? 'character' : 'block'} device ${major}:${minor}\n`,
      readOnly: true,
      origin: 'remote',
    });
  }

  // /proc stubs
  vfs.set('/proc/version', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: 'Linux version 6.1.0-fictos (build@sandbox) (gcc 12.2.0) #1 SMP\n',
  });
  vfs.set('/proc/uptime', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: '3600.00 3599.00\n',
  });
  vfs.set('/proc/meminfo', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: [
      'MemTotal:        1048576 kB',
      'MemFree:          524288 kB',
      'MemAvailable:     786432 kB',
      'Buffers:           32768 kB',
      'Cached:           196608 kB',
      '',
    ].join('\n'),
  });
  vfs.set('/proc/cpuinfo', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: [
      'processor\t: 0',
      'model name\t: FictOS Virtual CPU @ 2.00GHz',
      'cpu MHz\t\t: 2000.000',
      'cache size\t: 4096 KB',
      '',
    ].join('\n'),
  });

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
  vfs.set('/etc/fstab', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: [
      '# <file system>  <mount point>  <type>   <options>       <dump>  <pass>',
      'proc             /proc          proc     defaults          0       0',
      'tmpfs            /tmp           tmpfs    defaults          0       0',
      '',
    ].join('\n'),
  });
  vfs.set('/etc/shells', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: '/bin/sh\n/bin/bash\n',
  });
  vfs.set('/etc/passwd', {
    kind: 'file', readOnly: true, origin: 'remote',
    content: `root:x:0:0:root:/root:/bin/bash\n${hostname.split('.')[0]}:x:1000:1000::/home/${hostname.split('.')[0]}:/bin/bash\n`,
  });

  return vfs;
}

/**
 * Ingest vfs.json entries into an existing VFS.
 * AC 3.3 Setup Layer: all entries become origin:'setup' (distinct from the
 * kernel 'remote' base layer and user 'local' delta layer).
 */
function ingestRemoteVFS(vfs: DesktopVFSMap, vfsData: VFSStateFile): void {
  for (const [rawPath, entry] of Object.entries(vfsData)) {
    const abs = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    ensureDirs(vfs, abs);
    if (typeof entry === 'string') {
      vfs.set(abs, { kind: 'file', content: entry, readOnly: true, origin: 'setup' });
    } else {
      vfs.set(abs, {
        kind: 'url',
        href: (entry as { url: string; mimeType: string }).url,
        mimeType: (entry as { url: string; mimeType: string }).mimeType,
        readOnly: true,
        origin: 'setup',
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
    case 'ticket-app':
      return { view: 'list' };
    case 'file-explorer':
      return { cwd: env['HOME'] ?? '/home/user', selectedPath: null };
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
