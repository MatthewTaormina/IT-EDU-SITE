import type { ReactNode } from 'react';

interface ProgressCheckProps {
  children: ReactNode;
}

/**
 * ProgressCheck — unit completion self-assessment block.
 * Renders a checklist-style box prompting the learner to verify
 * they can do each item before moving on.
 */
export default function ProgressCheck({ children }: ProgressCheckProps) {
  return (
    <div
      role="region"
      aria-label="Progress check"
      className="my-6 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 dark:border-primary/40 dark:bg-primary/10"
    >
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="18" height="18" rx="9" fill="currentColor" fillOpacity="0.15" />
          <path
            d="M5 9.5L7.5 12L13 6.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Progress check
      </p>
      <div className="prose-sm [&_ul]:space-y-1 [&_ul]:pl-0 [&_ul>li]:flex [&_ul>li]:items-start [&_ul>li]:gap-2 [&_ul>li]:list-none">
        {children}
      </div>
    </div>
  );
}
