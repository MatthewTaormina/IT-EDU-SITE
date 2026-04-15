---
type: lesson
title: "Remote-Tracking Branches"
description: "Understand how Git stores your last-known view of remote branches as remote-tracking references, and how they drive ahead/behind tracking."
duration_minutes: 11
difficulty: Beginner
tags: [git, remotes, remote-tracking, origin, fetch]
---

> Remote-tracking branches are local snapshots of where remote branches were the last time you communicated with the remote. They're read-only references that power the "ahead/behind" display in `git status`.

## Why This Matters

When Git tells you "Your branch is ahead of 'origin/main' by 2 commits," it's comparing your local `main` against a stored snapshot called `origin/main`. Understanding these tracking references explains how Git knows the state of the remote without connecting to it constantly.

## What Remote-Tracking Branches Are

For every branch on the remote that Git knows about, it maintains a local reference in the format `<remote>/<branch>`:

```
origin/main
origin/feature-login
origin/release/v2.1
```

These live in `.git/refs/remotes/origin/` (or `.git/packed-refs`). They are **read-only** — you cannot commit to them directly.

They are updated only when you:
- `git clone` — downloads the initial remote state
- `git fetch` — updates all remote-tracking refs
- `git pull` — fetches, then merges
- `git push` — updates the corresponding remote-tracking ref after a successful push

## Viewing Remote-Tracking Branches

```bash
git branch -r
```

```
  origin/HEAD -> origin/main
  origin/feature-login
  origin/main
```

```bash
git branch -a   # local + remote-tracking together
```

```
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature-login
  remotes/origin/main
```

## How Ahead/Behind Is Calculated

When you run `git status` and see:

```
Your branch is ahead of 'origin/main' by 3 commits.
```

Git is counting commits reachable from your local `main` but NOT from `origin/main`. These are commits you've made locally but haven't pushed yet.

```
origin/main  →  [A] [B] [C]
local main   →  [A] [B] [C] [D] [E] [F]
                              ↑
                        3 commits ahead
```

"Behind by N" means the remote-tracking ref has commits your local branch doesn't have. Both ahead and behind = "diverged."

## Checking Tracking Configuration

```bash
git branch -vv
```

```
* main           f9e8d7c [origin/main: ahead 2] Add login page
  feature-login  a1b2c3d [origin/feature-login] Add form validation
```

The `[origin/main: ahead 2]` shows:
- This branch tracks `origin/main`
- Local branch is 2 commits ahead of the remote-tracking ref

## The Relationship Between Local and Remote-Tracking Branches

```
                    REMOTE (GitHub/GitLab)
                    ┌──────────────────────┐
                    │  main → commit E     │
                    └──────────────────────┘
                              ↕ fetch/push
                    LOCAL REPOSITORY
                    ┌──────────────────────┐
                    │  origin/main → E     │  ← remote-tracking ref
                    │                      │
                    │  main → G            │  ← local branch (ahead by 2)
                    └──────────────────────┘
```

`origin/main` stores the last-known state of the remote's `main`. Your local `main` is where you work. They diverge when you commit locally without pushing, or when others push to the remote without you fetching.

## Setting Up Tracking for an Existing Branch

If a local branch doesn't track a remote branch yet:

```bash
git branch --set-upstream-to=origin/main main
# or shorthand:
git branch -u origin/main main
```

## Checking Out a Remote Branch Locally

When you clone a repository, only the default branch (e.g., `main`) is checked out locally. To work on another remote branch:

```bash
git switch feature-login
```

If `feature-login` doesn't exist locally but `origin/feature-login` does, Git automatically:
1. Creates a local `feature-login` branch
2. Sets it to track `origin/feature-login`

This is called **automatic tracking setup**.

<Callout type="tip">
Remote-tracking branches are not live — they're cached snapshots. Run `git fetch` regularly to update them to the actual current state of the remote, especially before merging or branching from a remote branch.
</Callout>

## Summary

Remote-tracking branches (`origin/main`, etc.) are read-only local snapshots of remote branch state, updated only during fetch/pull/push. They power the "ahead/behind" display in `git status`. Use `git branch -r` to list them, `git branch -vv` to see tracking relationships and ahead/behind counts, and `git fetch` to update them from the remote.

## Related

- [Fetching Changes with `git fetch`](/lessons/git_03_remotes_06_git_fetch_command)
- [Managing Remotes with `git remote`](/lessons/git_03_remotes_02_git_remote_command)
- [Listing and Inspecting Branches](/lessons/git_02_branching_03_listing_branches)
