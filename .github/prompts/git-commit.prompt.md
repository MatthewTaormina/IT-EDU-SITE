---
description: "Atomic git commit workflow: analyse working tree → group by logical change → stage and commit each group following Conventional Commits and the 50/72 rule"
---

# Git Commit

Commit all pending changes in the working tree following git best practices.

> Knowledge reference: `.knowledge/git/git-best-practices.md`

---

## Step 1 — Audit the working tree

Run `git status --short` and `git diff --stat HEAD`.

List every changed or untracked file and record:
- **File path**
- **Change type**: modified | new | deleted | renamed
- **Layer**: `web/` (platform) | `Content/` (content) | `.knowledge/` (research) | `.github/` (tooling) | root (config)

---

## Step 2 — Group into atomic commits

An **atomic commit** = one logical change. One revert undoes exactly that change and nothing else.

Group the files from Step 1 into logical batches. Each batch must satisfy all of:

| Rule | Description |
|---|---|
| Single responsibility | All files in the batch serve the same logical purpose |
| Independent | Removing this commit doesn't break another commit in the set |
| Reviewable | A reviewer can understand the intent without reading other commits |
| Testable | The codebase is in a working state after this commit alone |

**Common grouping heuristics:**

- New feature + its supporting styles + its tests → one commit
- A bug fix touching multiple files that all relate to the same bug → one commit
- A refactor and an unrelated fix → **two separate commits**
- New knowledge node + catalog/map updates → one `chore(knowledge)` commit
- Content file + catalog.json update → one `content` commit
- Agent file changes → one `chore(agents)` commit
- Dependency/config-only changes → one `chore(deps)` or `build` commit

> If a single file contains multiple logical changes (e.g. a CSS file with dark-mode tokens AND an unrelated animation fix), use `git add -p` to stage only the relevant hunks.

---

## Step 3 — Draft commit messages

For each batch, write a commit message following **Conventional Commits** (conventionalcommits.org):

```
<type>(<scope>): <subject>

[optional body — what changed and WHY, wrapped at 72 chars]

[optional footer: Closes #N, BREAKING CHANGE: description]
```

### Type prefixes

| Type | Use when |
|---|---|
| `feat` | New feature or capability visible to users/agents |
| `fix` | Bug fix |
| `refactor` | Code change that neither adds a feature nor fixes a bug |
| `style` | Formatting, whitespace, no logic change |
| `docs` | Documentation only (READMEs, comments, knowledge base) |
| `chore` | Maintenance tasks: deps, config, tooling, agents, knowledge |
| `content` | New or updated content files (lessons, articles, courses) |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `ci` | CI/CD pipeline changes |
| `build` | Build system, next.config.ts, tailwind, netlify.toml |
| `revert` | Reverts a previous commit |

### Subject line rules (≤ 50 chars)

- **Imperative mood**: "add dark mode" not "added dark mode" or "adds dark mode"
- No trailing period
- Lowercase after the colon
- Specific: name the feature, not the method ("add ThemeToggle" not "update component")

### Body rules (wrap at 72 chars)

- Leave a blank line between subject and body
- Explain **what** changed and **why** — not how (the diff shows how)
- Use bullet points for multi-item bodies

### Footer rules

- `Closes #N` — auto-closes a GitHub issue
- `BREAKING CHANGE: <description>` — triggers a major version bump
- Add `!` after type/scope for breaking changes: `feat(api)!: remove v1 endpoints`

### Good vs bad examples

| ✗ Bad | ✓ Good |
|---|---|
| `fix stuff` | `fix(nav): prevent layout shift on mobile` |
| `updated CSS` | `style(globals): align token names with design system` |
| `WIP` | *(never commit WIP — use stash or a draft branch)* |
| `add dark mode and fix bug and update docs` | Split into 3 separate commits |

---

## Step 4 — Stage and commit each batch

For each batch (in dependency order — foundations first):

```bash
# Stage specific files
git add <file1> <file2> ...

# Or stage partial hunks from a file
git add -p <file>

# Commit with message
git commit -m "<type>(<scope>): <subject>" -m "<body paragraph>"
```

> **Never use `git add .` or `git add -A`** without first reviewing `git status` — you may accidentally commit auto-generated files, secrets, or unrelated changes.

After each commit, run `git log --oneline -3` to verify the message was recorded correctly.

---

## Step 5 — Verify the final state

After all commits:

1. Run `git status` — working tree must be clean (no untracked files except intentionally untracked ones)
2. Run `git log --oneline -10` — confirm commit history is readable and ordered logically
3. Run `git diff HEAD~<n> HEAD --stat` for each commit to verify scope is correct

---

## Commit order convention for this repo

When multiple commits are needed, apply them in this order:

1. `build` / `ci` — config and tooling changes (no runtime dependency)
2. `chore(knowledge)` — knowledge base updates
3. `chore(agents)` — agent definition files
4. `docs` — documentation/instructions updates
5. `feat` / `fix` / `refactor` — platform and content changes (dependency order: lib → components → pages)
6. `content` — content files (depend on platform being stable)

---

## Scope reference for this repo

| Scope | Maps to |
|---|---|
| `web` | Any file under `/web/` (generic) |
| `nav` | `web/components/ui/Nav.tsx` |
| `sidebar` | `web/components/ui/CourseSidebar.tsx` |
| `theme` | Dark mode, ThemeProvider, ThemeToggle, CSS tokens |
| `mdx` | MDX components or rehype/remark plugins |
| `layout` | `web/app/layout.tsx` |
| `api` | Route handlers under `web/app/` |
| `content` | Files under `/Content/` |
| `knowledge` | Files under `/.knowledge/` |
| `agents` | Files under `.github/agents/` |
| `workspace` | `.github/copilot-instructions.md`, root config files |
| `deps` | `package.json`, lock files only |
