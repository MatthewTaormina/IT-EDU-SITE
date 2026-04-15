'use client';

/**
 * Taskbar — bottom system bar
 *
 * Layout (left → right):
 *   [App launcher buttons] | [Running window buttons] | [Clock]
 *
 * AODA:
 *   • role="toolbar" + aria-label on the root element.
 *   • Sections separated by role="separator" (aria-orientation="vertical").
 *   • Each running-window button conveys its state via aria-label
 *     (e.g. "Terminal — minimized" or "Terminal — focused").
 *   • Clock uses a <time> element with dateTime attribute.
 *   • Arrow-key navigation within each section (ARIA toolbar pattern).
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useKernel, useMachineState } from './MachineContext';
import type { AppId, WindowEntry } from './MachineTypes';
import { TerminalIcon, BrowserIcon, EmailIcon, TextEditorIcon } from './AppIcons';

// ─── App launcher specs ───────────────────────────────────────────────────────

interface LauncherSpec {
  id: AppId;
  label: string;
  icon: ReactNode;
  defaultTitle: string;
}

const LAUNCHERS: readonly LauncherSpec[] = [
  { id: 'terminal',    label: 'Terminal',    icon: <TerminalIcon className="w-5 h-5" />,    defaultTitle: 'Terminal'     },
  { id: 'browser',     label: 'Browser',     icon: <BrowserIcon className="w-5 h-5" />,     defaultTitle: 'Web Browser'  },
  { id: 'email',       label: 'Email',       icon: <EmailIcon className="w-5 h-5" />,       defaultTitle: 'Inbox'        },
  { id: 'text-editor', label: 'Text Editor', icon: <TextEditorIcon className="w-5 h-5" />,  defaultTitle: 'New Document' },
];

// ─── Clock ────────────────────────────────────────────────────────────────────

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('en-CA', {
    hour:   '2-digit',
    minute: '2-digit',
  });
  const isoStr = now.toISOString();

  return (
    <time
      dateTime={isoStr}
      className="text-[12px] text-[#8b949e] tabular-nums px-2 shrink-0"
    >
      {timeStr}
    </time>
  );
}

// ─── Arrow-key toolbar helper ─────────────────────────────────────────────────

function useToolbarArrows(ref: React.RefObject<HTMLDivElement | null>) {
  return useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const buttons = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
    );
    if (buttons.length === 0) return;
    const idx = buttons.findIndex(b => b === document.activeElement);
    if (idx === -1) { buttons[0]?.focus(); return; }
    const next = e.key === 'ArrowRight'
      ? (idx + 1) % buttons.length
      : (idx - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }, [ref]);
}

// ─── Taskbar ──────────────────────────────────────────────────────────────────

export function Taskbar() {
  const kernel       = useKernel();
  const state        = useMachineState();
  const launcherRef  = useRef<HTMLDivElement>(null);
  const windowsRef   = useRef<HTMLDivElement>(null);

  const handleLauncherKeys = useToolbarArrows(launcherRef);
  const handleWindowsKeys  = useToolbarArrows(windowsRef);

  // Clicking a running-window button: focused + visible → minimize; otherwise → focus/restore
  const handleWindowButton = useCallback((win: WindowEntry) => {
    if (win.id === state.focusedWindowId && win.displayState !== 'minimized') {
      kernel.minimizeWindow(win.id);
    } else {
      kernel.focusWindow(win.id);
    }
  }, [state.focusedWindowId, kernel]);

  return (
    <div
      role="toolbar"
      aria-label="Taskbar"
      className="flex items-center h-full px-2 gap-1"
      style={{ backgroundColor: '#0d1117', borderTop: '1px solid #21262d' }}
    >
      {/* ── App launchers ────────────────────────────────────────────────── */}
      <div
        ref={launcherRef}
        role="group"
        aria-label="Application launchers"
        className="flex items-center gap-1"
        onKeyDown={handleLauncherKeys}
      >
        {LAUNCHERS.map(spec => (
          <button
            key={spec.id}
            type="button"
            aria-label={`Launch ${spec.label}`}
            title={spec.label}
            className={[
              'flex items-center justify-center',
              'w-8 h-8 rounded text-sm font-mono font-bold',
              'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]',
              'transition-colors duration-100',
            ].join(' ')}
            onClick={() => kernel.openWindow(spec.id, spec.defaultTitle)}
          >
            {spec.icon}
          </button>
        ))}
      </div>

      {/* ── Separator ────────────────────────────────────────────────────── */}
      <div
        role="separator"
        aria-orientation="vertical"
        className="w-px h-5 bg-[#30363d] mx-1 shrink-0"
      />

      {/* ── Running windows ──────────────────────────────────────────────── */}
      <div
        ref={windowsRef}
        role="group"
        aria-label="Open windows"
        className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto"
        onKeyDown={handleWindowsKeys}
      >
        {state.windows.map(win => {
          const isFocused   = win.id === state.focusedWindowId;
          const isMinimized = win.displayState === 'minimized';
          const stateLabel  = isFocused ? 'focused' : isMinimized ? 'minimized' : 'open';

          return (
            <button
              key={win.id}
              type="button"
              aria-label={`${win.title} — ${stateLabel}`}
              aria-pressed={isFocused}
              title={win.title}
              className={[
                'flex items-center gap-1.5 px-2 h-7 rounded text-[12px] shrink-0 max-w-[140px]',
                'transition-colors duration-100',
                isFocused
                  ? 'bg-[#253047] text-[#e6edf3]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]',
                isMinimized ? 'opacity-60' : '',
              ].join(' ')}
              onClick={() => handleWindowButton(win)}
            >
              {/* Active indicator dot */}
              <span
                aria-hidden="true"
                className={[
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  isFocused   ? 'bg-[#79b8ff]' :
                  isMinimized ? 'bg-[#484f58]' : 'bg-[#30363d]',
                ].join(' ')}
              />
              <span className="truncate">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* ── Separator ────────────────────────────────────────────────────── */}
      <div
        role="separator"
        aria-orientation="vertical"
        className="w-px h-5 bg-[#30363d] mx-1 shrink-0"
      />

      {/* ── System tray (clock) ──────────────────────────────────────────── */}
      <Clock />
    </div>
  );
}
