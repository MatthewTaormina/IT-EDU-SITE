---
type: lesson
title: "Switching Between Branches"
description: "Use `git switch` to move between branches safely, handle uncommitted changes before switching, and understand what changes in your working directory."
duration_minutes: 10
difficulty: Beginner
tags: [git, branches, git-switch, checkout, workflow]
---

> Switching branches is how you shift context. Git updates your working directory to match the branch you switch to — knowing what happens to your uncommitted work is critical.

## Why This Matters

You'll switch branches constantly: moving between features, checking out a colleague's branch, switching back to `main` to start a hotfix. You need to know what switching does to your working directory, what to do with uncommitted changes, and when Git will refuse to switch.

## The Switch Command

```bash
git switch feature-login
```

This moves HEAD to `feature-login` and updates the working directory to match that branch's latest commit.

```bash
git checkout feature-login   # older, equivalent syntax
```

Both work. `git switch` is preferred in modern Git for clarity.

## Switching Back to the Previous Branch

```bash
git switch -
```

The `-` means "previous branch" — like `cd -` in a shell. Useful when you quickly jumped away and want to return.

## What Changes in Your Working Directory

When you switch, Git replaces your working directory's file contents to match the target branch:

```
You are on: main   →   switch to: feature-login
```

- Files that exist on `feature-login` but not on `main` **appear**
- Files that exist on `main` but not on `feature-login` **disappear**
- Files that differ between branches **change content**
- Files that are identical stay unchanged

Your working directory literally becomes the snapshot of the target branch's latest commit.

## Handling Uncommitted Changes

Git won't switch if your working directory changes would be **overwritten** by the switch:

```bash
git switch feature-login
```

```
error: Your local changes to the following files would be overwritten by checkout:
        login.js
Please commit your changes or stash them before you switch branches.
```

You have three options:

### Option 1: Commit Before Switching

If the work is ready:

```bash
git add login.js
git commit -m "WIP: login form"
git switch feature-login
```

### Option 2: Stash — Save and Come Back Later

`git stash` temporarily shelves your changes:

```bash
git stash              # save changes to a stack
git switch feature-login
# ... do work on feature-login ...
git switch main
git stash pop          # restore your saved changes
```

<Callout type="tip">
Use `git stash push -m "login form WIP"` to add a descriptive message to the stash. When you have multiple stashes, `git stash list` shows them:
```
stash@{0}: On main: login form WIP
stash@{1}: On feature-login: nav spacing experiment
```
</Callout>

### Option 3: Discard the Changes

If the changes are throwaway:

```bash
git restore .          # discard all unstaged changes
git switch feature-login
```

<Callout type="warning">
`git restore .` permanently discards all unstaged changes in the working directory. This cannot be undone.
</Callout>

## When Git Switches Without Complaining

Git allows an uncommitted change to carry over to the new branch if it is **not in conflict** — meaning the file being modified doesn't differ between the two branches. The change silently comes with you.

This behavior is a feature for in-progress work, but it can be surprising. If a file is the same on both branches, your edits survive the switch. If it differs, Git blocks the switch.

## Verify Your Location After Switching

```bash
git status
```

The first line always shows which branch you're on:

```
On branch feature-login
```

Or with no uncommitted changes:

```
On branch feature-login
nothing to commit, working tree clean
```

## Exercise

```bash
# Start on main with a clean working directory
git switch main

# Create and switch to a new branch
git switch -c test-switching

# Make a change — but don't commit
echo "work in progress" > wip.txt

# Try to switch back to main
git switch main
# → Git will either carry the change over (if wip.txt doesn't exist on main)
#   or block the switch if there's a conflict

# Stash the change and switch cleanly
git stash
git switch main
git switch -     # back to test-switching
git stash pop
```

<ProgressCheck>
Before continuing to divergent histories and merging, make sure you can work through these scenarios:

1. You are on `main` with a clean working directory. What is the complete sequence of commands to create a new branch called `feature/settings-page` and immediately switch to it?
2. You are on `main` halfway through editing `auth.js` when you realize this change belongs on a feature branch. You don't want to commit yet. What is the safest way to move your in-progress work to a new branch?
3. After switching branches, what command confirms which branch you are currently on?
4. True or False: If `auth.js` has the same content on both `main` and `feature-login`, Git will allow you to switch branches even if you have unstaged edits to `auth.js`.
</ProgressCheck>

## Summary

`git switch <branch>` moves HEAD and updates your working directory. Use `git switch -` to return to the previous branch. Git blocks switches that would overwrite uncommitted changes — handle them by committing, stashing, or discarding. After switching, confirm your location with `git status`.

## Related

- [Creating Branches](/lessons/git_02_branching_02_creating_branches)
- [Divergent Histories and Branch Divergence](/lessons/git_02_branching_05_divergent_histories)
- [Undoing Changes](/lessons/git_01_init_commit_08_undoing_changes)
