---
type: lesson
title: "Merge Strategies and Options"
description: "Understand the merge strategies Git uses — ort, recursive, octopus, ours — and key options like `--no-ff`, `--squash`, and `--strategy-option` for controlling merge behavior."
duration_minutes: 12
difficulty: Intermediate
tags: [git, merge, merge-strategy, ort, no-ff, squash, options]
---

> Git's default merge strategy works well for most cases. Knowing the alternatives lets you control exactly how histories are merged when the default isn't appropriate.

## Why This Matters

As you encounter more complex workflows — long-running branches, large teams, automated CI pipelines — you'll hit situations where the default merge behavior creates unwanted commits, noisy history, or suboptimal results. Understanding strategies gives you the vocabulary and tools to make intentional choices.

## How Git Selects a Strategy

When you run `git merge`, Git automatically picks a strategy based on the situation:

| Situation | Default strategy |
| :-------- | :--------------- |
| Merging one branch | `ort` (or `recursive` on older Git) |
| Merging 3+ branches simultaneously | `octopus` |
| `--allow-unrelated-histories` needed | `ort` with extra options |

You can override with `--strategy` (`-s`).

## The `ort` Strategy (Default Since Git 2.34)

`ort` — Ostensibly Recursive's Twin — is the current default. It replaced `recursive` as the standard two-branch merge algorithm. It:
- Finds the best common ancestor using a recursive DAG traversal
- Applies changes from both sides to that ancestor
- Detects and reports conflicts at the line level

For virtually all day-to-day merges, you never need to think about this. It's the one that runs when you type `git merge`.

## Strategy Options: `--strategy-option` (`-X`)

These modify the behavior of the `ort`/`recursive` strategy:

### `-X ours` — Prefer Our Version in Conflicts

```bash
git merge -X ours feature-branch
```

When a conflict occurs, automatically resolve it by taking YOUR branch's version. No manual intervention required.

<Callout type="warning">
`-X ours` resolves ALL conflicts in your favor automatically. The incoming branch's changes are silently discarded wherever they conflict with yours. Use carefully — it's easy to accidentally throw away valid work.
</Callout>

### `-X theirs` — Prefer Incoming Version in Conflicts

```bash
git merge -X theirs feature-branch
```

Automatically resolves all conflicts by taking the INCOMING branch's version. Your version is discarded in conflict areas.

### `-X ignore-all-space`

```bash
git merge -X ignore-all-space feature-branch
```

Treats whitespace-only changes as non-conflicting. Useful when branches reformatted code with different indentation or added trailing spaces, and you want content changes to take priority.

## Merge Commit Options

### `--no-ff` — Force a Merge Commit

```bash
git merge --no-ff feature-branch
```

Creates a merge commit even when a fast-forward would be possible. Preserves the branching topology in the DAG. Used by many teams and CI systems to make feature boundaries visible in history.

### `--ff-only` — Refuse if Not Fast-Forwardable

```bash
git merge --ff-only feature-branch
```

The merge fails with an error if the merge would require a merge commit. Used on `main` branches in pipelines where a linear history is enforced.

### `--squash` — Combine All Commits into One

```bash
git merge --squash feature-branch
git commit -m "Add user authentication feature"
```

Stages all the changes from the feature branch without creating a merge commit or preserving the individual commits. You then make a single commit with a clean message.

The result: `main`'s history shows one clean commit representing the entire feature, with no mention of intermediate "WIP" or "Fix typo" commits from the branch.

<Callout type="tip">
`--squash` is one of the most useful merge options in team workflows. It lets developers commit freely and messily on a feature branch (which is encouraged) while producing a clean, professional `main` history.
</Callout>

Note: `--squash` does **not** create a merge commit. The branches are not recorded as converging in the DAG — `feature-branch` must be deleted manually afterwards because `--merged` detection won't work.

## The `octopus` Strategy (3+ Branches)

```bash
git merge branch-a branch-b branch-c
```

Merges multiple branches simultaneously. Used by Linux kernel development and other complex projects. Cannot handle conflicts — if any conflict exists, the merge fails and requires multiple sequential two-branch merges.

## Comparison Table

| Option | Effect | When to use |
| :----- | :------ | :---------- |
| `--no-ff` | Always create a merge commit | Preserve branch evidence in history |
| `--ff-only` | Fail if merge commit required | Enforce linear history policy |
| `--squash` | Combine into one staged changeset | Clean history from messy branches |
| `-X ours` | Auto-resolve conflicts favoring HEAD | Batch conflict resolution (use carefully) |
| `-X theirs` | Auto-resolve conflicts favoring incoming | Accept all incoming changes |

## Summary

`ort` is Git's default merge strategy for two-branch merges. Strategy options like `-X ours` and `-X theirs` auto-resolve conflicts deterministically. Commit options control the resulting history shape: `--no-ff` always creates a merge commit, `--ff-only` refuses merge commits, `--squash` collapses the incoming history into a single staged commit. Understanding these options lets you enforce consistent history policies and handle edge cases confidently.

## Related

- [Fast-Forward Merges](/learn/git_foundations/git_02_branching_06_fast_forward_merge)
- [Three-Way Merges](/learn/git_foundations/git_02_branching_07_three_way_merge)
- [Aborting a Merge](/learn/git_foundations/git_04_conflicts_07_aborting_merge)
