'use client';

/**
 * LinuxMachine — FileExplorerApp (AC 3.4)
 *
 * Two-panel file explorer for the desktop VFS.
 *
 * Layout
 * ──────
 *   Left panel  — directory tree (collapsible, keyboard navigable)
 *   Right panel — file/dir listing for the current directory (cwd)
 *   Status bar  — shows selected path, type, size, and origin layer
 *
 * Layered VFS display (AC 3.3)
 * ────────────────────────────
 *   Entries are colour-coded by origin layer:
 *     remote → dim grey   (kernel base layer)
 *     setup  → muted blue (project setup layer)
 *     local  → white      (user layer — writable)
 *
 * AODA
 * ────
 * • Both panels use role="tree" / role="treeitem" with aria-expanded and
 *   aria-selected.
 * • File listing uses role="listbox" with role="option" items.
 * • Keyboard: ArrowUp/Down to move focus, Enter to open, Backspace to go up.
 * • Status bar uses aria-live="polite" to announce selection changes.
 * • All icons are aria-hidden; visible text labels accompany them.
 */

import { useState, useCallback, useEffect, useRef, useMemo, type KeyboardEvent } from 'react';
import { useKernel, useMachineState } from '../LinuxMachine/MachineContext';
import type { FileExplorerAppState, TextEditorAppState, BrowserAppState, VFSOrigin } from '../LinuxMachine/MachineTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function basename(p: string): string {
  return p.split('/').filter(Boolean).at(-1) ?? '/';
}

function parentPath(p: string): string {
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  return '/' + parts.slice(0, -1).join('/');
}

function joinPath(dir: string, name: string): string {
  return (dir === '/' ? '' : dir) + '/' + name;
}

/** Format byte count as human-readable string. */
function formatSize(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Origin layer colors (AC 3.3) ─────────────────────────────────────────────

const ORIGIN_COLOR: Record<VFSOrigin, string> = {
  remote: '#484f58',  // kernel base layer — dim (read-only system)
  setup:  '#388bfd',  // project setup layer — muted blue
  local:  '#c9d1d9',  // user layer — bright (user-owned)
};
const ORIGIN_LABEL: Record<VFSOrigin, string> = {
  remote: 'System',
  setup:  'Project',
  local:  'User',
};

// ─── VFS entry info ───────────────────────────────────────────────────────────

interface EntryInfo {
  path:     string;
  name:     string;
  kind:     'dir' | 'file' | 'url' | 'symlink';
  origin:   VFSOrigin;
  readOnly: boolean;
  size?:    number;   // bytes for file entries
  href?:    string;   // for url entries
}

// ─── FileExplorerApp ──────────────────────────────────────────────────────────

export interface FileExplorerAppProps {
  windowId: string;
  appState: FileExplorerAppState;
}

export function FileExplorerApp({ windowId, appState }: FileExplorerAppProps) {
  const kernel = useKernel();
  const state  = useMachineState();

  const [cwd,      setCwd]      = useState(appState.cwd);
  const [selected, setSelected] = useState<string | null>(appState.selectedPath);
  const [liveMsg,  setLiveMsg]  = useState('');

  // Sync cwd/selected into kernel window appState
  const sync = useCallback((newCwd: string, newSel: string | null) => {
    kernel.updateWindowAppState(windowId, { cwd: newCwd, selectedPath: newSel } satisfies FileExplorerAppState);
  }, [kernel, windowId]);

  // Build the listing for the current directory from VFS
  const listDir = useCallback((dir: string): EntryInfo[] => {
    const names = kernel.listDir(dir);
    const entries: EntryInfo[] = [];
    for (const name of names) {
      const p = joinPath(dir, name);
      const entry = state.vfs.get(p);
      if (!entry) continue;
      const kind = entry.kind;
      const origin: VFSOrigin = 'origin' in entry && entry.origin ? entry.origin : 'local';
      const readOnly = 'readOnly' in entry ? (entry.readOnly ?? false) : false;
      const size = entry.kind === 'file' ? entry.content.length : undefined;
      const href = entry.kind === 'url' ? entry.href : undefined;
      entries.push({ path: p, name, kind, origin, readOnly, size, href });
    }
    // Dirs first, then files
    return entries.sort((a, b) => {
      if (a.kind === 'dir' && b.kind !== 'dir') return -1;
      if (a.kind !== 'dir' && b.kind === 'dir') return  1;
      return a.name.localeCompare(b.name);
    });
  }, [kernel, state.vfs]);

  const entries = useMemo(() => listDir(cwd), [listDir, cwd]);

  // Pre-compute a parent → [child dir paths] map in a single O(N) VFS scan.
  // Each TreeNode can then look up its children in O(1) instead of scanning
  // all VFS keys on every render.
  const childDirsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [p, entry] of state.vfs) {
      if (p === '/') continue;
      if ((entry as { kind?: string }).kind !== 'dir') continue;
      const parent = parentPath(p);
      const list = map.get(parent);
      if (list) list.push(p);
      else map.set(parent, [p]);
    }
    for (const list of map.values()) list.sort();
    return map;
  }, [state.vfs]);

  const navigate = useCallback((path: string) => {
    setCwd(path);
    setSelected(null);
    setLiveMsg(`Navigated to ${path}`);
    sync(path, null);
  }, [sync]);

  const select = useCallback((path: string) => {
    setSelected(path);
    setLiveMsg(`Selected ${path}`);
    sync(cwd, path);
  }, [cwd, sync]);

  const openEntry = useCallback((entry: EntryInfo) => {
    if (entry.kind === 'dir') {
      navigate(entry.path);
    } else if (entry.kind === 'file') {
      const content = kernel.readFile(entry.path) ?? '';
      const title   = basename(entry.path);
      const appState: TextEditorAppState = { filePath: entry.path, content, dirty: false, cursorLine: 1, cursorCol: 1 };
      kernel.openWindow('text-editor', title, appState);
    } else if (entry.kind === 'url') {
      const href = entry.href ?? '';
      const appState: BrowserAppState = { url: href, history: [href], historyIndex: 0 };
      kernel.openWindow('browser', basename(entry.path), appState);
    } else {
      select(entry.path);
    }
  }, [kernel, navigate, select]);

  // Keyboard navigation in the right panel
  const listRef = useRef<HTMLUListElement>(null);
  const handleListKey = (e: KeyboardEvent<HTMLElement>, entry: EntryInfo) => {
    if (e.key === 'Enter')     { e.preventDefault(); openEntry(entry); }
    if (e.key === 'Backspace') { e.preventDefault(); navigate(parentPath(cwd)); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"] ~ li') ??
                   listRef.current?.querySelector<HTMLElement>('li:first-child');
      next?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const items = listRef.current?.querySelectorAll<HTMLElement>('li[tabindex]');
      if (!items) return;
      const arr = Array.from(items);
      const cur = document.activeElement;
      const idx = arr.indexOf(cur as HTMLElement);
      if (idx > 0) arr[idx - 1]?.focus();
    }
  };

  const selectedEntry = selected ? state.vfs.get(selected) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d1117', color: '#c9d1d9', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}>
      {/* AODA live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{liveMsg}</div>

      {/* Address bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#161b22', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <button type="button" aria-label="Go to parent directory" disabled={cwd === '/'} onClick={() => navigate(parentPath(cwd))}
          style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: '0.25rem', color: cwd === '/' ? '#30363d' : '#8b949e', cursor: cwd === '/' ? 'default' : 'pointer', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ↑
        </button>
        <label htmlFor={`fex-addr-${windowId}`} className="sr-only">Current directory</label>
        <input
          id={`fex-addr-${windowId}`}
          type="text"
          readOnly
          value={cwd}
          aria-label="Current directory path"
          style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: '0.25rem', color: '#c9d1d9', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
        />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: directory tree */}
        <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid #21262d', overflow: 'auto', background: '#0d1117' }}>
          <DirectoryTree
            childDirsMap={childDirsMap}
            cwd={cwd}
            onNavigate={navigate}
          />
        </div>

        {/* Right: file listing */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem' }} role="region" aria-label={`Contents of ${cwd}`}>
          {entries.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#484f58' }}>
              Empty directory
            </div>
          ) : (
            <ul ref={listRef} role="listbox" aria-label={`Files in ${cwd}`} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {entries.map(entry => (
                <FileEntry
                  key={entry.path}
                  entry={entry}
                  isSelected={selected === entry.path}
                  onSelect={() => select(entry.path)}
                  onOpen={() => openEntry(entry)}
                  onKeyDown={e => handleListKey(e, entry)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ flexShrink: 0, padding: '0.3rem 0.75rem', background: '#161b22', borderTop: '1px solid #21262d', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <span style={{ color: '#484f58', fontSize: '0.7rem' }}>
          {entries.length} item{entries.length !== 1 ? 's' : ''}
        </span>
        {selected && selectedEntry && (
          <>
            <span style={{ color: '#8b949e', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '18rem' }}>
              {selected}
            </span>
            {'origin' in selectedEntry && (
              <span style={{ fontSize: '0.7rem', color: ORIGIN_COLOR[(selectedEntry.origin ?? 'local') as VFSOrigin] }}>
                {ORIGIN_LABEL[(selectedEntry.origin ?? 'local') as VFSOrigin]}
              </span>
            )}
            {selectedEntry.kind === 'file' && (
              <span style={{ color: '#8b949e', fontSize: '0.7rem' }}>
                {formatSize(selectedEntry.content.length)}
              </span>
            )}
            {'readOnly' in selectedEntry && selectedEntry.readOnly && (
              <span style={{ color: '#e3b341', fontSize: '0.7rem' }}>read-only</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── FileEntry ────────────────────────────────────────────────────────────────

interface FileEntryProps {
  entry:      EntryInfo;
  isSelected: boolean;
  onSelect:   () => void;
  onOpen:     () => void;
  onKeyDown:  (e: KeyboardEvent<HTMLLIElement>) => void;
}

function FileEntry({ entry, isSelected, onSelect, onOpen, onKeyDown }: FileEntryProps) {
  const icon = entry.kind === 'dir' ? '📁' : entry.kind === 'url' ? '🔗' : '📄';
  const color = ORIGIN_COLOR[entry.origin];

  return (
    <li
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={onKeyDown}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '0.4rem',
        padding:      '0.25rem 0.4rem',
        borderRadius: '0.25rem',
        cursor:       'pointer',
        userSelect:   'none',
        background:   isSelected ? '#1c2a3a' : 'transparent',
        outline:      'none',
      }}
      onFocus={onSelect}
    >
      <span aria-hidden="true" style={{ fontSize: '0.85rem', lineHeight: 1 }}>{icon}</span>
      <span style={{ color, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.name}
      </span>
      {entry.kind === 'dir' && <span aria-hidden="true" style={{ color: '#484f58', fontSize: '0.65rem' }}>DIR</span>}
      {entry.size !== undefined && (
        <span style={{ color: '#484f58', fontSize: '0.65rem', flexShrink: 0 }}>{formatSize(entry.size)}</span>
      )}
    </li>
  );
}

// ─── DirectoryTree (left panel) ───────────────────────────────────────────────

interface DirectoryTreeProps {
  childDirsMap: Map<string, string[]>;
  cwd:          string;
  onNavigate:   (path: string) => void;
}

function DirectoryTree({ childDirsMap, cwd, onNavigate }: DirectoryTreeProps) {
  return (
    <nav aria-label="Directory tree" style={{ padding: '0.5rem 0' }}>
      <ul role="tree" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <TreeNode
          path="/"
          label="/"
          level={0}
          cwd={cwd}
          childDirsMap={childDirsMap}
          onNavigate={onNavigate}
          defaultExpanded
        />
      </ul>
    </nav>
  );
}

interface TreeNodeProps {
  path:             string;
  label:            string;
  level:            number;
  cwd:              string;
  childDirsMap:     Map<string, string[]>;
  onNavigate:       (path: string) => void;
  defaultExpanded?: boolean;
}

function TreeNode({ path, label, level, cwd, childDirsMap, onNavigate, defaultExpanded }: TreeNodeProps) {
  const isActive = cwd === path || cwd.startsWith(path === '/' ? '/' : path + '/');
  const [expanded, setExpanded] = useState(defaultExpanded ?? isActive);

  // Auto-expand when cwd is inside this node
  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  // O(1) lookup — childDirsMap was built with a single VFS scan in the parent
  const children = childDirsMap.get(path) ?? [];

  const indent = level * 12;
  const isCwd  = cwd === path;

  return (
    <li role="treeitem" aria-expanded={children.length > 0 ? expanded : undefined} aria-selected={isCwd}>
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '0.25rem',
          padding:      '0.15rem 0.4rem',
          paddingLeft:  `${indent + 8}px`,
          cursor:       'pointer',
          background:   isCwd ? '#1c2a3a' : 'transparent',
          borderRadius: '0.2rem',
          color:        isCwd ? '#79b8ff' : '#8b949e',
          userSelect:   'none',
          fontSize:     '0.78rem',
        }}
        onClick={() => { onNavigate(path); if (children.length > 0) setExpanded(e => !e); }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(path); if (children.length > 0) setExpanded(ex => !ex); } }}
        tabIndex={0}
        role="button"
        aria-label={`Navigate to ${path}`}
      >
        {children.length > 0 && (
          <span aria-hidden="true" style={{ fontSize: '0.6rem', color: '#484f58', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.1s' }}>▶</span>
        )}
        {children.length === 0 && <span style={{ width: '0.6rem', display: 'inline-block' }} />}
        <span aria-hidden="true">📁</span>
        <span>{label}</span>
      </div>
      {expanded && children.length > 0 && (
        <ul role="group" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {children.map(childPath => (
            <TreeNode
              key={childPath}
              path={childPath}
              label={basename(childPath)}
              level={level + 1}
              cwd={cwd}
              childDirsMap={childDirsMap}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
