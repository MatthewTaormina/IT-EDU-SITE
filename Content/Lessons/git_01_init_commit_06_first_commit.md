---
type: lesson
title: "Creating Your First Commit"
description: "Write your first Git commit — understand what a commit is, how to write a meaningful message, and what Git stores when you commit."
duration_minutes: 12
difficulty: Beginner
tags: [git, git-commit, commit, history, workflow]
---

> A commit is a permanent snapshot of your staging area paired with a message explaining why the change was made. It is the fundamental unit of Git history.

## Why This Matters

Every save in Git is a commit. Not a file save — a deliberate, named checkpoint that captures the state of your project at a specific moment. Your commit history becomes a living document of every decision you made. A well-written commit creates a trustworthy audit trail; a lazy one creates a mystery.

## What a Commit Contains

When you run `git commit`, Git packages:

| Field | Description |
| :---- | :---------- |
| **Tree** | Pointer to the staging area snapshot (all staged files) |
| **Author** | Name + email + timestamp of the person who made the change |
| **Committer** | Name + email + timestamp of the person who recorded the commit |
| **Parent** | SHA-1 hash of the previous commit (none for the first commit) |
| **Message** | The text you wrote describing the change |

Git then computes a SHA-1 hash over all of this, producing a 40-character identifier like `e3b0c44298fc1c149afbf4c8996fb92427ae41e4` that uniquely identifies this commit forever.

## Your First Commit: Step by Step

### 1. Create a file

```bash
mkdir my-project && cd my-project
git init
echo "# My Project" > README.md
```

### 2. Stage it

```bash
git add README.md
```

### 3. Confirm what will be committed

```bash
git status
```

```
On branch main

No commits yet

Changes to be committed:
        new file:   README.md
```

### 4. Commit

```bash
git commit -m "Initial commit: add README"
```

```
[main (root-commit) 3f7a2c1] Initial commit: add README
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

Git confirms:
- Which branch you committed to (`main`)
- The short hash of the commit (`3f7a2c1`)
- Your message
- Files changed and lines added

## Writing Good Commit Messages

The message is the most human-readable part of a commit. Future-you (or a teammate) will read these messages to understand changes without re-reading code.

### Single-Line Messages

For straightforward changes, a single line is fine:

```bash
git commit -m "Fix typo in contact form label"
```

**Format:** imperative mood, no period, ≤ 72 characters.

Write as if completing the sentence: *"If applied, this commit will..."*

| ✓ Good | ✗ Bad |
| :----- | :---- |
| `Add user authentication` | `Added auth stuff` |
| `Fix broken link in footer` | `fix` |
| `Remove deprecated API calls` | `changes` |

### Multi-Line Messages

For complex changes, add an extended body:

```bash
git commit -m "Refactor login flow to use JWT tokens

Replace session-based auth with stateless JWT tokens to support
horizontal scaling. Existing sessions are invalidated on deploy —
users will need to log in again.

Related: issue #142"
```

The first line is the **subject** (shown in `git log --oneline`).
The body (after a blank line) provides context for the *why*.

<Callout type="tip">
Commit messages answer "what changed and why" — not "how." The diff already shows how. The message should tell someone why that change existed, what problem it solved, or what trade-off was made.
</Callout>

## Shortcut: Stage and Commit in One Step

If you only want to commit modified tracked files (not untracked new files), you can combine `git add` and `git commit`:

```bash
git commit -am "Update homepage copy"
```

The `-a` flag automatically stages all changes to **already-tracked** files.

<Callout type="warning">
`git commit -am` skips the staging area for new files. If `newfile.js` has never been committed before, `-a` will NOT include it. Only use `-a` when you're confident all relevant changes are in already-tracked files.
</Callout>

## Amending the Last Commit

Made a typo in your message, or forgot to stage one file? Amend the most recent commit:

```bash
# Stage the forgotten file
git add forgot_this.js

# Amend — replaces the previous commit
git commit --amend -m "Correct message here"
```

`--amend` rewrites the most recent commit. The old commit is discarded and replaced with a new one.

<Callout type="warning">
Never amend a commit that has already been pushed to a shared remote. Amending rewrites history and will force-push conflicts onto your teammates.
</Callout>

## Viewing the Result

```bash
git log --oneline
```

```
3f7a2c1 (HEAD -> main) Initial commit: add README
```

<ProgressCheck>
You've created your first commit. Verify by running `git log --oneline` — you should see at least one entry. Check that the commit message is in imperative mood and describes what changed.
</ProgressCheck>

## Summary

A commit is a permanently stored snapshot of your staging area with a message and metadata. Write messages in imperative mood, keep subjects under 72 characters, and use the body for context when needed. Use `git commit --amend` to fix the most recent commit before it's shared.

## Related

- [Inspecting History with `git log`](/lessons/git_01_init_commit_07_git_log_command)
- [Staging Changes with `git add`](/lessons/git_01_init_commit_04_git_add_command)
- [Undoing Changes](/lessons/git_01_init_commit_08_undoing_changes)
