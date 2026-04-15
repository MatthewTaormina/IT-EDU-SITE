/**
 * LinuxMachine — Shared type definitions
 *
 * Phase 1 of the desktop OS simulator. Pure types only — no React, no side-effects.
 *
 * The desktop extends the TerminalSandbox VFS with two additional entry kinds:
 *   • 'url'     — read-only remote asset pointer (image, binary); renders as
 *                 <img> in the file viewer or triggers a real browser download
 *   • 'symlink' — alias to another absolute VFS path
 *
 * All apps share one DesktopVFSMap via MachineContext — the terminal, browser,
 * email client, and text editor all read and write the same virtual filesystem.
 */

// ─── Extended VFS ─────────────────────────────────────────────────────────────

/**
 * Every VFS entry carries an `origin` field that records which layer of the
 * three-layer filesystem it belongs to:
 *   'remote' — kernel system dirs/files built by buildRemoteVFS; re-fetched each boot.
 *   'setup'  — project-specific files ingested from vfs.json; re-fetched each boot.
 *   'local'  — user-created or modified during the session; persisted to sessionStorage.
 *
 * Only 'local' entries are written to sessionStorage, keeping it lean. On the
 * next boot the remote + setup baselines are re-fetched and the local delta is
 * overlaid on top.
 */
export type VFSOrigin = 'remote' | 'setup' | 'local';

export type DesktopVFSEntry =
  | { kind: 'file';    content: string; readOnly?: boolean; origin: VFSOrigin }
  | { kind: 'dir';     origin: VFSOrigin }
  | { kind: 'url';     href: string; mimeType: string; readOnly: true; origin: VFSOrigin }
  | { kind: 'symlink'; target: string; origin: VFSOrigin };

/** The shared filesystem: absolute POSIX path → entry */
export type DesktopVFSMap = Map<string, DesktopVFSEntry>;

// ─── App identifiers ──────────────────────────────────────────────────────────

export type AppId = 'terminal' | 'browser' | 'email' | 'text-editor' | 'ticket-app' | 'file-explorer';

// ─── Per-app window-level state ───────────────────────────────────────────────

export interface TerminalAppState {
  cwd: string;
  history: string[];
}

export interface BrowserAppState {
  url: string;
  history: string[];
  historyIndex: number;
}

export interface EmailAppState {
  view: 'inbox' | 'compose' | 'sent' | 'message';
  openMessageId?: string;
}

export interface TextEditorAppState {
  filePath: string | null;
  content: string;
  dirty: boolean;
  cursorLine: number;
  cursorCol: number;
}

export interface TicketAppState {
  view: 'list' | 'new' | 'detail';
  /** ID of the currently open ticket in detail view */
  openTicketId?: string;
}

export interface FileExplorerAppState {
  /** Current directory path displayed in the right pane */
  cwd: string;
  /** Currently selected VFS path (file or dir), or null */
  selectedPath: string | null;
}

export type AppState =
  | TerminalAppState
  | BrowserAppState
  | EmailAppState
  | TextEditorAppState
  | TicketAppState
  | FileExplorerAppState;

// ─── Windows ──────────────────────────────────────────────────────────────────

export type WindowDisplayState = 'normal' | 'minimized' | 'maximized';

export interface WindowEntry {
  id: string;
  app: AppId;
  title: string;
  displayState: WindowDisplayState;
  /** Position in logical desktop pixels (origin = top-left of desktop area) */
  position: { x: number; y: number };
  /** Size when displayState is 'normal' — saved so maximize/restore works */
  size: { width: number; height: number };
  /** Paint-order: higher value is on top */
  zIndex: number;
  /** App-specific inner state */
  appState: AppState;
}

// ─── Processes ────────────────────────────────────────────────────────────────

export type ProcessStatus = 'running' | 'sleeping' | 'stopped';

export interface ProcessEntry {
  pid: number;
  name: string;
  status: ProcessStatus;
  /** Date.now() at spawn time — used by ps / top */
  startedAt: number;
  /** Window that owns this process, if any */
  windowId?: string;
}

// ─── Top-level machine state ──────────────────────────────────────────────────

export interface MachineState {
  hostname: string;
  user: string;
  vfs: DesktopVFSMap;
  windows: WindowEntry[];
  /** Monotonic counter for generating unique window IDs */
  nextWindowId: number;
  /** ID of the currently focused window, or null if all are minimized/closed */
  focusedWindowId: string | null;
  processes: ProcessEntry[];
  /** Monotonic PID counter — starts at 1 */
  nextPid: number;
  /** Origins / fictional slugs the browser app is allowed to navigate to */
  browserAllowedSites: string[];
  /** Global environment variables available to all apps */
  env: Record<string, string>;
  /**
   * Base URL of the state endpoint this machine was booted from.
   * Apps use this to fetch their own sub-resources, e.g.:
   *   `${stateEndpoint}/mail/inbox.json`
   * Undefined when the machine was booted without a state endpoint.
   */
  stateEndpoint?: string;
}

// ─── Virtual fetch (kernel HTTP simulation) ───────────────────────────────────

/**
 * Response object returned by `kernel.vfetch()`.
 * Mirrors the shape of the Fetch API Response for familiarity.
 */
export interface VFetchResponse {
  ok:         boolean;
  status:     number;
  statusText: string;
  /** Parsed JSON body, or null when the response body is not valid JSON. */
  data:       unknown;
  /** Raw text body */
  text:       string;
}

// ─── Kernel API (the syscall surface exposed to all apps) ───────────────────

export interface KernelAPI {
  // ── VFS reads (synchronous — read directly from current state) ────────────
  readFile(path: string): string | null;
  readEntry(path: string): DesktopVFSEntry | undefined;
  listDir(path: string): string[];
  exists(path: string): boolean;

  // ── VFS writes (each dispatches a reducer action) ───────────────────────
  writeFile(path: string, content: string): void;
  writeUrlEntry(path: string, href: string, mimeType: string): void;
  mkdir(path: string, parents?: boolean): void;
  deleteEntry(path: string, recursive?: boolean): void;
  move(from: string, to: string): void;

  /**
   * Shell bridge — called by TerminalApp after every command.
   * Replaces the machine VFS with the shell's post-command VFS.
   * The shell only ever writes 'file' / 'dir' entries; 'url' and 'symlink'
   * entries from the original machine VFS are preserved because the shell
   * never creates or overwrites them (it starts from a copy of the machine VFS).
   */
  syncShellVFS(vfs: DesktopVFSMap): void;

  // ── Window management ──────────────────────────────────────────────────
  openWindow(app: AppId, title: string, appState?: AppState, position?: { x: number; y: number }): void;
  closeWindow(id: string): void;
  focusWindow(id: string): void;
  minimizeWindow(id: string): void;
  restoreWindow(id: string): void;
  maximizeWindow(id: string): void;
  setWindowTitle(id: string, title: string): void;
  updateWindowAppState(id: string, appState: AppState): void;
  moveWindow(id: string, x: number, y: number): void;
  resizeWindow(id: string, width: number, height: number): void;

  // ── Process management ─────────────────────────────────────────────────
  spawnProcess(name: string, windowId?: string): void;
  killProcess(pid: number): void;

  // ── Virtual HTTP (simulated network) ──────────────────────────────────
  /**
   * Simulated HTTP fetch for in-sandbox apps.
   *
   * URL routing:
   *   sandbox://api/{path}  → reads /var/api/{path}.json from VFS;
   *                           falls back to {stateEndpoint}/api/{path} if
   *                           a state endpoint is configured.
   *   sandbox://…           → 404 for unrecognised schemes.
   *
   * Always resolves (never rejects). Check `response.ok` for success.
   */
  vfetch(url: string): Promise<VFetchResponse>;

  // ── "Open With" — sandbox:// URL dispatcher ────────────────────────────
  /**
   * Parse a `sandbox://` URL and open the matching desktop app.
   *
   * Every app is addressable with query-param style (preferred) or, for
   * ticket-app and file-explorer, the legacy path style still works.
   *
   * Route table:
   *   sandbox://terminal                          → Terminal (HOME cwd)
   *   sandbox://terminal?cwd=<path>               → Terminal at <path>
   *   sandbox://browser                           → Browser (about:home)
   *   sandbox://browser?url=<url>                 → Browser at <url>
   *   sandbox://text-editor                       → Text Editor (new buffer)
   *   sandbox://text-editor?path=<path>           → Text Editor opens <path>
   *   sandbox://email                             → Email inbox
   *   sandbox://email?view=compose                → Email compose
   *   sandbox://email?view=sent                   → Email sent
   *   sandbox://email?view=message&id=<id>        → Email message <id>
   *   sandbox://ticket-app                        → Ticket list
   *   sandbox://ticket-app?view=new               → New ticket
   *   sandbox://ticket-app?view=detail&id=<id>    → Ticket detail <id>
   *   sandbox://ticket-app/new                    → New ticket (legacy)
   *   sandbox://ticket-app/detail/<id>            → Ticket detail (legacy)
   *   sandbox://file-explorer                     → File Explorer at HOME
   *   sandbox://file-explorer?cwd=<path>          → File Explorer at <path>
   *   sandbox://file-explorer/<path>              → File Explorer at <path> (legacy)
   *
   * Silently ignored for unrecognised slugs.
   */
  openWith(url: string): void;
}

// ─── Reducer actions ──────────────────────────────────────────────────────────

export type MachineAction =
  // ── VFS ─────────────────────────────────────────────────────────────────
  | { type: 'VFS_WRITE';     path: string; content: string }
  | { type: 'VFS_WRITE_URL'; path: string; href: string; mimeType: string }
  | { type: 'VFS_MKDIR';     path: string; parents?: boolean }
  | { type: 'VFS_DELETE';    path: string; recursive?: boolean }
  | { type: 'VFS_MOVE';      from: string; to: string }
  // ── Windows ─────────────────────────────────────────────────────────────
  | {
      type: 'WINDOW_OPEN';
      app: AppId;
      title: string;
      appState?: AppState;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }
  | { type: 'WINDOW_CLOSE';            id: string }
  | { type: 'WINDOW_FOCUS';            id: string }
  | { type: 'WINDOW_MINIMIZE';         id: string }
  | { type: 'WINDOW_MAXIMIZE';         id: string }
  | { type: 'WINDOW_RESTORE';          id: string }
  | { type: 'WINDOW_MOVE';             id: string; x: number; y: number }
  | { type: 'WINDOW_RESIZE';           id: string; width: number; height: number }
  | { type: 'WINDOW_SET_TITLE';        id: string; title: string }
  | { type: 'WINDOW_UPDATE_APP_STATE'; id: string; appState: AppState }
  // ── Processes ────────────────────────────────────────────────────────────
  | { type: 'PROCESS_SPAWN';         name: string; windowId?: string }
  | { type: 'PROCESS_KILL';          pid: number }
  | { type: 'PROCESS_UPDATE_STATUS'; pid: number; status: ProcessStatus }
  // ── Shell bridge ─────────────────────────────────────────────────────────
  /**
   * Replace the entire VFS in one shot. Used by TerminalApp after a shell
   * command mutates the working copy. Cheaper than diffing individual entries.
   */
  | { type: 'VFS_REPLACE'; vfs: DesktopVFSMap }
  // ── Boot ─────────────────────────────────────────────────────────────────
  /**
   * Reset the entire machine state — used when a state file finishes loading
   * after a blank-slate initial render.
   */
  | { type: 'MACHINE_RESET'; state: MachineState };

// ─── State endpoint API contract ─────────────────────────────────────────────
//
// The state endpoint is a base URL (e.g. '/desktop-states/project-01').
// The loader fetches sub-resources from it:
//
//   {base}/manifest.json   — machine config (required)
//   {base}/vfs.json        — read-only base filesystem entries (optional)
//
// Apps fetch their own resources as needed:
//   {base}/mail/inbox.json — EmailApp: inbox messages
//   {base}/mail/sent.json  — EmailApp: sent messages
//
// In the future these can be real API routes backed by S3 / a database.
// For now they are static JSON files served from /public/desktop-states/.

/**
 * A VFS file entry in vfs.json can be:
 *   • a plain string  — stored as a text file, readOnly: true, origin: 'remote'
 *   • { url, mimeType } — stored as a 'url' pointer, readOnly: true, origin: 'remote'
 */
export type StateFileEntry = string | { url: string; mimeType: string };

/**
 * {base}/manifest.json
 * Defines machine identity and launch configuration.
 * Fetched once on boot; never stored in sessionStorage.
 */
export interface DesktopStateManifest {
  /** Schema version — must be 1 */
  version: 1;
  hostname?: string;
  user?: string;
  /** Allowed site origins and fictional slugs for the browser app */
  browserAllowedSites?: string[];
  /** Windows to open automatically on first boot (skipped if session exists) */
  initialWindows?: Array<{
    app: AppId;
    title: string;
    appState?: AppState;
  }>;
  /**
   * Optional overrides for sub-resource paths (relative to base endpoint).
   * Defaults: { vfs: 'vfs.json', mail: 'mail/' }
   */
  resources?: {
    vfs?: string;
    mail?: string;
  };
}

/**
 * {base}/vfs.json
 * Read-only baseline filesystem entries loaded once at boot.
 * Large assets, project scaffolding, pre-written config files, etc.
 * Never stored in sessionStorage — always re-fetched on next boot.
 */
export type VFSStateFile = Record<string, StateFileEntry>;

/** @deprecated Use DesktopStateManifest + VFSStateFile. Kept for migration shims. */
export interface DesktopStateFile extends DesktopStateManifest {
  files?: VFSStateFile;
}
