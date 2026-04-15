/**
 * AppIcons — SVG icon components for Desktop and Taskbar app launchers.
 *
 * All icons use `stroke="currentColor"` so they inherit the parent's text
 * colour and work in both the icon tile (blue accent `text-[#79b8ff]`) and
 * the taskbar launcher button (muted grey → white hover).
 *
 * AODA: every SVG carries `aria-hidden="true"` — accessibility labelling is
 * handled by the enclosing button's `aria-label`.
 */

interface IconProps {
  className?: string;
}

export function TerminalIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Monitor bezel */}
      <rect x="2" y="3" width="20" height="14" rx="2" />
      {/* > prompt chevron */}
      <path d="m7 9 3 2-3 2" />
      {/* _ cursor */}
      <line x1="12" y1="13" x2="16" y2="13" />
      {/* Stand */}
      <line x1="12" y1="17" x2="12" y2="20" />
      <line x1="9" y1="20" x2="15" y2="20" />
    </svg>
  );
}

export function BrowserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      {/* Longitude arcs */}
      <path d="M12 3c-2.5 3.5-4 5.8-4 9s1.5 5.5 4 9" />
      <path d="M12 3c2.5 3.5 4 5.8 4 9s-1.5 5.5-4 9" />
      {/* Latitude lines */}
      <line x1="3.5" y1="9" x2="20.5" y2="9" />
      <line x1="3.5" y1="15" x2="20.5" y2="15" />
    </svg>
  );
}

export function EmailIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      {/* Envelope flap / V crease */}
      <path d="m2 5 10 8 10-8" />
    </svg>
  );
}

export function TextEditorIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Page with folded top-right corner */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* Content lines */}
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9" x2="11" y2="9" />
    </svg>
  );
}
