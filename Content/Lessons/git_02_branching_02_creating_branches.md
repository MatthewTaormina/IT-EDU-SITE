---
type: lesson
title: "Creating Branches"
description: "Create branches using `git branch` and `git switch -c`, and understand the difference between creating and switching to a branch."
duration_minutes: 10
difficulty: Beginner
tags: [git, branches, git-branch, git-switch, workflow]
---

> Creating a branch in Git is a two-second operation. The discipline is in knowing *when* to branch — the answer is almost always "now, before you start."

## Why This Matters

Every piece of work — a bugfix, a feature, an experiment — deserves its own branch. Creating a branch before you start keeps your changes isolated, makes code review possible, and prevents half-finished work from mixing with stable code.

## Two Ways to Create a Branch

### Method 1: Create, then Switch Separately

```bash
git branch feature-login       # create the branch
git switch feature-login       # switch to it
```

After `git branch feature-login`, you're still on your current branch. The new branch exists but HEAD hasn't moved yet.

### Method 2: Create and Switch in One Step

```bash
git switch -c feature-login
# or equivalently:
git checkout -b feature-login
```

The `-c` flag means "create." This is the shorthand professionals use — one command does both.

<Callout type="tip">
`git switch` was introduced in Git 2.23 (2019) as a more intuitive replacement for `git checkout` (for branch operations). Both work. On modern systems, prefer `git switch` and `git switch -c`.
</Callout>

Try creating branches in the sandbox below — it starts with one commit on `main`:

<TerminalSandbox
  stateUrl="/sandbox/git_02_branching_02.json"
  height="22rem"
/>

## Creating a Branch from a Specific Starting Point

By default, `git switch -c` creates the branch from your current HEAD. You can specify a different starting point:

```bash
# Create from a specific commit
git switch -c hotfix-nav abc1234

# Create from another branch
git switch -c review-copy main

# Create from a remote-tracking branch
git switch -c feature-auth origin/main
```

The new branch starts at that commit — it doesn't need to start from where you currently are.

## Branch Names

Branch names are filenames in `.git/refs/heads/`. Valid conventions:

| ✓ OK | ✗ Not OK |
| :--- | :------- |
| `feature-login` | `feature login` (spaces not allowed) |
| `bugfix/issue-142` | `my..branch` (double dots) |
| `release/v2.1` | `-starts-with-dash` |
| `hotfix_nav_overlap` | `branch~1` (tilde reserved) |

**Common conventions used in teams:**

```
feature/login-form
bugfix/nav-overflow
hotfix/critical-auth-bypass
release/v2.1.0
chore/update-dependencies
```

Using a prefix + slash creates visual organization. Many Git GUIs and platforms (like GitHub) group branches by prefix.

## Confirming the Branch Was Created

```bash
git branch
```

```
  main
* feature-login
```

The `*` marks the currently checked-out branch.

## What Happens Internally

Creating `feature-login` from `main` when `main` is at commit `a1b2c3`:

```bash
cat .git/refs/heads/feature-login
# a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
```

Same hash as `main`. They point to the same commit until you start committing.

## Exercise

```bash
# Ensure you're on main with at least one commit
git log --oneline

# Create and switch to a feature branch
git switch -c feature-demo

# Confirm the switch
git branch           # star should be on feature-demo
git log --oneline    # same history as main (for now)

# Make a commit on this branch
echo "feature work" > feature.txt
git add feature.txt
git commit -m "Add feature placeholder"

# Switch back to main
git switch main
ls    # feature.txt is NOT here — it's on the other branch
```

## Summary

`git switch -c <name>` creates and switches to a branch in one step. The new branch starts at your current HEAD (or a specified commit/branch). Branch names follow filename rules — use prefix conventions like `feature/`, `bugfix/`, `hotfix/` for team clarity. After creation, the new branch shares history with its starting point; your commits will diverge from there.

## Related

- [Listing and Inspecting Branches](/learn/git_foundations/git_02_branching_03_listing_branches)
- [Switching Between Branches](/learn/git_foundations/git_02_branching_04_switching_branches)
- [Understanding Branches as Pointers](/learn/git_foundations/git_02_branching_01_branch_pointer_model)
