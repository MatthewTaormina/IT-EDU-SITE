---
type: lesson
title: "The Three Working Areas"
description: "Learn how Git organizes your work across three distinct areas — working directory, staging area, and repository — and understand how changes flow through them with every command."
duration_minutes: 14
difficulty: Beginner
tags: [git, working-directory, staging-area, repository, index, workflow]
---

> Before you can use Git effectively, you need to know exactly where your changes are at any moment. Git manages three distinct areas, and every core command moves changes between them.

## Why This Matters

A common beginner mistake is treating `git add` and `git commit` as a single step. Another is not understanding why a file you edited isn't appearing in your commit. Both confusions disappear once you understand Git's three working areas.

Every file, at every moment, exists in a specific one of these areas. Understanding this model is prerequisite to understanding every Git command you'll learn from here on.

## The Three Areas

### Area 1: Working Directory

The **working directory** is your project folder as it appears on disk — the files you actually edit in your text editor or IDE.

Git continuously compares the files in your working directory against the last commit. When they differ, Git considers those files **modified**.

The working directory can contain:
- **Tracked files** — files Git knows about (appeared in a past commit or `git add`)
- **Untracked files** — new files Git has never seen before

### Area 2: Staging Area (Index)

The **staging area** (also called the **index**) is a holding area for changes you intend to include in your *next* commit. It lives inside `.git/index`.

When you run `git add`, you are **copying content from the working directory into the staging area**. You are telling Git: "include this change in the next commit."

The staging area is a proposed commit, built up incrementally.

### Area 3: Repository

The **repository** is the permanent object database in `.git/objects/`. When you run `git commit`, Git takes everything in the staging area and creates a new commit object in the repository.

The repository holds your entire project history — every commit, every version, every branch — forever.

## The Flow of Changes

```
Working Directory    →    Staging Area    →    Repository
  (edit files)          (git add)             (git commit)
  "What I'm working on"  "What I intend to    "Permanent history"
                          commit next"
```

Changes always move left-to-right through this pipeline:
1. You edit files in the **working directory**
2. You select changes with `git add` into the **staging area**
3. You permanently record them with `git commit` into the **repository**

## Why the Staging Area Exists

The staging area enables **precise, logical commits**. Without it, every commit would need to include all modified files at once.

### Example

You are fixing a bug in `auth.js` while also adding a new feature in `payments.js`. You edited both files.

Without a staging area, both changes go into the same commit — mixed together, harder to review and revert.

With the staging area, you can:

```bash
git add auth.js
git commit -m "Fix authentication timeout bug"

git add payments.js
git commit -m "Add Stripe payment integration"
```

Two commits, each with a single, clear purpose. Your history is clean and understandable.

<Callout type="tip">
Good commits are **atomic** — each one does one logical thing. The staging area is the tool that makes this possible. Use it deliberately.
</Callout>

## Checking Which Area Your Changes Are In

`git status` reports the state of all three areas:

```bash
git status
```

Example output:

```
On branch main
Changes to be committed:                 ← STAGING AREA
  (use "git restore --staged <file>" to unstage)
        modified:   auth.js

Changes not staged for commit:           ← WORKING DIRECTORY
  (use "git add <file>" to update what will be committed)
        modified:   config.js

Untracked files:                         ← WORKING DIRECTORY (new)
  (use "git add <file>" to include in what will be committed)
        payments.js
```

In this example:
- `auth.js` has been staged — it will be included in the next commit
- `config.js` has been modified but not staged — it will NOT be in the next commit
- `payments.js` is new and untracked — Git is not tracking it yet

## Moving Changes Between Areas

| Command | What it does |
| :--- | :--- |
| `git add <file>` | Working directory → Staging area |
| `git commit` | Staging area → Repository |
| `git restore --staged <file>` | Staging area → Working directory (unstage) |
| `git restore <file>` | Discard working directory changes (restores from staged or committed state) |

<Callout type="warning">
`git restore <file>` (without `--staged`) discards your working directory changes to that file permanently. There is no undo. Use it only when you're certain you don't need those changes.
</Callout>

<ProgressCheck>
Before moving on, make sure you can answer these questions:

1. If you edit a file but don't run `git add`, which area is it in?
2. After `git add`, but before `git commit`, where does the change live?
3. After `git commit`, where is the change permanently stored?
4. What command moves changes from the staging area back to the working directory?
</ProgressCheck>

## Summary

Git works across three areas:
- **Working directory** — files you edit, tracked and untracked
- **Staging area (index)** — changes selected for the next commit
- **Repository** — the permanent, immutable history of commits

Changes flow: edit → `git add` → `git commit`. Understanding this flow explains every Git workflow and error message you'll encounter.

## Related

- [Initializing Your First Repository](/learn/git_foundations/git_01_init_commit_01_init_repository)
- [Staging Changes with `git add`](/learn/git_foundations/git_01_init_commit_04_git_add_command)
- [Git's Object Model: Blobs, Trees, and Commits](/learn/git_foundations/git_01_init_commit_07_git_object_model)
