---
type: lesson
title: "Undoing Changes in Git"
description: "Safely undo changes at every stage — working directory, staging area, and committed history — using `git restore`, `git reset`, and `git revert`."
duration_minutes: 16
difficulty: Beginner
tags: [git, undo, git-restore, git-reset, git-revert, workflow]
---

> Git's undo model is nuanced because Git tracks three areas. The right tool depends on where your change lives: the working directory, the staging area, or the commit history.

## Why This Matters

Mistakes are inevitable. What matters is knowing how to fix them cleanly. Git provides multiple undo mechanisms, each targeting a different area. Using the wrong one can cause data loss or rewrite shared history — so understanding which tool to reach for is essential.

## The Three Areas and Their Undo Tools

| Area | The Problem | The Fix |
| :--- | :---------- | :------ |
| Working directory | Edited a file, want to discard the edits | `git restore <file>` |
| Staging area | Staged a file you didn't mean to | `git restore --staged <file>` |
| Committed history (local) | Made a bad commit, haven't pushed | `git reset HEAD~1` |
| Committed history (shared) | Need to undo a pushed commit | `git revert <hash>` |

## 1. Discard Unstaged Working Directory Changes

You edited `login.js` but want to throw away those edits and go back to the last committed version:

```bash
git restore login.js
```

<Callout type="warning">
`git restore <file>` permanently discards your changes. There is no undo. If the changes aren't in the staging area or a commit, they are gone forever.
</Callout>

To discard all unstaged changes in the entire working directory:

```bash
git restore .
```

## 2. Unstage a File

You ran `git add` on a file but changed your mind before committing:

```bash
git restore --staged login.js
```

This moves the file from the staging area back to "unstaged modified" — your working directory edits are preserved, but the file is no longer staged.

To unstage everything at once:

```bash
git restore --staged .
```

## 3. Undo the Last Commit (Local History)

`git reset` moves the branch pointer backwards, effectively removing commits from history.

### Keep changes (soft reset)

```bash
git reset --soft HEAD~1
```

- Removes the last commit from history
- Keeps all changes **staged** — nothing is lost, just un-committed
- Useful when you committed too early and need to add more

### Keep changes unstaged (mixed reset — the default)

```bash
git reset HEAD~1
# same as: git reset --mixed HEAD~1
```

- Removes the last commit from history
- Keeps all changes **in the working directory, unstaged**
- The most common "undo commit" operation

### Discard changes entirely (hard reset)

```bash
git reset --hard HEAD~1
```

- Removes the last commit from history
- **Permanently discards all changes** that were in that commit
- Working directory and staging area are reset to match the commit you're resetting to

<Callout type="warning">
`git reset --hard` is destructive. Once you discard committed changes with `--hard`, they are gone. Double-check with `git log` before using it.

Never use `git reset` to undo commits that have been pushed to a shared remote. This rewrites history and breaks collaborator's repositories.
</Callout>

## 4. Undo a Pushed Commit Safely with `git revert`

When you need to undo a commit that's already been pushed and shared:

```bash
git revert abc1234
```

`git revert` does NOT delete any commit. Instead, it creates a **new commit** that applies the inverse of the specified commit's changes.

```bash
git log --oneline
```

```
f9e8d7c Revert "Add broken feature"
abc1234 Add broken feature        ← the original commit stays in history
3b2a1f0 Add README
```

Both commits remain in history. The bad change is undone, but the record of it happening is preserved. This is the safe way to undo work on shared branches.

<Callout type="tip">
**Rule of thumb for choosing between `reset` and `revert`:**

- Change is only on your local machine → `git reset` is fine
- Change has been pushed to a shared remote → use `git revert`
</Callout>

## 5. Recover a Deleted File

If you accidentally deleted a tracked file without staging the deletion:

```bash
rm important.js
git restore important.js   # restores the file from the last commit
```

If you staged the deletion (`git rm important.js`):

```bash
git restore --staged important.js   # unstage the deletion
git restore important.js            # restore file to working directory
```

## Quick Reference

```bash
# Discard working directory changes
git restore <file>

# Unstage a file
git restore --staged <file>

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged
git reset HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1

# Undo a pushed commit safely
git revert <commit-hash>
```

## Exercise

```bash
# Set up a test scenario
echo "good content" > file.txt
git add file.txt && git commit -m "Add file"

# Simulate an accidental edit
echo "bad content" > file.txt

# Discard the edit
git restore file.txt
cat file.txt  # should show "good content"

# Simulate staging something you don't want
echo "accident" > oops.txt
git add oops.txt
git status    # oops.txt is staged

# Unstage it
git restore --staged oops.txt
git status    # oops.txt is now untracked again
```

## Summary

Git undo falls into four categories: discard working directory edits (`git restore`), unstage files (`git restore --staged`), rewrite local history (`git reset`), and safely undo shared history with a new commit (`git revert`). Prefer `git revert` for any commit that's been pushed. `--hard` resets are permanent — always confirm what you're discarding.

## Related

- [Creating Your First Commit](/lessons/git_01_init_commit_06_first_commit)
- [Understanding Branches as Pointers](/lessons/git_02_branching_01_branch_pointer_model)
- [Aborting a Merge in Progress](/lessons/git_04_conflicts_07_aborting_merge)
