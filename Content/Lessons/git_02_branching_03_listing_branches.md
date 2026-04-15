---
type: lesson
title: "Listing and Inspecting Local Branches"
description: "Use `git branch` and its flags to list, filter, and inspect local branches — and see what each one contains without leaving your current branch."
duration_minutes: 6
difficulty: Beginner
tags: [git, branches, git-branch]
---

> You can't manage branches you can't see. `git branch` tells you what branches exist, where they are, and what's been merged.

## Why This Matters

On a real project, a repository might have dozens — or hundreds — of branches. Knowing how to quickly list, filter, and inspect branches saves time and prevents mistakes like working on a stale branch or merging something you didn't intend.

## List Local Branches

```bash
git branch
```

```
  bugfix/nav
* main
  feature-login
  release/v1.2
```

- The `*` marks the current branch (HEAD)
- Branches are listed alphabetically

## See the Last Commit on Each Branch

```bash
git branch -v
```

```
  bugfix/nav     e1a2b3c Fix nav overflow at 320px
* main           f9e8d7c Merge pull request: add auth
  feature-login  a1b2c3d WIP: login form validation
```

`-v` shows the short hash and subject of the most recent commit on each branch. Useful for quickly seeing what each branch contains.

## Filtering the Branch List

```bash
git branch --list "feature/*"   # only branches starting with feature/
git branch -a --list "*/main"   # remote and local main branches
```

## Summary

`git branch` lists your local branches; the `*` marks the current one. Add `-v` to see the last commit on each branch. Use `--list "<pattern>"` to filter by name. These commands give you a fast read of local branch state without switching to anything.

## Related

- [Deleting Branches](/learn/git_foundations/git_02_branching_08_deleting_branches)
- [Switching Between Branches](/learn/git_foundations/git_02_branching_04_switching_branches)
