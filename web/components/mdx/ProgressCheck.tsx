import type { ReactNode } from 'react';

interface ProgressCheckProps {
  children: ReactNode;
}

/**
 * ProgressCheck — end-of-section self-assessment block.
 *
 * Wrap a markdown list, paragraph, or scenario that the learner should be able
 * to answer / complete before moving to the next lesson. No interaction — just
 * a visually distinct "stop and reflect" prompt.
 *
 * MDX usage:
 *   <ProgressCheck>
 *   Before moving on, make sure you can answer these:
 *   1. What is X?
 *   2. How does Y work?
 *   </ProgressCheck>
 */
export default function ProgressCheck({ children }: ProgressCheckProps) {
  return (
    <div
      role="region"
      aria-label="Progress check"
      className="not-prose my-8 overflow-hidden rounded-xl border border-primary/25 dark:border-primary/35"
    >
      {/* Label bar */}
      <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/8 px-5 py-3 dark:border-primary/25 dark:bg-primary/12">
        <svg
          aria-hidden="true"
          focusable="false"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-primary"
        >
          <rect width="16" height="16" rx="8" fill="currentColor" fillOpacity="0.18" />
          <path
            d="M4.5 8.5L6.5 10.5L11.5 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Progress check
        </span>
      </div>

      {/* Content — prose-sm re-applied so markdown renders correctly inside not-prose wrapper */}
      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none px-5 py-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

