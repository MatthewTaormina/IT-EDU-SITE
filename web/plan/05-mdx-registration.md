# Part 5 — MDX Registration & Barrel Export

## What it is
Wiring the finished component into the MDX system so lesson authors can use it.

## Files to touch

### 1. `web/components/mdx/TerminalSandbox/index.ts`
Barrel file — re-exports the component for clean imports.

```ts
export { default } from './TerminalSandbox';
export type { TerminalSandboxProps } from './TerminalSandbox';
```

### 2. `web/components/mdx/index.tsx`
Add `TerminalSandbox` to the `mdxComponents` registry.

```ts
import Callout from './Callout';
import TerminalSandbox from './TerminalSandbox';

export const mdxComponents = {
  Callout,
  TerminalSandbox,
} as const;
```

### 3. Delete the partial VFS file created in the previous session
`web/components/mdx/GitSandbox/vfs.ts` was created before the redesign. Remove it.

## Usage in lesson MDX after this part ships

```mdx
<!-- Bare terminal with git, empty FS -->
<TerminalSandbox label="Exercise 1: First commit" />

<!-- Pre-populated files, auto-run setup commands -->
<TerminalSandbox
  label="Exercise 2: Staging"
  preload={{
    '/home/user/index.html': '<h1>Hello</h1>\n',
    '/home/user/style.css': 'body { margin: 0; }\n',
  }}
  initialCommands={['cd /home/user', 'git init', 'git config user.name "Alex"', 'git config user.email "alex@example.com"']}
/>

<!-- Terminal without git (pure Linux practice) -->
<TerminalSandbox label="File navigation practice" git={false} />
```

## Notes
- `TerminalSandbox` is the canonical MDX tag — no separate `GitSandbox` tag.
- The `git` prop (default `true`) controls whether the git plugin is mounted.
- After this part, update the MDX Component Whitelist in `.github/copilot-instructions.md`  
  marking `<TerminalEmulator />` as ✅ Built (replacing the old planned entry).
- Ship last, after Part 4.
