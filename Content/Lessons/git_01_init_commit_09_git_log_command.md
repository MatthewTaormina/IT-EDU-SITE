---
type: lesson
title: "Inspecting History with `git log`"
description: "Navigate your commit history using `git log` and its powerful formatting flags to understand what changed, when, and why."
duration_minutes: 15
difficulty: Beginner
tags: [git, git-log, history, commits, log]
---

> Your commit history is only useful if you can read it. `git log` is the command that surfaces the story of a repository.

## Why This Matters

Every commit is a record, but raw commit data is dense. `git log` and its formatting options let you extract exactly the view you need — a quick one-line summary, a full detailed breakdown, a visual graph of branches, or a filtered list of commits by author or date.

## Basic Usage

```bash
git log
```

Shows commits in reverse chronological order (newest first), with full details:

```
commit e7f3a9b2d1c4f5e6a8b0c1d2e3f4a5b6c7d8e9f0
Author: Matth User <matt@example.com>
Date:   Mon Jun 9 14:32:01 2025 -0400

    Add user authentication module

commit 3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9
Author: Matth User <matt@example.com>
Date:   Sat Jun 7 10:00:15 2025 -0400

    Initial commit: add README
```

Press `q` to exit the pager (same as `man` pages).

## Essential Formatting Flags

### One Line Per Commit

```bash
git log --oneline
```

```
e7f3a9b Add user authentication module
3a1b2c3 Initial commit: add README
```

This is the most practical format for quick history overviews. The short hash on the left can be used wherever a full hash is expected.

### Show File Changes Per Commit

```bash
git log --stat
```

```
commit e7f3a9b ...
    Add user authentication module

 auth.js   | 45 +++++++++++++++++++++++++++++++++++++++
 routes.js |  8 +++++---
 2 files changed, 50 insertions(+), 3 deletions(-)
```

Useful for spotting which commits touch which files.

### Full Diff Per Commit (Patch View)

```bash
git log -p
```

Shows the full line-by-line diff for every commit. Combine with filename to narrow the output:

```bash
git log -p auth.js
```

### Visual Branch Graph

```bash
git log --oneline --graph --all
```

```
* a1b2c3d (HEAD -> feature-login) Add login form
* e7f3a9b Add user authentication module
| * f0e1d2c (main) Fix README typo
|/
* 3a1b2c3 Initial commit: add README
```

`--graph` draws ASCII branch lines. `--all` shows commits on all branches. This is essential for understanding how branches diverged and merged.

The sandbox below starts with three commits already in history. Try `git log`, `git log --oneline`, and make a new commit of your own:

<TerminalSandbox
  stateUrl="/sandbox/git_01_init_commit_07_and_09.json"
  height="26rem"
/>

## Filtering the Log

### By Number of Commits

```bash
git log -5             # last 5 commits
git log -1             # just the most recent commit
```

### By Author

```bash
git log --author="Matt"
```

Case-insensitive partial match. Useful in team repositories.

### By Date Range

```bash
git log --after="2025-06-01"
git log --before="2025-01-01"
git log --after="2025-06-01" --before="2025-06-30"
```

### By Commit Message

```bash
git log --grep="authentication"
```

Searches commit messages for the keyword.

### By File

```bash
git log -- auth.js
```

Shows only commits that touched `auth.js`. The double-dash `--` separates flags from filenames — when the file has the same name as a branch, this avoids ambiguity.

## Custom Format Strings

Build your own log format:

```bash
git log --pretty=format:"%h | %an | %ar | %s"
```

```
e7f3a9b | Matt User | 2 hours ago | Add user authentication module
3a1b2c3 | Matt User | 2 days ago | Initial commit: add README
```

**Common format placeholders:**

| Placeholder | Meaning |
| :---------- | :------ |
| `%h` | Short commit hash |
| `%H` | Full commit hash |
| `%an` | Author name |
| `%ae` | Author email |
| `%ar` | Author date, relative (e.g., "2 hours ago") |
| `%ad` | Author date, absolute |
| `%s` | Commit subject (first line of message) |
| `%b` | Commit body (everything after the first line) |

<Callout type="tip">
Set a useful alias for your most-used log format:
```bash
git config --global alias.lg "log --oneline --graph --all"
```
Then `git lg` gives you a graph view in two keystrokes.
</Callout>

## Viewing a Single Commit

To inspect one commit in detail — its full diff, author, date, and message:

```bash
git show e7f3a9b
```

`git show` accepts any commit reference: a hash, `HEAD`, `HEAD~2`, or a branch name.

## Exercises

```bash
# View your last 3 commits in one-line format
git log --oneline -3

# See what files changed in the last commit
git log --stat -1

# View history for a specific file
git log --oneline -- README.md

# Launch the graph view across all branches
git log --oneline --graph --all
```

## Summary

`git log` lists commits newest-first. Use `--oneline` for brevity, `--stat` to see file impact, `-p` for full diffs, and `--graph --all` for a visual branch view. Filter by author, date, message keyword, or file to find specific commits. Use `git show <hash>` to inspect any single commit in detail.

## Related

- [Undoing Changes](/lessons/git_01_init_commit_10_undoing_changes)
- [Creating Your First Commit](/lessons/git_01_init_commit_06_first_commit)
- [Understanding Branches as Pointers](/lessons/git_02_branching_01_branch_pointer_model)
