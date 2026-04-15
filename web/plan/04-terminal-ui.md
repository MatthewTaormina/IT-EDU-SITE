# Part 4 — Terminal UI Component

## What it is
A React client component (`web/components/mdx/TerminalSandbox/TerminalSandbox.tsx`).  
The only part that uses `'use client'`. Everything else is pure TypeScript.

## Responsibility
Render the terminal: prompt, input, scrollable output history.  
Wire up keyboard events. Hold shell state in `useState`.

## Props

```ts
interface TerminalSandboxProps {
  /** Files to pre-populate in the VFS before first command. */
  preload?: Record<string, string>;

  /** Working directory the shell starts in. Defaults to '/home/user'. */
  initialCwd?: string;

  /** Commands to run automatically on mount (tutorial "setup" steps). */
  initialCommands?: string[];

  /** Whether to mount the git plugin. Defaults to true. */
  git?: boolean;

  /** Terminal height in Tailwind units, e.g. '96' → h-96. Defaults to '96'. */
  height?: string;

  /** Optional label shown in the title bar, e.g. 'Git Basics — Exercise 1'. */
  label?: string;
}
```

## Layout

```
┌─────────────────────────────────────────────────────┐
│ ● ● ●  Git Basics — Exercise 1          [Reset]      │  ← title bar
├─────────────────────────────────────────────────────┤
│ /home/user $ git init                               │
│ Initialized empty Git repository in /home/user/.git │
│ /home/user $ git status                             │
│ On branch main                                      │
│ ...                                                  │
│                                                      │  ← scrollable output
│                                                      │
├─────────────────────────────────────────────────────┤
│ /home/user $  _                                     │  ← input line
└─────────────────────────────────────────────────────┘
```

## Behaviour

- Output lines rendered in a `<pre>` / monospace block; `stderr` lines in red, `info` in muted.
- Input field captures Enter (run command), ↑/↓ (history navigation).
- Auto-scroll to bottom on new output.
- **Reset button** restores initial state (fresh VFS + initial commands replayed).
- Click anywhere in the output area to focus the input.
- `clear` command empties the displayed output lines (not history).
- Prompt format: `{cwd} $ ` where HOME is abbreviated to `~`.

## Accessibility

- `role="log"` on the output region with `aria-live="polite"`.
- `aria-label="Terminal input"` on the `<input>`.
- Title bar Reset button has visible focus ring and `aria-label="Reset terminal"`.
- The outer container has `role="region"` and `aria-label={label ?? 'Terminal sandbox'}`.
- Colour: stdout = foreground, stderr = red-400 (≥ 4.5:1 on terminal bg), muted = slate-400.

## Terminal colour tokens (inline, not from globals.css)

Terminal has its own dark background regardless of site theme:
```
background:   #0d1117   (GitHub-dark-ish)
foreground:   #e6edf3
prompt:       #58a6ff   (blue)
stderr:       #f85149   (red)
success/info: #3fb950   (green)
muted:        #8b949e
```
These are hardcoded in the component as Tailwind arbitrary values or inline style  
(terminal intentionally stays dark in both light and dark site themes).

## Notes
- `initialCommands` are replayed through `runCommand` on mount so output is visible.
- Ship after Part 3 (git plugin).
