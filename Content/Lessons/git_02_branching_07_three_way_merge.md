---
type: lesson
title: "Three-Way Merges"
description: "Understand how Git performs a three-way merge when branches have diverged, and what a merge commit represents in the commit graph."
duration_minutes: 12
difficulty: Beginner
tags: [git, merge, three-way-merge, branches, commit-graph]
---

> When two branches have diverged — each has commits the other doesn't — Git perform a three-way merge. The result is a new merge commit with two parents.

## Why This Matters

A three-way merge is what you encounter when working with teammates: you commit on your feature branch, someone else commits on `main`, and now both branches have independent work. Understanding how Git reconciles this keeps you confident when the merge output looks unfamiliar.

## The Three-Way Merge Scenario

```
              D ← E    ← feature-login
             /
A ← B ← C
             \
              F    ← main, HEAD
```

`main` has `F` (footer update). `feature-login` has `D` and `E` (login feature). Commit `C` is the common ancestor — the last point where both branches shared identical history.

Git needs three snapshots to figure out what the combined result should be:
1. **The common ancestor** (`C`) — the baseline
2. **The `main` tip** (`F`) — what changed on main
3. **The `feature-login` tip** (`E`) — what changed on the feature

Hence "three-way."

## Performing the Merge

```bash
git switch main
git merge feature-login
```

Git automatically computes the changes from `C` to `F` and from `C` to `E`, then applies both to produce the combined result.

A text editor opens for the merge commit message (default: `Merge branch 'feature-login'`). Save and close it.

```
Merge made by the 'ort' strategy.
 login.html | 1 +
 auth.js    | 8 ++++++++
 2 files changed, 9 insertions(+)
```

## The Merge Commit

The resulting commit `M` has **two parent commits** — `F` (from `main`) and `E` (from `feature-login`):

```
              D ← E ← \
             /          M    ← main, HEAD
A ← B ← C              ↑
             \        /
              F ←────+
```

`M` is the state of the project with both features applied. This DAG shape — a "diamond" — is the signature of a three-way merge.

## Viewing the Merge in the Log

```bash
git log --oneline --graph
```

```
*   a3b4c5d (HEAD -> main) Merge branch 'feature-login'
|\
| * e3f4a5b (feature-login) Add auth logic
| * d2c3b4a Add login form
* | f1e2d3c Update footer
|/
* c9b8a7a Initial project setup
```

The `|\` and `|/` show the diamond shape: the feature path branched off and rejoined `main` at the merge commit.

## When Three-Way Merges Succeed Automatically

As long as the changes from each side don't affect the **same lines** in the **same file**, Git resolves the merge without intervention.

For example:
- `main` modified `footer.html`
- `feature-login` created `login.html` and `auth.js`

There's no overlap — Git merges cleanly.

## When Three-Way Merges Require Manual Resolution

If both branches modified the **same lines in the same file**, Git cannot automatically decide which version to keep. It stops and flags a **conflict** for you to resolve manually.

Conflicts are covered in depth in Unit 04. For now: conflicts happen during three-way merges (not fast-forwards), and they're normal, manageable, and not a sign that something broke.

<Callout type="tip">
Before merging, update `main` with `git pull` and rebase or merge-in latest `main` to your feature branch if it's been a while. This minimizes the divergence and reduces the chance of conflicts when you finally open a pull request.
</Callout>

## Merge Commit Message Conventions

By default the message is `Merge branch 'feature-login'`. On pull-request workflows, platforms generate more informative messages like:

```
Merge pull request #42: Add user authentication

- Add login form (login.html)
- Add JWT auth logic (auth.js)
- Add unit tests for auth module
```

<QuizBox
  question="You are on `main` and run `git merge feature-login`. Git performs a three-way merge instead of a fast-forward. What does this tell you about the branch histories?"
  options="`feature-login` has no commits — only `main` has advanced; Both `main` and `feature-login` have diverged from a common ancestor; `feature-login` is ahead of `main` with no divergence; There is a conflict that must be resolved manually"
  answer="1"
  explanation="A three-way merge is triggered when neither branch is a direct ancestor of the other. A fast-forward is only possible when one branch is ahead with no independent commits."
/>

<QuizBox
  question="How many parent commits does a merge commit have?"
  options="Zero — merge commits have no parents; One — the branch being merged into; Two — one from each branch being merged; It depends on whether there were conflicts"
  answer="2"
  explanation="A merge commit always has two parents: the tip of the branch you merged into (e.g., `main`) and the tip you merged from (e.g., `feature-login`). This two-parent structure creates the diamond shape in the commit graph."
/>

<QuizBox
  question="In `git log --oneline --graph`, what do the `|\` and `|/` characters represent?"
  options="A rebase; A cherry-pick; The divergence and rejoining of two branches at a merge commit — the diamond shape; An error in the log output"
  answer="2"
  explanation="The `|\` shows where the feature branch diverged from main, and `|/` shows where it rejoined at the merge commit. Together they form the diamond that marks a three-way merge in the DAG."
/>

## Summary

A three-way merge occurs when both branches have diverged from a common ancestor. Git uses the ancestor, both branch tips as the three inputs and produces a merge commit with two parents. The history takes a diamond shape in the DAG. Automatic resolution works when changes don't overlap; conflicting changes require manual resolution.

## Related

- [Fast-Forward Merges](/lessons/git_02_branching_06_fast_forward_merge)
- [Divergent Histories](/lessons/git_02_branching_05_divergent_histories)
- [When Conflicts Occur](/lessons/git_04_conflicts_01_when_conflicts_occur)
