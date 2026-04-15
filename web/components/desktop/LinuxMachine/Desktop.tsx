'use client';

/**
 * Desktop — wallpaper + app icon grid
 *
 * App icons sit in a column along the top-left of the desktop.
 * Clicking an icon opens the corresponding app window.
 *
 * AODA notes:
 *   • Icon buttons carry aria-label matching label text (no icon-only a11y gap).
 *   • Arrow-key navigation between icons (role="toolbar" on the icon container).
 *   • Double-click opens the app; Enter/Space key also opens it (via onClick,
 *     which fires on keyboard activation).
 *   • The wallpaper div uses role="presentation" — it is purely decorative.
 */

import { useCallback, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useKernel, useMachineState } from './MachineContext';
import type { AppId } from './MachineTypes';
import { TerminalIcon, BrowserIcon, EmailIcon, TextEditorIcon, TicketIcon, FileExplorerIcon } from './AppIcons';

// ─── Icon registry ────────────────────────────────────────────────────────────

interface AppIconSpec {
  id: AppId;
  label: string;
  icon: ReactNode;
  defaultTitle: string;
}

const DESKTOP_ICONS: readonly AppIconSpec[] = [
  { id: 'terminal',      label: 'Terminal',       icon: <TerminalIcon className="w-7 h-7" />,      defaultTitle: 'Terminal'      },
  { id: 'browser',       label: 'Browser',        icon: <BrowserIcon className="w-7 h-7" />,       defaultTitle: 'Web Browser'   },
  { id: 'email',         label: 'Email',          icon: <EmailIcon className="w-7 h-7" />,         defaultTitle: 'Inbox'         },
  { id: 'text-editor',   label: 'Text Editor',    icon: <TextEditorIcon className="w-7 h-7" />,    defaultTitle: 'New Document'  },
  { id: 'ticket-app',    label: 'Ticket Manager', icon: <TicketIcon className="w-7 h-7" />,        defaultTitle: 'Ticket Manager'},
  { id: 'file-explorer', label: 'File Explorer',  icon: <FileExplorerIcon className="w-7 h-7" />,  defaultTitle: 'File Explorer' },
];

// ─── Icon button ──────────────────────────────────────────────────────────────

interface DesktopIconProps {
  spec: AppIconSpec;
  onOpen: (id: AppId, title: string) => void;
}

function DesktopIcon({ spec, onOpen }: DesktopIconProps) {
  return (
    /*
     * Single <button> handles both mouse click and keyboard Enter/Space.
     * aria-label carries the full text label so the symbol glyph is ignorable
     * by assistive technology.
     */
    <button
      type="button"
      aria-label={`Open ${spec.label}`}
      className={[
        'flex flex-col items-center gap-1 p-2 rounded-lg w-[72px]',
        'text-[#c9d1d9] hover:bg-white/10',
        'transition-colors duration-100',
      ].join(' ')}
      onClick={() => onOpen(spec.id, spec.defaultTitle)}
    >
      {/* Icon tile */}
      <span
        aria-hidden="true"
        className={[
          'flex items-center justify-center',
          'w-12 h-12 rounded-xl',
          'bg-[#1c2a3a] border border-[#30465c]',
          'text-[#79b8ff]',
        ].join(' ')}
      >
        {spec.icon}
      </span>
      {/* Label */}
      <span className="text-[11px] leading-tight text-center text-[#c9d1d9] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {spec.label}
      </span>
    </button>
  );
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

export function Desktop() {
  const kernel    = useKernel();
  const state     = useMachineState();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const openApp = useCallback((id: AppId, title: string) => {
    kernel.openWindow(id, title);
  }, [kernel]);

  // Arrow-key navigation within the icon toolbar
  const handleToolbarKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();

    const buttons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button'));
    const idx = buttons.findIndex(b => b === document.activeElement);
    if (idx === -1) { buttons[0]?.focus(); return; }

    const next = e.key === 'ArrowDown'
      ? (idx + 1) % buttons.length
      : (idx - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }, []);

  return (
    /* Wallpaper layer — fills parent (absolute inset-0 set by parent) */
    <div
      role="presentation"
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(145deg, #1a2535 0%, #0d1a2c 60%, #0a1520 100%)',
      }}
    >
      {/* App icon column — top-left corner */}
      <nav
        aria-label="Desktop application shortcuts"
      >
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label="Desktop icons"
          aria-orientation="vertical"
          className="flex flex-col gap-1 p-3"
          onKeyDown={handleToolbarKeyDown}
        >
          {DESKTOP_ICONS.map(spec => (
            <DesktopIcon key={spec.id} spec={spec} onOpen={openApp} />
          ))}
        </div>
      </nav>

      {/* Hostname watermark — decorative, aria-hidden */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 right-4 text-[11px] text-white/10 font-mono select-none pointer-events-none"
      >
        {state.hostname}
      </div>
    </div>
  );
}
