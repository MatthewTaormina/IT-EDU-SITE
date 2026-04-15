import type { Metadata } from 'next';
import LinuxMachine from '@/components/desktop/LinuxMachine';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Sandbox',
  description:
    'Interactive browser-based Linux sandbox. Practice shell commands, run git workflows, ' +
    'browse documentation, and write code — all without installing anything.',
};

// ─── Route segment config ────────────────────────────────────────────────────

// Statically pre-rendered at build time — the page shell is static HTML;
// all interactive state is client-side only.
export const dynamic = 'force-static';

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Full-page desktop sandbox.
 *
 * Layout notes:
 *   • The desktop layout (layout.tsx in this folder) renders Nav (h-14 = 3.5rem)
 *     with no Footer, so the desktop can fill the remaining viewport exactly.
 *   • dvh (dynamic viewport height) collapses mobile browser chrome correctly.
 */
export default function DesktopPage() {
  return (
    <LinuxMachine
      machineId="default"
      stateEndpoint="/desktop-states/default"
      height="calc(100dvh - 3.5rem)"
    />
  );
}
