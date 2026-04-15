'use client';

import { useState, useId } from 'react';

interface Question {
  question: string;
  options: string[];
  /** Zero-based index of the correct option */
  answer: number;
  explanation: string;
}

interface QuizBoxProps {
  questions: Question[];
}

type AnswerState = number | null; // selected option index, or null if unanswered

export default function QuizBox({ questions }: QuizBoxProps) {
  const baseId = useId();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<AnswerState>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];
  const isCorrect = selected === q.answer;

  function handleSelect(index: number) {
    if (confirmed) return;
    setSelected(index);
  }

  function handleConfirm() {
    if (selected === null || confirmed) return;
    if (isCorrect) setScore((s) => s + 1);
    setConfirmed(true);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div
        className="not-prose my-6 rounded-xl border border-border bg-surface p-6 shadow-sm"
        role="region"
        aria-label="Quiz results"
      >
        <p className="text-lg font-semibold text-foreground mb-1">Quiz complete</p>
        <p className="text-muted text-sm mb-4">
          You scored{' '}
          <span className="font-bold text-foreground">
            {score}/{questions.length}
          </span>{' '}
          ({pct}%)
        </p>
        <button
          onClick={handleRestart}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Retry quiz
        </button>
      </div>
    );
  }

  return (
    <div
      className="not-prose my-6 rounded-xl border border-border bg-surface p-6 shadow-sm"
      role="region"
      aria-label={`Quiz question ${current + 1} of ${questions.length}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Knowledge check
        </span>
        <span className="text-xs text-muted">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Question */}
      <p
        id={`${baseId}-question`}
        className="text-base font-medium text-foreground mb-4 leading-snug"
      >
        {q.question}
      </p>

      {/* Options */}
      <fieldset aria-labelledby={`${baseId}-question`} className="space-y-2">
        <legend className="sr-only">{q.question}</legend>
        {q.options.map((option, i) => {
          const optionId = `${baseId}-option-${i}`;
          let optionStyle =
            'flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-sm text-left transition-colors cursor-pointer ';

          if (!confirmed) {
            optionStyle +=
              selected === i
                ? 'border-primary bg-primary/10 text-foreground font-medium'
                : 'border-border bg-surface text-foreground hover:border-primary/60 hover:bg-primary/5';
          } else {
            if (i === q.answer) {
              optionStyle += 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 font-medium';
            } else if (i === selected) {
              optionStyle += 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100';
            } else {
              optionStyle += 'border-border bg-surface text-muted opacity-60';
            }
          }

          return (
            <label key={i} htmlFor={optionId} className={optionStyle}>
              <input
                id={optionId}
                type="radio"
                name={`${baseId}-quiz`}
                value={i}
                checked={selected === i}
                onChange={() => handleSelect(i)}
                disabled={confirmed}
                className="mt-0.5 shrink-0 accent-primary"
                aria-describedby={confirmed ? `${baseId}-explanation` : undefined}
              />
              <span>{option}</span>
              {confirmed && i === q.answer && (
                <span className="ml-auto shrink-0 text-green-600 dark:text-green-400" aria-hidden="true">
                  ✓
                </span>
              )}
              {confirmed && i === selected && i !== q.answer && (
                <span className="ml-auto shrink-0 text-red-500" aria-hidden="true">
                  ✗
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      {/* Explanation (shown after confirm) */}
      {confirmed && (
        <div
          id={`${baseId}-explanation`}
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-lg border-l-4 p-3 text-sm ${
            isCorrect
              ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
              : 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
          }`}
        >
          <span className="font-semibold">{isCorrect ? 'Correct. ' : 'Not quite. '}</span>
          {q.explanation}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-5 flex gap-3">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Check answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {current + 1 < questions.length ? 'Next question →' : 'See results'}
          </button>
        )}
      </div>
    </div>
  );
}
