---
type: lesson
title: "The DAG: Directed Acyclic Graph of Commits"
description: "Understand commit history as a directed acyclic graph, how branches and HEAD fit into this model, and why Git's immutability means history can never truly be lost."
duration_minutes: 16
difficulty: Beginner
tags: [git, dag, commit-graph, branches, head, immutability]
---

> Every commit in Git points back to its parent. The resulting graph — a directed acyclic graph — is the complete history of your project. Understanding it makes every Git operation intuitive.

## Why This Matters

If you've ever wondered why `git log` shows commits in a specific order, or how merging two branches "joins" history, or why deleting a branch doesn't delete commits — the answer is the DAG.

The directed acyclic graph is not a Git-specific curiosity. It is the fundamental data structure that everything in Git is built on. Once you can visualize it, you can reason through any Git situation.

## What Is a DAG?

A **directed acyclic graph** has three properties:

| Property | Meaning | In Git |
| :--- | :--- | :--- |
| **Graph** | A set of nodes connected by edges | Commits connected by parent pointers |
| **Directed** | Edges have a direction | Each commit points to its parent(s), not the reverse |
| **Acyclic** | No path traces back to itself | You can never follow parent pointers and return to the same commit |

In Git: commits are nodes, parent pointers are directed edges, and the acyclic property is enforced by immutability (you cannot modify a commit to point to a later one).

## Building Up the Graph

### Initial Commit

When you make your first commit, it has **no parent**:

```
A
```

Commit `A` is the root of the graph.

### Normal Commits

Each subsequent commit points to its predecessor:

```
A ← B ← C ← D
```

`D` is the current commit (the tip). `D` points to `C`, `C` to `B`, `B` to `A`. Reading along parent pointers traces back through history.

### Branches

A **branch** is simply a named pointer to a commit — not a copy of files, not a section of the graph. When you create a branch, Git writes a 41-byte file:

```
A ← B ← C ← D    ← HEAD → main
                  ← feature (also pointing to D)
```

Both `main` and `feature` currently point to the same commit `D`. Now you make a commit on `feature`:

```
A ← B ← C ← D    ← main
                ↘
                 E    ← HEAD → feature
```

`feature` advanced to `E`. `main` still points to `D`. The graph has **diverged**.

### Merge Commits

A **merge commit** has two (or more) parents. It records the integration of two branches:

```
A ← B ← C ← D ← M    ← HEAD → main
                ↗
         E ← F    ← feature
```

Merge commit `M` has two parents: `D` (from `main`) and `F` (from `feature`). Reading `M`'s history includes both lines.

## HEAD: Where You Are

`HEAD` is a special pointer that tracks your current position in the graph. In normal usage, `HEAD` points to a branch, and that branch points to a commit:

```
HEAD → main → D
```

When you make a new commit, the branch pointer advances and HEAD stays attached:

```
HEAD → main → E (new commit, D is its parent)
```

### Detached HEAD

If you check out a specific commit directly (not a branch), HEAD points to the commit itself rather than a branch:

```bash
git checkout a1b2c3d4  # SHA-1 of a specific commit
```

```
HEAD → a1b2c3d4 (detached — no branch name)
```

In detached HEAD state, new commits are made but no branch advances to track them. They become unreachable once you switch away. Use `git switch -c new-branch` to save your work.

<Callout type="warning">
Detached HEAD is a common source of confusion for beginners. If you see "HEAD detached at a1b2c3d", it means you're not on a named branch. Create a new branch before continuing to commit work.
</Callout>

## Immutability: History Cannot Be Lost

Because commit objects are content-addressed and immutable, **deleting a branch pointer does not delete commits**. Consider:

```
A ← B ← C ← D    ← main
              ↘
               E ← F    ← feature
```

If you delete `feature`:

```
A ← B ← C ← D    ← main
              ↘
               E ← F    (no pointer — but objects still exist)
```

`E` and `F` still exist in the object database. Git's garbage collector will only remove them if they've been unreachable for more than 30 days (configurable). Until then, `git reflog` can find them and you can attach a new branch pointer to recover them.

<Callout type="tip">
If you accidentally delete a branch, run `git reflog` to find the SHA-1 of the tip commit, then `git switch -c recovered-branch <sha1>` to bring it back.
</Callout>

## Reading the Graph with `git log --graph`

You can visualize the DAG in your terminal:

```bash
git log --oneline --graph --all
```

Example output:

```
*   a1b2c3d (HEAD -> main) Merge branch 'feature-auth'
|\
| * f7e6d5c (feature-auth) Add JWT token validation
| * e4d3c2b Add login endpoint
* | b8a7c9d Fix typo in README
|/
* 9f8e7d6 Initial commit
```

The ASCII graph on the left shows exactly how commits relate to each other. The `*` is a commit, `|` is a branch line, `\` and `/` show merges and branch points.

## Summary

- Git's commit history is a **directed acyclic graph** — commits as nodes, parent pointers as edges
- **Branches** are named pointers to commits, not copies of files
- **HEAD** is a pointer tracking your current position
- **Merge commits** have two parents and record the integration of branches
- **Immutability** means commits are never truly deleted — only pointers are removed

## Related

- [Git's Object Model: Blobs, Trees, and Commits](/lessons/git_01_init_commit_09_git_object_model)
- [The Three Working Areas](/lessons/git_00_intro_05_three_working_areas)
- [What Is a Branch? The Lightweight Pointer Model](/lessons/git_02_branching_01_branch_pointer_model)
