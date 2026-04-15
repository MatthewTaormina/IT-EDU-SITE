---
applyTo: "Content/Lessons/**,Content/Units/**"
---

# MDX Component Reference — Lesson & Unit Content

When authoring `.md` lesson files and `.mdx` unit files, you may use the following interactive components. Do not invent new component names. New components must be built by the `ui-component-engineer` agent and documented here before use.

---

## `<QuizBox>`

An inline knowledge-check widget with radio-button options. Built as a client component; interactive in the browser. Each `<QuizBox>` is **one question** — place multiple tags in sequence for a multi-question set.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `question` | `string` | ✓ | Question text. Backtick-wrapped words render as inline `<code>`. |
| `options` | `string` | ✓ | Semicolon-separated list of answer options. Backtick-wrapped words render as inline `<code>`. |
| `answer` | `string` | ✓ | Zero-based index of the correct option as a **plain string** (e.g., `answer="1"`). Never use a JSX expression `{1}` — it can arrive as the literal string `"{1}"` in some MDX pipeline configurations, which breaks the comparison. |
| `explanation` | `string` | ✓ | Shown after the learner submits. Backtick-wrapped words render as inline `<code>`. |

### Why semicolons for options?

MDX parses `{[...]}` JS array expressions using a simplified scanner. When option text contains backtick characters (e.g., `` `git commit` ``), the scanner can misidentify them as template literal delimiters and produce broken output. Passing options as a semicolon-delimited string attribute (`"..."`) is safe because MDX treats string attributes as raw character data — backticks, em dashes, and other special characters pass through unchanged.

### Inline code in string attributes

Wrap words in backticks inside any string attribute and they will render as styled `<code>` elements:
```
question="What does `git init` do?"
```
`**bold**` and other markdown syntax inside string attributes are **not** processed — plain text only, plus backtick-to-code.

### Single question

```mdx
<QuizBox
  question="What does `git status` show?"
  options="A list of commits; The current diff; Files that are modified, staged, or untracked; The remote branch name"
  answer={2}
  explanation="`git status` reports the state of your working directory and staging area — which files have changed, which are staged, and which are untracked."
/>
```

### Multiple questions (sequential)

```mdx
<QuizBox
  question="First question text"
  options="Option A; Option B; Option C"
  answer="1"
  explanation="Explanation for question 1."
/>

<QuizBox
  question="Second question text"
  options="Option A; Option B; Option C; Option D"
  answer={0}
  explanation="Explanation for question 2."
/>
```

### Rules

- `answer` must be `{0}`, `{1}`, `{2}`, etc. — never a bare number or a string `"1"`.
- Options are zero-indexed: `{0}` = first option, `{1}` = second, etc.
- Do not use semicolons (`;`) as punctuation **inside** option text — they are the delimiter.
- Do not use the old `questions={[...]}` array format — it is removed.
- Place `<QuizBox>` after the lesson body content, before `## Summary`.

---

## `<ProgressCheck>`

A styled "stop and reflect" block that prompts learners to self-assess before moving on. It is a **Server Component** — no interactivity. Children are rendered as prose content (markdown lists, paragraphs, and inline code all work).

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | ✓ | Any markdown content: paragraphs, numbered lists, bullet lists, inline code. |

### Usage patterns

**Pattern 1 — numbered checkpoint list**
```mdx
<ProgressCheck>
Before moving on, make sure you can answer these questions:

1. If you edit a file but don't run `git add`, which area is it in?
2. After `git add` but before `git commit`, where does the change live?
3. After `git commit`, where is the change permanently stored?
</ProgressCheck>
```

**Pattern 2 — scenario question**
```mdx
<ProgressCheck>
You edited three files: `login.js`, `dashboard.js`, and `styles.css`. You want two logical commits:
- Commit A: login form improvements (`login.js` + `styles.css`)
- Commit B: dashboard refactor (`dashboard.js`)

What sequence of `git add` and `git commit` commands would you run?
</ProgressCheck>
```

**Pattern 3 — hands-on exercise**
```mdx
<ProgressCheck>
Check your understanding: run `cat .git/refs/heads/main` in a repository. Then run `git log --oneline -1` and compare the hash. They should match.
</ProgressCheck>
```

### Rules

- Place `<ProgressCheck>` near the end of a lesson, after the main content and any `<QuizBox>` blocks, before `## Summary`.
- One `<ProgressCheck>` per lesson is standard; never zero in a lesson that teaches a concept requiring practice.
- Do not add a heading inside `<ProgressCheck>` — the component renders its own "Progress check" label bar.
- Content must be short: 1–5 items, or 1 scenario. Not a lecture.

---

## `<Callout type="...">`

A highlighted aside block. Renders with a coloured left border and background tint.

### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | `string` | – | `"tip"` | `"tip"` \| `"warning"` \| `"danger"` \| `"info"` \| `"research"` |
| `title` | `string` | – | — | Optional title shown above content. |
| `children` | `ReactNode` | ✓ | — | Body content. Markdown renders normally. |

### Usage

```mdx
<Callout type="tip">
Use `git add -p` to stage individual hunks within a file — keeps commits clean.
</Callout>

<Callout type="warning">
`git restore <file>` **discards** working directory changes permanently. There is no undo.
</Callout>

<Callout type="danger">
Never force-push to a shared branch — it rewrites history that teammates have already pulled.
</Callout>
```

### Type guide

| Type | Use when |
|---|---|
| `tip` | Practical advice, best practice, shortcut |
| `warning` | Non-destructive caution — "be careful, this could cause problems" |
| `danger` | Destructive or irreversible action — "this will break things or lose data" |
| `info` | Neutral supplemental context that doesn't fit the main flow |
| `research` | Research note, evidence, or citation relevant to the topic |

---

## `<TerminalSandbox>`

A fully interactive Linux + Git terminal emulator running entirely in the browser. Backed by a virtual filesystem (VFS), a shell interpreter, and an optional Git plugin. The sandbox is always dark-themed and is intentionally isolated from the site's light/dark theme. A **Reset** button in the title bar restores the terminal to the exact state defined by the component's props.

### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `preload` | `Record<string, string>` | – | `{}` | Files to create in the virtual filesystem before the shell starts. Keys are absolute paths; values are file contents. |
| `initialCwd` | `string` | – | `'/home/user'` | The working directory the shell opens in. Must be an absolute path that exists (either by default or via `preload`). |
| `initialCommands` | `string[]` | – | `[]` | Commands that run automatically (silently, in order) on first mount and on every Reset. Use this to set up a repo state before the learner starts. |
| `git` | `boolean` | – | `true` | Mount the Git plugin. Set to `false` for lessons that have nothing to do with Git — it slightly reduces startup work. |
| `height` | `string` | – | `'24rem'` | Height of the scrollable output area as a CSS value, e.g. `'24rem'` or `'400px'`. Increase it for commands that produce many output lines. |
| `label` | `string` | – | — | Short label shown in the terminal title bar (e.g. `'my-project'`). Omit for a generic bar. |

### How props interact

- `preload` files are created **before** `initialCommands` run, so you can write a file into the VFS and then `cat` it or `git add` it inside `initialCommands`.
- `initialCommands` run once on mount and again every time the learner clicks **Reset** — they are deterministic setup steps, not one-time operations.
- Setting `git={false}` disables all `git` sub-commands. Use it only when Git is not the subject of the lesson.

### Example 1 — Minimal (no setup)

Drop a bare interactive shell onto the page. The learner can type any supported command freely.

```mdx
<TerminalSandbox />
```

### Example 2 — Git workflow (pre-initialised repo)

Use `initialCommands` to set up a repository so the learner starts in a meaningful state — here, a project with one commit already made.

```mdx
<TerminalSandbox
  label="git-demo"
  initialCommands={[
    'git init',
    'git config user.email "learner@example.com"',
    'git config user.name "Learner"',
    'echo "# My Project" > README.md',
    'git add README.md',
    'git commit -m "Initial commit"',
  ]}
/>
```

The learner lands in `/home/user` with a repo that already has one commit. Clicking **Reset** replays these commands exactly.

### Example 3 — Pre-loaded file with a starter script

Use `preload` to seed a file that exists before the shell starts. Combine with `initialCommands` to stage it and focus the learner on writing commit messages.

```mdx
<TerminalSandbox
  label="first-commit"
  height="28rem"
  preload={{
    '/home/user/index.html': '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Hello</title></head>\n<body><h1>Hello, world!</h1></body>\n</html>\n',
  }}
  initialCommands={[
    'git init',
    'git config user.email "learner@example.com"',
    'git config user.name "Learner"',
  ]}
/>
```

The learner can run `ls`, `cat index.html`, `git add index.html`, and then `git commit -m "..."` without any file-creation steps.

### Rules

- Use `initialCommands` for **setup only** — do not use it to demonstrate steps the learner should practise themselves.
- Keep `initialCommands` arrays short (≤ 10 commands). Long setup sequences are a sign the lesson needs restructuring.
- `preload` paths must be absolute (`/home/user/filename`). Relative paths are not supported.
- Do not set `git={false}` in a lesson that is part of a Git unit — learners expect `git` to be available.
- Prefer `height="28rem"` or taller when commands like `git log` or `ls -la` may produce long output; the default `24rem` clips easily.
- Place `<TerminalSandbox>` inline with the prose section it relates to — immediately after the paragraph that explains what the learner should try.
- One sandbox per major exercise section is typical. Do not place two sandboxes back-to-back without explanatory prose between them.

---

## Component placement order

Within a lesson body, components appear in this order:

```
… prose content …

<Callout>           ← inline with relevant content section
<TerminalSandbox>   ← inline with the prose it relates to (exercise section)

… more prose …

<QuizBox>           ← after body, before Summary
<QuizBox>           ← (repeat for additional questions)

<ProgressCheck>     ← after QuizBox, before Summary

## Summary
…
## Related
…
```
