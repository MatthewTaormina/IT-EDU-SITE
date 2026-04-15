'use client';

/**
 * LinuxMachine — public entry point
 *
 * Usage in a Next.js page (App Router):
 *
 *   import LinuxMachine from '@/components/desktop/LinuxMachine';
 *
 *   <LinuxMachine
 *     machineId="project-01"
 *     stateEndpoint="/desktop-states/webdev-capstone"
 *     height="700px"
 *   />
 *
 * The component wraps <LinuxMachineProvider> (the OS kernel context) and
 * renders the desktop shell: wallpaper + desktop icons, window manager, and
 * taskbar.  It is intentionally desktop-only — no mobile layout is provided.
 *
 * AODA notes:
 *   • role="application" signals to assistive technology that this region uses
 *     its own keyboard model (arrow keys for icons/taskbar, Tab for windows).
 *   • aria-label includes the hostname once the machine has booted.
 *   • Skip-link from the outer page (#main-content) still works — the desktop
 *     is embedded inside the page's <main> element.
 *   • Boot / error screens use role="status" / role="alert" respectively.
 */

import { LinuxMachineProvider, useMachine } from './MachineContext';

import { Desktop }       from './Desktop';
import { WindowManager } from './WindowManager';
import { Taskbar }       from './Taskbar';

// ─── Prop types ───────────────────────────────────────────────────────────────

export interface LinuxMachineProps {
  /**
   * Unique ID scoping this machine's sessionStorage slot.
   * Use distinct IDs when embedding multiple desktop instances on one page.
   * Defaults to "default".
   */
  machineId?: string;
  /**
   * Base URL of the state endpoint, e.g. '/desktop-states/project-01'.
   * See LinuxMachineProvider for the full sub-endpoint contract.
   * Omit for a generic blank-slate filesystem.
   */
  stateEndpoint?: string;
  /**
   * CSS height of the desktop container.
   * Defaults to '600px'.  For a fullscreen-in-page experience use '100dvh'
   * or a calc() that accounts for the site Nav.
   */
  height?: string;
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function LinuxMachine({
  machineId = 'default',
  stateEndpoint,
  height = '600px',
}: LinuxMachineProps) {
  return (
    <LinuxMachineProvider machineId={machineId} stateEndpoint={stateEndpoint}>
      <DesktopShell height={height} />
    </LinuxMachineProvider>
  );
}

// ─── Inner shell (needs context) ──────────────────────────────────────────────

function DesktopShell({ height }: { height: string }) {
  const { state, booting, bootError } = useMachine();

  // ── Boot screen ─────────────────────────────────────────────────────────────
  if (booting) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Desktop is starting"
        className="flex flex-col items-center justify-center gap-3 bg-[#0d1117] text-[#8b949e]"
        style={{ height }}
      >
        {/* Spinner — purely decorative, state is announced by aria-label above */}
        <span aria-hidden="true" className="text-2xl animate-pulse">⊙</span>
        <span className="text-sm">Starting FictOS…</span>
      </div>
    );
  }

  // ── Error screen ────────────────────────────────────────────────────────────
  if (bootError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-2 bg-[#0d1117]"
        style={{ height }}
      >
        <span className="text-[#f85149] text-sm font-medium">Boot failed</span>
        <span className="text-[#8b949e] text-xs max-w-sm text-center">{bootError}</span>
      </div>
    );
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  const TASKBAR_H = 44; // px — matches h-11 Tailwind utility

  return (
    /*
     * role="application" — signals custom keyboard model to AT.
     * class="linux-desktop" — scopes the :focus-visible override in globals.css
     *   (2px white outline for all interactive elements on dark backgrounds).
     */
    <div
      role="application"
      aria-label={`${state.hostname} — FictOS desktop`}
      className="linux-desktop relative overflow-hidden"
      style={{ height, userSelect: 'none', fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Desktop area (above taskbar) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          bottom: TASKBAR_H,
          overflow: 'hidden',
        }}
      >
        {/* Wallpaper + icons (z-index 0) */}
        <Desktop />
        {/* Floating windows (z-index per win.zIndex) */}
        <WindowManager />
      </div>

      {/* Taskbar (pinned to bottom) */}
      <div
        style={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          height: TASKBAR_H,
        }}
      >
        <Taskbar />
      </div>
    </div>
  );
}
