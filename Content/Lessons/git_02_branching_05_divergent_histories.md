---
type: lesson
title: "Divergent Histories"
description: "Understand how branch histories diverge after creating a branch and committing independently, and why this divergence is the foundation of all merging."
duration_minutes: 10
difficulty: Beginner
tags: [git, branches, divergence, DAG, history, merge]
---

> The moment you commit on two different branches, their histories diverge. Merging is the act of reconciling that divergence — and understanding divergence is what makes merging predictable.

## Why This Matters

Before learning how merges work, you need to visualize what it means for branches to diverge. The visual model of the commit graph is what makes "fast-forward" and "three-way merge" intuitive rather than magic keywords.

## Starting Point: Two Branches, Same Tip

After `git switch -c feature-login`, both `main` and `feature-login` point to the same commit:

```
A ← B ← C    ← main, feature-login, HEAD
```

They share identical history. No divergence yet.

## Making Commits on `feature-login`

```bash
git switch feature-login
echo "login form" > login.html
git add login.html && git commit -m "Add login form"
echo "auth logic" > auth.js
git add auth.js && git commit -m "Add auth logic"
```

Now the graph looks like:

```
A ← B ← C ← D ← E    ← feature-login, HEAD
              ↑
             main
```

`feature-login` has moved forward. `main` still points at `C`. There is NO divergence yet — `feature-login` is simply **ahead** of `main`. This is the "fast-forward eligible" case.

## Now Making a Commit on `main`

```bash
git switch main
echo "footer update" > footer.html
git add footer.html && git commit -m "Update footer"
```

Now both branches have new commits that the other doesn't have:

```
              D ← E    ← feature-login
             /
A ← B ← C
             \
              F    ← main, HEAD
```

This is **divergence**. `main` has `F` (the footer commit) that `feature-login` doesn't. `feature-login` has `D` and `E` (login commits) that `main` doesn't. Commit `C` is their **common ancestor** — the last commit they share.

## Why the Common Ancestor Matters

When you merge, Git needs to answer: "What changed on each side since they diverged?" The common ancestor is the baseline.

- Changes from `C` → `F`: footer update (main's contribution)
- Changes from `C` → `E`: login form + auth logic (feature-login's contribution)

Git applies both sets of changes on top of `C` to create the merge commit.

## Viewing Divergence with `git log`

```bash
git log --oneline --graph --all
```

```
* e3f4a5b (feature-login) Add auth logic
* d2c3b4a Add login form
| * f1e2d3c (HEAD -> main) Update footer
|/
* c9b8a7a Initial project setup
```

The `|/` shape shows where the branches diverged. This command is your primary tool for understanding branch structure.

## Commits in One Branch but Not Another

```bash
# See commits in feature-login that are NOT in main
git log main..feature-login --oneline
```

```
e3f4a5b Add auth logic
d2c3b4a Add login form
```

```bash
# See commits in main that are NOT in feature-login
git log feature-login..main --oneline
```

```
f1e2d3c Update footer
```

The `..` syntax means "reachable from the right side but not the left side" in the commit graph.

## What This Means for Merging

When you later run `git merge feature-login` from `main`, Git will:
1. Find the common ancestor (`C`)
2. Compute the diff from `C` to `F` (main's changes)
3. Compute the diff from `C` to `E` (feature's changes)
4. Apply both sets of changes to create a merge commit

If those diffs don't overlap (different files or different lines), the merge is automatic. If they overlap, you get a conflict.

<ProgressCheck>
Create two branches from the same starting point, make 2 commits on each, then run `git log --oneline --graph --all`. Confirm you can see the divergence point in the ASCII graph.
</ProgressCheck>

## Summary

Branches diverge the moment independent commits are made on each side. The common ancestor is the last shared commit — Git uses it as the baseline for merging. Use `git log --oneline --graph --all` to visualize divergence. The `main..branch` syntax shows commits in one branch not found in another.

## Related

- [Fast-Forward Merges](/learn/git_foundations/git_02_branching_06_fast_forward_merge)
- [Three-Way Merges](/learn/git_foundations/git_02_branching_07_three_way_merge)
- [The DAG Commit Graph](/learn/git_foundations/git_01_init_commit_08_dag_commit_graph)
