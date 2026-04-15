'use client';

import { useState, useId } from 'react';
import type { ReactNode } from 'react';

// ── Inline renderer ──────────────────────────────────────────────────────────
// Converts `backtick-wrapped` segments into <code> elements.
// Called for question text, option text, and explanation text — all surfaces
// that arrive as plain strings from MDX string attributes.
function renderInline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.875em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part || null;
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface QuizBoxProps {
  /** Question text. Backtick-wrapped words render as inline code. */
  question: string;
  /**
   * Semicolon-separated answer options.
   * Using a plain string avoids JS-expression backtick-parsing issues in MDX.
   * Example: "Option A; Option B with `code`; Option C"
   */
  options: string;
  /**
   * Zero-based index of the correct option.
   * Use a plain string attribute (answer="1") — never a JSX expression ({1}).
   * Parsed with parseInt inside the component for reliability across MDX formats.
   */
  answer: string | number;
  /** Shown after answering. Backtick-wrapped words render as inline code. */
  explanation: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizBox({ question, options, answer, explanation }: QuizBoxProps) {
  const id = useId();
  const parsedOptions = options.split(';').map((o) => o.trim()).filter(Boolean);
  // Accept both string "1" and number 1 — parseInt handles both robustly.
  const correctIndex = parseInt(String(answer), 10);

  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const isCorrect = selected === correctIndex;

  function handleSelect(i: number) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
  }

  function handleRetry() {
    setSelected(null);
    setConfirmed(false);
  }

  return (
    <div
      role="region"
      aria-label="Knowledge check"
      className="not-prose my-6 rounded-xl border border-border bg-surface shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Knowledge check
        </span>
      </div>

      <div className="px-5 py-5">
        {/* Question */}
        <p id={`${id}-q`} className="mb-5 text-base font-medium leading-snug text-foreground">
          {renderInline(question)}
        </p>

        {/* Options */}
        <fieldset aria-labelledby={`${id}-q`} className="space-y-2">
          <legend className="sr-only">{question}</legend>
          {parsedOptions.map((opt, i) => {
            const optId = `${id}-opt-${i}`;
            let cls = 'flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-sm transition-colors ';
            if (!confirmed) {
              cls += selected === i
                ? 'cursor-pointer border-primary bg-primary/10 text-foreground font-medium'
                : 'cursor-pointer border-border bg-surface text-foreground hover:border-primary/60 hover:bg-primary/5';
            } else {
              cls += 'cursor-default ';
              if (i === correctIndex) {
                cls += 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 font-medium';
              } else if (i === selected) {
                cls += 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100';
              } else {
                cls += 'border-border bg-surface text-muted opacity-60';
              }
            }
            return (
              <label key={i} htmlFor={optId} className={cls}>
                <input
                  id={optId}
                  type="radio"
                  name={`${id}-radio`}
                  value={i}
                  checked={selected === i}
                  onChange={() => handleSelect(i)}
                  disabled={confirmed}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>{renderInline(opt)}</span>
              </label>
            );
          })}
        </fieldset>

        {/* Actions + feedback */}
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Check answer
          </button>
        ) : (
          <div className="mt-5 space-y-2" role="status" aria-live="polite">
            <p className={`text-sm font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </p>
            <p className="text-sm text-muted leading-relaxed">
              {renderInline(explanation)}
            </p>
            {!isCorrect && (
              <button
                onClick={handleRetry}
                className="mt-1 rounded-lg border border-border px-4 py-1.5 text-sm text-foreground transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Legacy multi-question shell — kept so old `questions={[...]}` calls gracefully
// fail at TypeScript (type mismatch) rather than silently at runtime.
// Remove once all content is migrated.
export type { QuizBoxProps };
