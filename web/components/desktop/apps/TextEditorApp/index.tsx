'use client';

/**
 * LinuxMachine — TextEditorApp
 *
 * A GUI text editor that shares the machine VFS with the TerminalApp.
 * Files written here are immediately visible in the terminal (and vice versa).
 *
 * Features
 * ────────
 * • Open files from the VFS via a file-picker panel (sidebar)
 * • Edit in a full-height textarea
 * • Save (Ctrl+S / Save button) calls kernel.writeFile()
 * • Unsaved changes tracked with a "dirty" indicator
 * • Font: monospace, same palette as the terminal
 * • New Buffer: create a file at a specified path
 *
 * VFS integration
 * ───────────────
 * Reads and writes via kernel.readFile() / kernel.writeFile() so any change
 * is reflected in the machine's DesktopVFSMap immediately.
 *
 * appState persistence
 * ────────────────────
 * The window's TextEditorAppState (filePath, content, dirty, cursor) is
 * synced via kernel.updateWindowAppState() on every meaningful change so
 * it survives window re-renders.
 *
 * AODA
 * ────
 * • Toolbar buttons: aria-label, aria-disabled when unavailable
 * • File picker: role="tree", each item role="treeitem" with aria-selected
 * • Textarea: aria-label, aria-multiline, spellCheck=false
 * • Unsaved indicator: visually marked with "(unsaved)" + sr-only text
 * • Ctrl+S: intercept in onKeyDown so keyboard-only users can save
 * • Status bar: role="status", aria-live="polite"
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
} from 'react';

import { useKernel, useMachineState } from '../../LinuxMachine/MachineContext';
import type { TextEditorAppState } from '../../LinuxMachine/MachineTypes';

// ─── EditorToolbar ────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  label:    string;
  disabled?: boolean;
  onClick:  () => void;
  children: React.ReactNode;
}

function ToolbarButton({ label, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      className="px-3 py-1 rounded text-xs font-medium transition-colors"
      style={{
        background: disabled ? '#161b22' : '#21262d',
        color:      disabled ? '#484f58' : '#8b949e',
        border:     '1px solid #30363d',
        cursor:     disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = '#c9d1d9';
      }}
      onMouseLeave={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = '#8b949e';
      }}
    >
      {children}
    </button>
  );
}

// ─── TextEditorApp ────────────────────────────────────────────────────────────

export interface TextEditorAppProps {
  windowId: string;
  appState: TextEditorAppState;
}

export function TextEditorApp({ windowId, appState }: TextEditorAppProps) {
  const kernel       = useKernel();
  const machineState = useMachineState();

  // ── Editor state ─────────────────────────────────────────────────────────
  const [filePath,    setFilePath]    = useState<string | null>(appState.filePath);
  const [content,     setContent]     = useState(appState.content);
  const [dirty,       setDirty]       = useState(appState.dirty);
  const [cursorLine,  setCursorLine]  = useState(appState.cursorLine);
  const [cursorCol,   setCursorCol]   = useState(appState.cursorCol);

  // ── Sidebar (file picker) state ──────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newPathInput, setNewPathInput] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  // ── Status bar message ───────────────────────────────────────────────────
  const [statusMsg, setStatusMsg] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Persist to kernel on appState changes ────────────────────────────────
  const syncKernel = useCallback(
    (fp: string | null, c: string, d: boolean, cl: number, cc: number): void => {
      kernel.updateWindowAppState(windowId, {
        filePath: fp,
        content:  c,
        dirty:    d,
        cursorLine: cl,
        cursorCol:  cc,
      } satisfies TextEditorAppState);
    },
    [kernel, windowId],
  );

  // ── Save file ─────────────────────────────────────────────────────────────
  const save = useCallback((): void => {
    if (!filePath) {
      setShowNewInput(true);
      setStatusMsg('Enter a file path to save.');
      return;
    }
    kernel.writeFile(filePath, content);
    setDirty(false);
    syncKernel(filePath, content, false, cursorLine, cursorCol);
    setStatusMsg(`Saved: ${filePath}`);
  }, [filePath, content, kernel, syncKernel, cursorLine, cursorCol]);

  // ── Open file from VFS ────────────────────────────────────────────────────
  const openFile = useCallback((path: string): void => {
    const fileContent = kernel.readFile(path) ?? '';
    setFilePath(path);
    setContent(fileContent);
    setDirty(false);
    setCursorLine(1);
    setCursorCol(1);
    syncKernel(path, fileContent, false, 1, 1);
    setStatusMsg(`Opened: ${path}`);
    // Focus the textarea after a tick
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [kernel, syncKernel]);

  // ── New buffer ────────────────────────────────────────────────────────────
  const newBuffer = useCallback((): void => {
    setFilePath(null);
    setContent('');
    setDirty(false);
    setCursorLine(1);
    setCursorCol(1);
    syncKernel(null, '', false, 1, 1);
    setStatusMsg('New buffer.');
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [syncKernel]);

  // ── Save to new path ──────────────────────────────────────────────────────
  const saveAs = useCallback((): void => {
    const path = newPathInput.trim();
    if (!path) return;
    const abs = path.startsWith('/') ? path : `/${path}`;
    kernel.writeFile(abs, content);
    setFilePath(abs);
    setDirty(false);
    setShowNewInput(false);
    setNewPathInput('');
    syncKernel(abs, content, false, cursorLine, cursorCol);
    setStatusMsg(`Saved: ${abs}`);
  }, [newPathInput, content, kernel, syncKernel, cursorLine, cursorCol]);

  // ── Textarea change ───────────────────────────────────────────────────────
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const val = e.target.value;
    setContent(val);
    if (!dirty) {
      setDirty(true);
      syncKernel(filePath, val, true, cursorLine, cursorCol);
    }
  }, [dirty, filePath, syncKernel, cursorLine, cursorCol]);

  // ── Track cursor position ─────────────────────────────────────────────────
  const updateCursor = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>): void => {
    const ta  = e.currentTarget;
    const pos = ta.selectionStart ?? 0;
    const before = ta.value.slice(0, pos);
    const line = before.split('\n').length;
    const col  = before.length - before.lastIndexOf('\n');
    setCursorLine(line);
    setCursorCol(col);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      save();
    }
    // Tab → insert 2 spaces (standard editor behaviour)
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta    = e.currentTarget;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const next  = `${content.slice(0, start)}  ${content.slice(end)}`;
      setContent(next);
      setDirty(true);
      // Restore cursor position after the inserted spaces
      requestAnimationFrame(() => {
        ta.selectionStart = start + 2;
        ta.selectionEnd   = start + 2;
      });
    }
  }, [save, content]);

  // ── Build file tree from VFS (text files only, skip system dirs) ──────────
  const textPaths = (() => {
    const paths: string[] = [];
    const skipPfx = ['/bin', '/proc', '/usr'];
    for (const [path, entry] of machineState.vfs) {
      if (entry.kind !== 'file') continue;
      if (skipPfx.some(p => path.startsWith(p))) continue;
      paths.push(path);
    }
    return paths.sort();
  })();

  // ── Render ────────────────────────────────────────────────────────────────
  const displayName = filePath ?? 'New Buffer';
  const titleDirty  = dirty ? ' •' : '';

  return (
    <div
      className="flex flex-col h-full font-mono text-sm"
      style={{ background: '#0d1117', color: '#c9d1d9' }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
        aria-label="Editor toolbar"
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(o => !o)}
          className="w-7 h-7 flex items-center justify-center rounded text-xs"
          style={{
            background: sidebarOpen ? '#21262d' : 'transparent',
            color: '#8b949e',
            border: '1px solid transparent',
          }}
          aria-label={sidebarOpen ? 'Hide file explorer' : 'Show file explorer'}
          aria-pressed={sidebarOpen}
        >
          ≡
        </button>

        <span
          className="flex-1 truncate text-xs"
          style={{ color: dirty ? '#f0883e' : '#8b949e' }}
          aria-label={`${displayName}${dirty ? ' — unsaved changes' : ''}`}
        >
          {displayName}{titleDirty}
          {dirty && <span className="sr-only"> (unsaved)</span>}
        </span>

        <ToolbarButton label="New buffer" onClick={newBuffer}>New</ToolbarButton>
        <ToolbarButton
          label="Save file — Ctrl+S"
          disabled={!dirty && filePath !== null}
          onClick={save}
        >
          Save
        </ToolbarButton>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── File sidebar ────────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside
            className="shrink-0 overflow-y-auto"
            style={{
              width:       '13rem',
              background:  '#010409',
              borderRight: '1px solid #21262d',
            }}
            aria-label="File explorer"
          >
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: '1px solid #161b22' }}
            >
              <span className="text-xs font-semibold" style={{ color: '#484f58' }}>
                FILES
              </span>
              <button
                type="button"
                onClick={() => setShowNewInput(v => !v)}
                className="text-xs"
                style={{ color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="New file"
              >
                +
              </button>
            </div>

            {/* New file input */}
            {showNewInput && (
              <div className="px-2 py-2">
                <label htmlFor="new-file-path" className="sr-only">
                  New file path
                </label>
                <input
                  id="new-file-path"
                  type="text"
                  value={newPathInput}
                  placeholder="/home/user/file.txt"
                  autoFocus
                  className="w-full px-2 py-1 rounded text-xs"
                  style={{
                    background: '#161b22',
                    color:      '#c9d1d9',
                    border:     '1px solid #30363d',
                  }}
                  onChange={e => setNewPathInput(e.target.value)}
                  onFocus={e  => { e.currentTarget.style.borderColor = '#58a6ff'; }}
                  onBlur={e   => { e.currentTarget.style.borderColor = '#30363d'; }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveAs();
                    if (e.key === 'Escape') {
                      setShowNewInput(false);
                      setNewPathInput('');
                    }
                  }}
                />
              </div>
            )}

            {/* File list */}
            <ul
              role="tree"
              aria-label="Files"
              className="py-1"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {textPaths.map(path => (
                <li
                  key={path}
                  role="treeitem"
                  aria-selected={path === filePath}
                >
                  <button
                    type="button"
                    onClick={() => openFile(path)}
                    className="w-full text-left px-3 py-1 text-xs truncate"
                    style={{
                      background: path === filePath ? '#161b22' : 'transparent',
                      color:      path === filePath ? '#c9d1d9' : '#8b949e',
                      border:     'none',
                      cursor:     'pointer',
                      display:    'block',
                    }}
                    aria-label={`Open ${path}`}
                    onMouseEnter={e => {
                      if (path !== filePath)
                        (e.currentTarget as HTMLButtonElement).style.color = '#c9d1d9';
                    }}
                    onMouseLeave={e => {
                      if (path !== filePath)
                        (e.currentTarget as HTMLButtonElement).style.color = '#8b949e';
                    }}
                  >
                    {path.split('/').pop() ?? path}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* ── Editor pane ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <label htmlFor={`editor-textarea-${windowId}`} className="sr-only">
            {`Text editor — ${filePath ?? 'unsaved buffer'}.${dirty ? ' Has unsaved changes.' : ''}`}
          </label>
          <textarea
            id={`editor-textarea-${windowId}`}
            ref={textareaRef}
            value={content}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-multiline="true"
            aria-label={`Text editor — ${filePath ?? 'new buffer'}${dirty ? ' (unsaved)' : ''}`}
            className="flex-1 p-4 resize-none"
            style={{
              background: 'transparent',
              color:      '#c9d1d9',
              border:     'none',
              outline:    'none',
              fontFamily: 'monospace',
              fontSize:   'inherit',
              lineHeight: '1.6',
              caretColor: '#58a6ff',
            }}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={updateCursor}
            onClick={updateCursor}
          />
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-3 py-0.5 text-xs select-none"
        style={{ background: '#161b22', borderTop: '1px solid #21262d', color: '#484f58' }}
        role="status"
        aria-live="polite"
      >
        <span>{statusMsg || (filePath ? filePath : 'No file open')}</span>
        <span>
          Ln {cursorLine}, Col {cursorCol}
          {dirty && (
            <span style={{ color: '#f0883e', marginLeft: '0.5rem' }}>
              ● Unsaved
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
