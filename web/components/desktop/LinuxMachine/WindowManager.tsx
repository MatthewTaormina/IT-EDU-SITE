'use client';

/**
 * WindowManager — renders the open window stack
 *
 * Each non-minimized window in state.windows is rendered as a <WindowFrame>
 * containing the appropriate app component.  Windows are sorted ascending by
 * zIndex so higher-zIndex windows render later (on top) in the DOM.
 *
 * The container is `position:absolute; inset:0; pointer-events:none` so that
 * clicks on blank desktop area fall through to <Desktop>.  Individual
 * WindowFrames set `pointer-events:auto` to re-enable interaction.
 *
 * APP SLOTS
 * ---------
 * Each AppId maps to a component via `renderAppContent()`.  Phases 3–7 replace
 * the placeholder <AppStub> with real app components as they land.  The
 * interface is intentionally thin: the app receives only `windowId` and lets
 * it call `useKernel()` / `useMachineState()` itself.
 */

import type { ReactNode } from 'react';
import { useMachineState } from './MachineContext';
import { WindowFrame } from './WindowFrame';
import type { AppId, WindowEntry, TerminalAppState, BrowserAppState, EmailAppState, TextEditorAppState } from './MachineTypes';
import { TerminalApp }    from '../apps/TerminalApp';
import { BrowserApp }    from '../apps/BrowserApp';
import { EmailApp }      from '../apps/EmailApp';
import { TextEditorApp } from '../apps/TextEditorApp';

// ─── App slot registry ────────────────────────────────────────────────────────

/**
 * To plug in a real app during a later phase, replace the relevant case with
 * the real import.  The only required prop is `windowId` (string).
 */
function renderAppContent(win: WindowEntry): ReactNode {
  switch (win.app) {
    case 'terminal':
      return (
        <TerminalApp
          windowId={win.id}
          appState={win.appState as TerminalAppState}
        />
      );
    case 'browser':
      return (
        <BrowserApp
          windowId={win.id}
          appState={win.appState as BrowserAppState}
        />
      );
    case 'email':
      return (
        <EmailApp
          windowId={win.id}
          appState={win.appState as EmailAppState}
        />
      );
    case 'text-editor':
      return (
        <TextEditorApp
          windowId={win.id}
          appState={win.appState as TextEditorAppState}
        />
      );
    default: {
      const _exhaustive: never = win.app;
      return <AppStub label={String(_exhaustive)} hint="Unknown app" />;
    }
  }
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function AppStub({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 bg-[#0d1117]">
      <span className="text-[#c9d1d9] text-sm font-medium">{label}</span>
      <span className="text-[#484f58] text-xs">{hint} — coming soon</span>
    </div>
  );
}

// ─── Window manager ───────────────────────────────────────────────────────────

export function WindowManager() {
  const state = useMachineState();

  const visible = state.windows
    .filter(w => w.displayState !== 'minimized')
    .sort((a, b) => a.zIndex - b.zIndex); // ascending → highest z renders last (on top)

  return (
    /*
     * pointer-events:none on the container so clicks on the desktop
     * background reach <Desktop>.  Each WindowFrame adds pointer-events:auto
     * via its inline styles.
     */
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-label="Open windows"
    >
      {visible.map(win => (
        <div key={win.id} style={{ pointerEvents: 'auto' }}>
          <WindowFrame
            win={win}
            isFocused={win.id === state.focusedWindowId}
          >
            {renderAppContent(win)}
          </WindowFrame>
        </div>
      ))}
    </div>
  );
}
