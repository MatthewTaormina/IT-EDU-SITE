---
type: lesson
title: "Understanding Branches as Pointers"
description: "Understand how Git branches work mechanically — as lightweight movable pointers to commits — so branching and merging become intuitive rather than mysterious."
duration_minutes: 12
difficulty: Beginner
tags: [git, branches, HEAD, pointers, internals]
---

> A Git branch is not a copy of your code. It is a 41-byte file containing a single commit hash. That's what makes branching instantaneous and free in Git.

## Why This Matters

Developers from other version control systems often fear branching because it used to be expensive — copying files, slow operations, merge nightmares. In Git, a branch is just a named pointer. Understanding this model removes the anxiety around creating branches and makes the behavior of `git checkout`, `git merge`, and `git log` immediately obvious.

## What a Branch Actually Is

In your repository, run:

```bash
cat .git/refs/heads/main
```

You'll see a single 40-character SHA-1 hash. That's your `main` branch — a text file containing a commit hash.

When you commit, Git:
1. Creates the commit object
2. Updates the current branch's file to point to the new commit hash

The branch pointer follows the latest commit automatically.

## HEAD: The Pointer to Your Location

`HEAD` is a special pointer that tells Git which branch you're currently on:

```bash
cat .git/HEAD
```

```
ref: refs/heads/main
```

This means HEAD points to `main`, and `main` points to the latest commit on that branch.

### Visualizing the Pointer Chain

```
main  ──→  [commit C]  ──→  [commit B]  ──→  [commit A]
 ↑
HEAD
```

Every commit stores a reference to its parent (except the very first). Git follows the parent chain to reconstruct history.

## Creating a New Branch

```bash
git branch feature-login
```

This creates a new file `.git/refs/heads/feature-login` with the exact same commit hash as `main` right now. No files are copied. No commits are duplicated. The branch simply exists as a new pointer alongside `main`.

```
main          ──→  [commit C]
feature-login ──→  [commit C]   ← same commit, two names
 
HEAD still points to main
```

## Moving HEAD to a Branch

```bash
git checkout feature-login
# or equivalently:
git switch feature-login
```

Now HEAD points to `feature-login`. When you make a new commit, only `feature-login` advances. `main` stays put.

```
main          ──→  [commit C]            ← stays here
feature-login ──→  [commit D]  ──→  [commit C]
                       ↑
                      HEAD
```

## Detached HEAD State

If you checkout a specific commit hash instead of a branch name:

```bash
git checkout abc1234
```

HEAD points directly to a commit, not a branch:

```bash
cat .git/HEAD
abc1234def567...
```

This is "detached HEAD" state. Any commits you make here are not attached to any branch — they'll be orphaned when you checkout something else.

<Callout type="warning">
Detached HEAD is useful for reading old code or running tests on a specific commit, but do not make commits in detached HEAD unless you immediately create a branch to preserve them:
```bash
git checkout abc1234
# ... inspect things ...
git checkout -b experiment-from-old-commit   # save your position as a branch
```
</Callout>

## Why This Matters for Merging

When Git merges two branches, it finds their common ancestor commit and computes the changes on each side. Because branches are just pointers, Git can precisely trace the commit graph to find the divergence point.

```
     [D]  ← feature-login
    /
[C]
    \
     [E]  ← hotfix
```

The common ancestor is `[C]`. Git knows exactly what changed in each direction from there.

## Branches Are Cheap — Use Them

Because a branch is just a pointer:
- Creating a branch: instantaneous
- Switching branches: nearly instant (just a file update + working directory sync)
- Deleting a branch: removes one file; commits remain until garbage collected

**The correct Git mental model:** branch freely. Create a branch for every task, experiment, or fix. Branches cost nothing and isolate your work from `main`.

<ProgressCheck>
Check your understanding: what does `cat .git/refs/heads/main` print? Run it in a repository. Then run `git log --oneline -1` and compare the hash. They should match.
</ProgressCheck>

## Summary

A Git branch is a text file storing a single commit hash. HEAD points to the currently active branch. When you commit, the current branch's pointer advances to the new commit. Detached HEAD occurs when you checkout a commit directly rather than a branch name. Branches are cheap and disposable — the Git mental model encourages using them freely.

## Related

- [Creating Branches](/lessons/git_02_branching_02_creating_branches)
- [Switching Between Branches](/lessons/git_02_branching_04_switching_branches)
- [The DAG Commit Graph](/lessons/git_00_intro_04_dag_commit_graph)
