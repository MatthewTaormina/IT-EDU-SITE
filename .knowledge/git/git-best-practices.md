---
node_id: "git_best_practices"
domain: "git"
type: "research"
title: "Git Best Practices"
description: "Comprehensive guide to atomic commits, conventional commits, branching strategy, staging, history rewriting, tagging, hygiene, PR workflow, and common mistakes in professional Git usage."
tags:
  [
    "git",
    "version-control",
    "atomic-commits",
    "conventional-commits",
    "branching",
    "git-flow",
    "trunk-based-development",
    "rebase",
    "pull-request",
    "code-review",
    "semantic-versioning",
    "git-hygiene",
  ]
related_topics:
  - "[[software-engineering-principles]]"
  - "[[core-competencies-fullstack]]"
  - "[[infrastructure]]"
prerequisites: ["version_control_basics"]
keywords:
  [
    "atomic commit",
    "conventional commits",
    "git add -p",
    "git rebase -i",
    "git flow",
    "trunk based development",
    "squash",
    "fixup",
    "amend",
    "gitignore",
    "pre-commit hook",
    "semantic versioning",
    "pull request",
    "imperative mood",
    "50/72 rule",
  ]
terminal_objective:
  prerequisite: "Basic git commands (init, add, commit, push, pull, branch, merge) — learner can create a repository, stage files, commit changes, and push to a remote"
  concept: "Professional Git usage is a system of conventions — atomic commits, structured messages, principled branching, clean history, and collaborative review — that makes a codebase's change history a first-class engineering artifact: readable, debuggable, and deployable at any point."
  practical_application: "Author an atomic commit with a Conventional Commits message; rebase an in-progress feature branch interactively to squash and reword commits before opening a PR; configure a pre-commit hook that runs lint and type-check; create an annotated tag following semantic versioning; write a PR description that links a closing issue and summarises the what and why."
  market_value: "High — professional Git hygiene is universally expected at all experience levels; poor commit history is among the top three code review complaints at senior level; Conventional Commits is the standard in OSS and most enterprise CI/CD pipelines; recruiters and hiring managers read commit histories during portfolio review."
created: "2026-04-14"
last_updated: "2026-04-14"
---

## Summary for AI Agents

Professional Git practice is a set of conventions governing *how* changes are recorded, not just *that* they are recorded. Key clusters: atomic commits (one logical change per commit), Conventional Commits (structured message format consumed by tooling), imperative-mood message rules (50/72 character limits), branching strategies (Git Flow vs GitHub Flow vs trunk-based development), partial staging (`git add -p`), interactive rebase for history cleanup, annotated tags for releases, `.gitignore` hygiene, `pre-commit` hooks, and pull request workflow. The golden rule of history rewriting: **never rebase or force-push commits that have been published to a shared branch.** This document is authoritative for all git-domain content on this platform.

---

# Git Best Practices

## Overview

Version control history is a primary engineering communication medium. A repository's log is read by:

- Other engineers during code review and debugging (`git log`, `git blame`)
- Automated tooling that generates changelogs, trigger releases, and deploys (Conventional Commits parsers, semantic-release)
- Hiring managers reviewing portfolio projects
- The author themselves, six months later

Treating commits as ephemeral save-points produces repositories that are impossible to bisect, changelog, or understand. Treating them as deliberate, structured messages produces repositories that can be navigated, partially reverted, and communicated about with precision.

These practices apply across solo projects, team environments, and open-source contributions. Most CI/CD pipelines at scale enforce a subset of them via linting (commitlint) and verification gates.

---

## 1. Atomic Commits

### Definition

An **atomic commit** records exactly one logical change — the smallest unit of meaningful, independently deployable work. It does not bundle unrelated modifications, even if they were made at the same time.

> **Key test:** Can this commit be reverted without breaking unrelated functionality? If yes, it is probably atomic. If no, it contains more than one change.

### The "One Logical Change" Principle

A "logical change" is defined at the *intent* level, not the file-count level:

- **One bug fix** that touches 12 files → atomic (one intent, many files)
- **One refactor + one new feature** in a single file → not atomic (two intents, one file)

### Rationale

| Benefit | Why It Matters |
| :--- | :--- |
| **Revertability** | `git revert <sha>` surgically undoes one thing without side effects |
| **Bisectability** | `git bisect` can isolate the exact commit introducing a regression |
| **Reviewability** | Reviewers evaluate one decision at a time; cognitive load is bounded |
| **Changelog clarity** | Automated changelogs are meaningful when commits map 1:1 to changes |
| **Deployment safety** | Any individual commit can theoretically be cherry-picked to a hotfix branch |

### How to Split Changes

When a working-directory session mixes multiple logical changes, split them into separate commits:

1. **Identify intent boundaries** — ask "if I had to describe this in one sentence, can I?" If the answer requires "and", split the commit.
2. **Stage selectively** — use `git add -p` (see §5) to stage only the hunks belonging to the first logical change.
3. **Commit, then repeat** — commit the first staged change, stage the second, commit again.

### Anti-Pattern: WIP / Checkpoint Commits

```
# Bad — meaningless, non-atomic history
abc1234 WIP
def5678 more stuff
789abcd fix
012bcde done for today
```

```
# Good — atomic, meaningful history
abc1234 feat(auth): add password reset email trigger
def5678 fix(auth): correct token expiry calculation
789abcd test(auth): add integration tests for reset flow
```

### When to Use `git add -p`

Use `git add -p` whenever:
- You edited multiple unrelated parts of the file in a single session
- You want to stage a bugfix but not experimental code added in the same file
- You want to verify exactly what is being committed before committing it

See §5 (Staging Strategies) for full `git add -p` workflow.

---

## 2. Conventional Commits

### Specification Source

**Conventional Commits 1.0.0** — [conventionalcommits.org](https://www.conventionalcommits.org)

A lightweight convention for commit messages built on top of Semantic Versioning. It defines a machine-readable structure consumed by changelog generators, release tools (`semantic-release`, `release-please`), and commit linters (`commitlint`).

### Full Message Structure

```
<type>[optional scope][optional !]: <subject>

[optional body]

[optional footer(s)]
```

### Type Prefixes

| Type | Meaning | SemVer Impact |
| :--- | :--- | :--- |
| `feat` | New feature visible to users | MINOR bump |
| `fix` | Bug fix | PATCH bump |
| `refactor` | Code restructuring without behaviour change | none |
| `style` | Formatting, whitespace, semicolons — no logic change | none |
| `docs` | Documentation only | none |
| `test` | Adding or correcting tests | none |
| `chore` | Build system, package manager, config | none |
| `perf` | Performance improvement | PATCH bump |
| `ci` | CI/CD pipeline configuration | none |
| `build` | Changes to build tooling or external dependencies | none |
| `revert` | Reverting a previous commit | depends on reverted type |

### Scope Syntax

Scope narrows the area of change. It is enclosed in parentheses, lowercase, and typically matches a module, component, or layer name:

```
feat(auth): add OAuth2 Google provider
fix(api): handle null response from payment gateway
docs(readme): update local dev setup instructions
```

Scope is optional but strongly recommended in multi-module codebases. Establish a shared scope vocabulary in `CONTRIBUTING.md`.

### Breaking Changes

Two equivalent notations for breaking changes:

**Notation 1 — `!` flag on the type line:**
```
feat(api)!: change authentication endpoint from /login to /auth/token
```

**Notation 2 — `BREAKING CHANGE:` footer token:**
```
feat(api): change authentication endpoint

BREAKING CHANGE: /login has been renamed to /auth/token.
Clients must update their authentication URL. The old endpoint
will be removed in v3.0.0 after a 30-day deprecation period.
```

The `!` notation triggers a MAJOR SemVer bump. Use the footer for additional migration notes.

### Subject Line Rules

1. **Imperative mood** — "add feature", not "added feature" or "adds feature"
2. **≤50 characters** — hard limit for terminal readability; soft limit enforced by many GUI tools
3. **No trailing period**
4. **Lowercase** after the type/scope prefix
5. **No "fix bug"** — be specific: `fix(cart): prevent duplicate order submission on double-click`

```
# Correct
feat(dashboard): add weekly revenue chart
fix(login): redirect to intended page after authentication
refactor(db): extract connection pool to separate module

# Incorrect
Added dashboard chart.              ← past tense, trailing period
Fixed login bug                     ← vague
Lots of changes                     ← not atomic; not descriptive
WIP: auth stuff                     ← should not be committed like this
```

### Body (72-Character Wrap)

The body explains **what** changed and **why**, not how (the diff shows how). Separate from subject with a blank line. Wrap at 72 characters so `git log` is readable in an 80-column terminal without horizontal scrolling.

```
fix(checkout): prevent double charge on payment timeout

The payment provider sometimes returns a 504 but still processes
the charge. Previously, the client would retry immediately on any
5xx, creating duplicate transactions.

Added idempotency key (UUID v4) per request. The key is stored in
the session for the duration of the checkout flow and included in
the retry. The provider deduplicates using this key.

Idempotency key spec: https://stripe.com/docs/idempotency
```

### Footer Tokens

| Token | Syntax | Purpose |
| :--- | :--- | :--- |
| `Closes` | `Closes #123` | Automatically close GitHub/GitLab issue on merge |
| `Fixes` | `Fixes #456` | Same as Closes; conventional for bugs |
| `Refs` | `Refs #789` | Reference without closing |
| `BREAKING CHANGE` | `BREAKING CHANGE: <description>` | Document breaking changes for SemVer tooling |
| `Co-authored-by` | `Co-authored-by: Name <email>` | Credit pair programming partner |
| `Reviewed-by` | `Reviewed-by: Name <email>` | Credit reviewer |

```
fix(api): handle null response from payment gateway

The Stripe SDK v4 returns null for declined cards in sandbox mode
instead of throwing. This caused an unhandled null-ref exception
that surfaced as a 500 to users.

Closes #312
Fixes #318
```

---

## 3. Commit Message Quality

### Imperative Mood

Git's own generated messages use imperative mood: "Merge branch 'feature/x'", "Revert 'feat: add y'". This convention treats the subject line as a completion of the sentence:

> **"If applied, this commit will: _____"**

```
# Correct (imperative — complete the sentence naturally)
add user profile avatar upload
fix null pointer in payment handler
update Node.js to v22

# Incorrect
added user profile avatar upload   ← past tense
adds user profile avatar upload    ← third-person present
updating Node.js to v22            ← gerund
```

### The 50/72 Rule

- **Subject: ≤50 characters.** GitHub truncates at 72; `git log --oneline` becomes unreadable above 72. 50 is the target; 72 is the hard limit.
- **Body lines: ≤72 characters.** Ensures the log is readable in an 80-column terminal with `git log` indentation.

Tools that enforce this:
- `commitlint` with `@commitlint/config-conventional`
- `git config --global commit.verbose true` (shows diff while composing)
- Editor rulers at 50 and 72 characters in `.editorconfig`

### Multi-Paragraph Bodies

Use blank lines to separate paragraphs. Each paragraph addresses one sub-concern: what changed, why it changed, alternatives considered, known limitations, links to references.

```
refactor(auth): replace session cookies with JWT

Motivation: session store was a single point of failure and did not
support horizontal scaling. The load balancer required sticky
sessions, preventing even distribution.

JWTs are stateless — any node can verify them using the shared
secret. Token expiry is 15 minutes with a 7-day refresh token.
Refresh tokens are stored in an httpOnly cookie.

Security note: refresh token rotation is implemented; old refresh
tokens are invalidated on use. Replay attack window: ~1 second
(network round-trip time upper bound).

References:
- RFC 7519 (JWT): https://datatracker.ietf.org/doc/html/rfc7519
- OWASP Session Management: https://cheatsheetseries.owasp.org

Closes #204
```

### "Fix bug" Is Not a Commit Message

Common bad patterns and how to fix them:

| Bad | Better |
| :--- | :--- |
| `fix bug` | `fix(login): clear error state when user retypes password` |
| `update styles` | `style(nav): align dropdown with 8px grid` |
| `changes` | Not a valid commit message at all |
| `wip` | Squash before opening PR; use `git commit --fixup` during development |
| `add feature` | `feat(dashboard): add monthly revenue comparison chart` |
| `stuff` | Rewrite before pushing |

---

## 4. Branch Strategy

### Git Flow

Designed for **scheduled release cycles** (versioned software shipped at defined intervals).

**Branches:**
- `main` — production-ready code; only release branches and hotfixes merge here
- `develop` — integration branch; feature branches merge here
- `feature/*` — branches from `develop`; merge back to `develop`
- `release/*` — branches from `develop` when ready to release; merges to both `main` and `develop`
- `hotfix/*` — branches from `main` for production bugs; merges to both `main` and `develop`

**When to use Git Flow:**
- Desktop applications
- Mobile apps with App Store review cycles
- Versioned libraries or SDKs
- Teams with separate QA environments

**Criticisms:**
- High overhead for small teams and fast-moving web applications
- Long-lived `develop` branch creates merge debt
- Overkill for continuous deployment environments

### GitHub Flow

Designed for **continuous deployment** (merge to main → auto-deploy).

**Rules:**
1. `main` is always deployable
2. New work in descriptively-named branches off `main`
3. Open a pull request early for visibility
4. Merge to `main` only after review and CI passes
5. Deploy immediately after merge

**When to use GitHub Flow:**
- Web services deployed on every merge
- Small teams (2–8 engineers)
- SaaS products with no formal versioned releases

**Limitation:** No built-in mechanism for managing multiple active release versions.

### Trunk-Based Development (TBD)

Designed for **high-velocity teams with strong CI/CD and feature flags**.

**Rules:**
1. All developers commit directly to `main` (trunk), or use very short-lived feature branches (< 2 days)
2. Feature flags gate incomplete features in production
3. Comprehensive automated tests are a prerequisite, not optional
4. CI runs on every commit; broken build is the team's top priority

**When to use TBD:**
- High-trust, experienced teams
- Strong automated test coverage (unit + integration + e2e)
- Feature flag infrastructure in place
- Google, Facebook, and most large-scale SaaS companies use this model

**Risks if misapplied:**
- Incomplete features shipped to users without proper feature flagging
- Conflicts when CI is slow and multiple developers commit rapidly

### Comparison Table

| Strategy | Release Model | Branch Lifespan | Team Size | CI Requirement |
| :--- | :--- | :--- | :--- | :--- |
| Git Flow | Scheduled versioned releases | Weeks to months | Any | Moderate |
| GitHub Flow | Continuous deployment | Hours to days | 2–15 | Moderate |
| Trunk-Based Dev | Continuous deployment + feature flags | Hours | 5+ with experience | Stringent |

### Feature Branch Naming Conventions

```
feature/user-avatar-upload
feature/JIRA-4521-checkout-redesign
fix/double-charge-timeout
hotfix/v2.1.1-null-payment-response
chore/upgrade-node-22
docs/contributing-guide
```

**Rules:**
- Use `kebab-case`
- Include ticket/issue number when applicable
- Keep names descriptive but concise (< 50 characters)
- Use type prefix matching Conventional Commits type

---

## 5. Staging Strategies

### `git add -p` — Interactive Patch Staging

The most important tool for crafting atomic commits from a mixed working directory.

```bash
git add -p [file]
```

For each hunk (contiguous block of changes), Git presents an interactive prompt:

| Key | Action |
| :--- | :--- |
| `y` | Stage this hunk |
| `n` | Skip this hunk (leave unstaged) |
| `s` | Split the hunk into smaller hunks |
| `e` | Manually edit the hunk (for precise control) |
| `q` | Quit; stop staging |
| `?` | Help |
| `a` | Stage this hunk and all remaining hunks in the file |
| `d` | Skip this hunk and all remaining hunks in the file |

**Workflow for splitting mixed changes:**
```bash
# After a session that added both a new feature and fixed an unrelated bug:
git add -p

# Stage only the bug-fix hunks → y/n through prompts
git commit -m "fix(cart): prevent duplicate order on double-click"

# Stage the remaining feature hunks
git add -p
git commit -m "feat(cart): add coupon code input field"
```

**Editing a hunk (`e`):** Opens `$EDITOR` with the diff. Lines beginning with `+` can be removed to exclude specific added lines. Lines beginning with `-` can be changed to ` ` (space) to keep the original line. This enables sub-hunk precision.

### `git add -i` — Full Interactive Mode

```bash
git add -i
```

Provides a menu-driven interface for managing the index:

```
*** Commands ***
  1: status   2: update   3: revert   4: add untracked
  5: patch    6: diff     7: quit     8: help
```

Option `5` (patch) is equivalent to `git add -p`. Use `git add -i` when you also need to add untracked files selectively or revert staged changes back to unstaged.

### Staging Individual Files vs. Hunks

| Scenario | Command |
| :--- | :--- |
| Stage entire file | `git add <file>` |
| Stage all tracked changes | `git add -u` |
| Stage everything (new + tracked) | `git add .` or `git add -A` |
| Stage specific hunks interactively | `git add -p [file]` |
| Full interactive mode | `git add -i` |
| Unstage a file | `git restore --staged <file>` |
| Unstage all | `git restore --staged .` |

### Pre-Commit Review Habit

Always review what is staged before committing:

```bash
git diff --staged    # shows exactly what will be committed
git status           # shows staged vs unstaged vs untracked
```

---

## 6. Rewriting History

### The Golden Rule

> **Never rebase or amend commits that have already been pushed to a shared branch.**

"Shared branch" means any branch other than your own private feature branch. Rewriting public history forces collaborators to reconcile diverged histories, causes data loss when naively resolved, and breaks CI build artifacts linked to specific SHAs.

**Safe to rewrite:** local commits; commits on a personal feature branch that only you are using  
**Never rewrite:** `main`, `develop`, `release/*`, or any branch another person has checked out

### `git commit --amend`

Replaces the most recent commit with a new one (new SHA).

```bash
# Fix a typo in the last commit message
git commit --amend -m "feat(login): add 'remember me' checkbox"

# Add a missed file to the last commit (without changing the message)
git add forgotten-file.ts
git commit --amend --no-edit

# Change both the content and message
git add staged-changes.ts
git commit --amend -m "fix(api): handle empty array from user endpoint"
```

**Use case:** The commit hasn't been pushed yet, or has been pushed to your own feature branch but no one else has it.

### `git rebase -i` — Interactive Rebase

Interactive rebase replays a range of commits, allowing you to edit, reorder, squash, and drop commits before they are shared.

```bash
# Rebase the last 4 commits interactively
git rebase -i HEAD~4

# Rebase all commits since branching from main
git rebase -i main
```

The editor opens with a list of commits in chronological order (oldest first). Change the action keyword on each line:

| Action | Shorthand | Effect |
| :--- | :--- | :--- |
| `pick` | `p` | Keep commit as-is |
| `reword` | `r` | Keep commit, edit its message |
| `edit` | `e` | Stop and allow amending this commit |
| `squash` | `s` | Combine with previous commit; merge messages |
| `fixup` | `f` | Combine with previous commit; discard this message |
| `drop` | `d` | Delete this commit entirely |
| `exec` | `x` | Run a shell command after this commit |

**Squash workflow (cleaning up WIP commits before a PR):**

```
# Before rebase -i HEAD~4:
pick abc1234 feat(auth): add login form structure
pick def5678 wip: form validation
pick 789abcd fix form again
pick 012bcde add tests and fix style issues

# Edit to:
pick abc1234 feat(auth): add login form structure
squash def5678 wip: form validation
squash 789abcd fix form again
squash 012bcde add tests and fix style issues
```

Result: one clean commit with a single, well-written message.

**Fixup vs. Squash:**
- `fixup` silently absorbs the commit's changes, discarding its message. Ideal for "fix typo in previous commit" entries.
- `squash` prompts you to merge both messages, giving you a chance to write a combined message.

### `git commit --fixup` and `git rebase --autosquash`

During development, mark "fix" commits explicitly so rebase can auto-arrange them:

```bash
# Create a fixup commit targeting a specific SHA
git commit --fixup abc1234

# Later, auto-squash during rebase — no manual rearranging needed
git rebase -i --autosquash main
```

Git automatically places the fixup commit immediately after its target and sets the action to `fixup`. This is the recommended workflow for iterative development before merge.

### When Rebase Is Unsafe

```
# NEVER do this if the branch is shared:
git push --force origin main
git push --force origin develop

# Use --force-with-lease on personal feature branches — safer than --force
# because it aborts if someone else pushed to the branch since your last fetch
git push --force-with-lease origin feature/my-branch
```

---

## 7. Tagging

### Annotated vs. Lightweight Tags

| Type | Command | Metadata | Use Case |
| :--- | :--- | :--- | :--- |
| **Annotated** | `git tag -a v1.2.0 -m "Release 1.2.0"` | Tagger name, date, message, GPG-signable | Production releases; permanent history markers |
| **Lightweight** | `git tag v1.2.0-testing` | SHA reference only; no metadata | Personal bookmarks; temporary reference points |

**Always use annotated tags for releases.** Annotated tags are full objects in the Git object store and appear correctly in `git describe`, `git log`, and GitHub's Releases UI.

```bash
# Create an annotated tag
git tag -a v2.1.0 -m "Release 2.1.0: adds coupon code support"

# Push a tag to remote (tags are not pushed with git push by default)
git push origin v2.1.0

# Push all tags at once
git push origin --tags

# List all tags
git tag

# Inspect an annotated tag
git show v2.1.0
```

### Semantic Versioning (SemVer)

**Format:** `vMAJOR.MINOR.PATCH` — the `v` prefix is convention, not the SemVer spec itself.

| Version Component | Bump When | Example |
| :--- | :--- | :--- |
| **MAJOR** | Breaking change (backward-incompatible API change) | `v1.0.0` → `v2.0.0` |
| **MINOR** | New backward-compatible feature | `v1.0.0` → `v1.1.0` |
| **PATCH** | Backward-compatible bug fix | `v1.0.0` → `v1.0.1` |

**Pre-release labels:** `v2.0.0-alpha.1`, `v2.0.0-beta.3`, `v2.0.0-rc.1`  
**Build metadata:** `v2.0.0+20260414` (ignored in version precedence)

**With Conventional Commits**, SemVer bumps can be computed automatically:
- `feat:` commit → MINOR bump
- `fix:` or `perf:` commit → PATCH bump
- Any commit with `BREAKING CHANGE:` footer or `!` → MAJOR bump

Tools: `semantic-release`, `release-please` (Google), `standard-version`

### When to Tag

- Every production release, without exception
- Release candidates: `v2.0.0-rc.1`
- After significant milestones in educational projects: `v1.0.0-capstone`
- Do **not** tag every commit; tags mark points you may need to return to or distribute

---

## 8. Git Hygiene

### `.gitignore` Best Practices

The `.gitignore` file prevents tracking files that should never be in version control.

```gitignore
# Dependencies — never commit these
node_modules/
vendor/

# Build outputs — regenerable from source
dist/
build/
.next/
out/

# Environment and secrets — CRITICAL: never commit
.env
.env.local
.env.*.local

# OS artefacts
.DS_Store
Thumbs.db
desktop.ini

# Editor configs (team preference — some projects commit .editorconfig)
.vscode/*
!.vscode/extensions.json  # exception: keep shared extension recommendations
.idea/

# Logs
*.log
npm-debug.log*

# Test coverage output
coverage/
.nyc_output/
```

**Rules:**
1. Add a `.gitignore` at project initialization, before the first commit
2. Use [gitignore.io](https://www.toptal.com/developers/gitignore) to generate base rules for any tech stack
3. Add `.env.example` (with placeholder values) so collaborators know which variables exist
4. Keep `.gitignore` in version control — it is a project file, not a personal file
5. Personal/IDE ignores go in `~/.config/git/ignore` (global gitignore), not the project `.gitignore`

**Detecting tracked secrets:**
```bash
# Check if a file is being tracked despite .gitignore
git check-ignore -v .env

# If you accidentally committed a secret, remove it from history
# (requires force-push — coordinate with team)
git filter-repo --path .env --invert-paths
```

**Tools:** `gitleaks`, `truffleHog`, `git-secrets` — run in CI to block secret commits.

### `git stash`

Stash saves the current working tree state without committing, allowing you to switch context.

```bash
git stash                           # stash tracked changes
git stash push -m "WIP: refactor"   # stash with a description
git stash push -u -m "WIP: new files" # stash including untracked files (-u)

git stash list                      # list all stashes
git stash pop                       # apply latest stash and remove from list
git stash apply stash@{2}           # apply a specific stash (keep in list)
git stash drop stash@{0}            # delete a specific stash
git stash clear                     # delete all stashes (destructive)

git stash branch feature/resume     # create a branch from a stash
```

**When to stash:**
- Urgent switch to another branch (hotfix while mid-feature)
- Pulling upstream changes when working tree is dirty
- Testing a hypothesis on a clean working tree

**Prefer `git worktree`** for longer parallel contexts — worktrees allow checking out a second branch in a separate directory without stashing.

### Keeping the Working Tree Clean

- Commit or stash before switching branches
- Run `git status` frequently; treat an unclean working tree as a debt signal
- Never accumulate "I'll commit this later" changes spanning multiple features
- Use `git stash` or a WIP commit that is explicit (`chore: wip — do not merge`) for incomplete work shared across devices

### Pre-Commit Hooks

Pre-commit hooks run automatically before a commit is created. Use to enforce lint, format, and type checks.

**Using Husky (Node.js projects):**

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```sh
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": "prettier --write"
  }
}
```

**Using `pre-commit` (Python-based, polyglot):**

`.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: detect-private-key
  - repo: https://github.com/commitizen-tools/commitizen
    rev: v4.0.0
    hooks:
      - id: commitizen
```

**`commitlint` for message enforcement:**

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.mjs
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

---

## 9. Pull Request / Code Review Workflow

### Small, Focused Pull Requests

The single highest-leverage practice for code review quality.

**Rules:**
- Target ≤400 lines of code changed per PR (industry benchmark; GitHub internal data shows review quality drops sharply above this)
- One PR per feature or bug fix (atomic PRs mirror atomic commits)
- Separate refactoring PRs from feature PRs — mixed intent destroys review focus

**If a PR grows large:**
- Split into a stack: PR-1 (foundation), PR-2 (feature on top of PR-1), PR-3 (tests + docs)
- Use `git rebase` to stack branches: `git rebase pr1-branch` from `pr2-branch`
- In GitHub, set the base branch of PR-2 to PR-1's branch

### Draft PRs

Open as a draft when work is in progress but visibility is needed:

```
gh pr create --draft --title "feat(checkout): add Apple Pay support" \
  --body "WIP — payment provider integration unfinished. Opening early for design review."
```

**Benefits:**
- CI runs on every push but reviewers are not notified until ready
- Signals intent and enables async design feedback
- Prevents accidental merge

### Linking Issues

Every PR that resolves a tracked issue should link it in the PR description:

```markdown
## What
Adds coupon code support to the checkout flow.

## Why
Requested in #312. Enables the spring sale promotion campaign.

## Closes
Closes #312
Fixes #318
```

GitHub/GitLab automatically close the referenced issue on merge.

### PR Description Template

A good PR description answers three questions for the reviewer:

```markdown
## What changed?
<!-- 2–4 sentence summary of the code change -->

## Why?
<!-- Business or technical motivation. Link to issue, spec, or ticket. -->

## How to test
<!-- Step-by-step verification for the reviewer -->
1. Check out this branch
2. Run `npm run dev`
3. Navigate to /checkout
4. Enter coupon code SPRING25 → expect 20% discount

## Screenshots / recordings
<!-- For UI changes, always include before/after screenshots -->

## Checklist
- [ ] Tests added/updated
- [ ] Docs updated if public API changed
- [ ] No secrets or credentials in diff
- [ ] Accessible (keyboard, contrast, ARIA)
```

### Review Etiquette

**For authors:**
- Self-review first with `git diff main..HEAD` — review your own code before requesting others
- Respond to all comments before marking as resolved (preferred in most team norms)
- Don't take review feedback personally; invite it
- Provide context proactively in the PR description to reduce reviewer questions

**For reviewers:**
- Distinguish blocking vs. non-blocking comments: use `nit:` prefix for stylistic observations that shouldn't block merge
- Ask questions before assuming intent: "Is this intentional?" rather than "This is wrong"
- Review for correctness, security, readability, test coverage, and accessibility
- Complete review within agreed SLA (common default: 24 hours)

**Conventional comment prefixes (widely adopted):**

| Prefix | Meaning |
| :--- | :--- |
| `nit:` | Minor style preference; non-blocking |
| `blocker:` | Must be fixed before merge |
| `question:` | Seeking clarification; may or may not require change |
| `suggestion:` | Alternative approach; take or leave |
| `praise:` | Positive feedback; acknowledge good work |

---

## 10. Common Mistakes to Avoid

### Mistake 1: Committing Secrets and Credentials

**Risk:** Once pushed to a remote (especially a public repo), secrets are compromised even after removal — Git history is public, crawlers index new pushes within seconds, and GitHub's secret scanning catches but cannot guarantee removal from forks.

**Prevention:**
- `.env` in `.gitignore` from Day 1
- Use `detect-private-key` pre-commit hook
- Use `gitleaks` or `truffleHog` in CI
- Store secrets in environment variables via the hosting platform (Netlify, Vercel, GitHub Actions secrets)
- Provide `.env.example` with placeholder values

**If it happens:**
1. Rotate the secret immediately — treat it as compromised regardless of how quickly you remove it
2. Remove from history with `git filter-repo`
3. Force-push (coordinate with team)
4. Notify any affected services

### Mistake 2: Committing Large Binary Files

**Problem:** Git stores full copies of binary files on every change. A 10MB Photoshop file committed and modified 20 times adds 200MB to the repository permanently.

**Prevention:**
- Never commit: `.psd`, `.ai`, compiled binaries, database dumps, `*.mp4`, `*.mov`, large `*.png`/`*.jpg` files
- Use Git LFS (Large File Storage) for necessary binaries exceeding 1MB
- Store design assets in Figma, Google Drive, or S3 — link from the repo, don't embed

```gitignore
# Prevent accidental binary commits
*.psd
*.ai
*.sketch
*.fig
*.exe
*.dll
*.zip
*.tar.gz
```

### Mistake 3: Meaningless Merge Commits on Feature Branches

**Problem:** Repeatedly merging `main` into a feature branch creates a cluttered, non-linear history that is hard to read and bisect.

```
# Bad: tangled history from merge-based sync
* Merge branch 'main' into feature/checkout
* Merge branch 'main' into feature/checkout
* add checkout form
* Merge branch 'main' into feature/checkout
```

```
# Good: clean linear history from rebase-based sync
* feat(checkout): add coupon validation
* feat(checkout): add Apple Pay button
* feat(checkout): add checkout form structure
```

**Solution:** Use `git rebase` to sync feature branches with upstream:

```bash
git fetch origin
git rebase origin/main   # replay feature commits on top of updated main
```

### Mistake 4: Force-Pushing to Shared Branches

**Problem:** `git push --force` rewrites remote history. Anyone who has pulled the branch now has a diverged history that cannot be cleanly merged. In the worst case, commits are permanently lost.

**Rules:**
- Never force-push to `main`, `develop`, or any branch in a PR that others have reviewed
- On personal feature branches only, prefer `--force-with-lease` over `--force`
- `--force-with-lease` aborts if someone else has pushed to the branch since your last fetch

```bash
# Safe force-push on personal feature branch
git push --force-with-lease origin feature/my-work

# Never do this on shared branches
git push --force origin main  # ← destructive; may lose commits; can break CI
```

### Mistake 5: Giant "Everything" Commits

**Symptom:** `git log --oneline` shows five commits for a 3-month project.

**Consequence:** Impossible to bisect, revert, cherry-pick, or understand.

**Remedy:** Commit frequently in atomic units. Use `git add -p` to split session work into multiple commits. Use `git rebase -i` to clean up before pushing.

### Mistake 6: Ignoring `.gitignore` Until a Secret Leaks

Developers frequently add `.gitignore` rules after accidentally committing something. The prevention is doing it first, at project initialization, before any file is ever tracked.

### Mistake 7: Never Tagging Releases

A project without tags has no recoverable release history. "What was deployed last Tuesday?" cannot be answered. Tag every production release.

### Mistake 8: Long-Lived Feature Branches Without Sync

Branches diverging from `main` for weeks accumulate merge debt that becomes painful to resolve. Sync daily with `git rebase origin/main` or use trunk-based development to eliminate divergence entirely.

---

## Quick-Reference: Commands

```bash
# Atomic staging
git add -p                        # stage by hunk
git diff --staged                 # review what will be committed
git restore --staged <file>       # unstage a file

# Conventional commit
git commit -m "feat(scope): subject ≤50 chars"

# Amend last commit
git commit --amend --no-edit      # add missed file
git commit --amend -m "new msg"   # fix message

# Interactive rebase
git rebase -i HEAD~3              # edit last 3 commits
git rebase -i main                # edit all commits since branching from main
git rebase --abort                # bail out if something goes wrong
git rebase --continue             # after resolving conflicts

# Fixup workflow
git commit --fixup <sha>
git rebase -i --autosquash main

# Stash
git stash push -u -m "WIP: description"
git stash pop
git stash list

# Tags
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0
git push origin --tags

# Force push (personal branches only)
git push --force-with-lease origin feature/my-branch

# Sync feature branch with main
git fetch origin
git rebase origin/main
```

---

## Key Rules Distilled (Machine-Parseable)

1. **One logical change per commit** — split with `git add -p` if needed
2. **Never commit secrets** — `.env` in `.gitignore` before first commit; rotate if leaked
3. **Conventional Commits format** — `type(scope): subject ≤50 chars`; body at 72-char wrap
4. **Imperative mood** — "add feature", not "added feature"
5. **Never rebase shared branches** — golden rule; use `--force-with-lease` on personal branches only
6. **Annotated tags for releases** — always; SemVer format `vMAJOR.MINOR.PATCH`
7. **Pre-commit hooks** — lint + type-check + commitlint block bad commits at source
8. **Small PRs** — ≤400 lines; one intent per PR; link closing issues in description
9. **Sync feature branches by rebasing** — not by merging `main` into feature
10. **Commit early and often** — then clean up with `git rebase -i` before opening a PR
