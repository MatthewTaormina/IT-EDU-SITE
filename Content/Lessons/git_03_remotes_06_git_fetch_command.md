---
type: lesson
title: "Downloading Updates with `git fetch`"
description: "Use `git fetch` to safely download remote changes and update remote-tracking branches without touching your local working branches."
duration_minutes: 10
difficulty: Beginner
tags: [git, git-fetch, remotes, remote-tracking, workflow]
---

> `git fetch` downloads everything from the remote that you don't have. It updates your remote-tracking branches but never touches your local working branches. It's safe, informative, and non-destructive.

## Why This Matters

`git pull` is the shortcut most learners reach for — but it combines a fetch and a merge in one command. `git fetch` gives you the intermediate step: get the remote's commits, review the difference, then decide how to integrate them. This control matters on teams where you want to inspect incoming changes before they affect your work.

## What `git fetch` Does

```bash
git fetch origin
```

1. Connects to `origin`
2. Downloads all commits, trees, and blobs that exist on the remote but not locally
3. Updates all remote-tracking branches (`origin/main`, `origin/feature-x`, etc.)
4. **Does NOT touch** your local branches, working directory, or staging area

After a fetch, your local `main` is exactly where you left it. The remote's latest state is in `origin/main`.

## Fetch a Single Remote

```bash
git fetch origin
```

Fetches from the `origin` remote only. Updates all remote-tracking branches under `origin/`.

## Fetch All Remotes

```bash
git fetch --all
```

Updates remote-tracking branches for every configured remote.

## What Did the Remote Get?

After fetching, compare your local branch to the remote:

```bash
# See commits on origin/main that you don't have locally
git log origin/main --not main --oneline
# or equivalently:
git log main..origin/main --oneline
```

```
f9e8d7c Add checkout page
e3f4a5b Fix cart total bug
```

These are commits your teammates pushed that you haven't integrated yet.

## Seeing a Diff of What Arrived

```bash
git diff main origin/main
```

Shows the line-by-line differences between your local `main` and the remote's `main`. Use this to review incoming changes before merging.

## Integrating After Fetch

Fetch alone doesn't merge anything. To integrate the remote changes after inspecting them:

```bash
# Option 1: Merge (creates a merge commit if branches diverged)
git merge origin/main

# Option 2: Rebase (replays your local commits on top of remote commits)
git rebase origin/main
```

Most day-to-day workflows use merge (via `git pull`). Rebase is covered in advanced Git coursework.

<Callout type="tip">
`git pull` = `git fetch` + `git merge` in a single command. Use `git fetch` when you want to see what changed before deciding how to merge. Use `git pull` when you already trust the remote and want to update quickly.
</Callout>

## The `git fetch --prune` Option

Remove local remote-tracking references to branches that have been deleted on the remote:

```bash
git fetch --prune
```

Without this, your `git branch -r` list gradually accumulates stale references to deleted branches. Run it regularly or configure it permanently:

```bash
git config --global fetch.prune true
```

## Fetch Output Explained

```bash
git fetch origin
```

```
remote: Enumerating objects: 8, done.
remote: Counting objects: 100% (8/8), done.
remote: Compressing objects: 100% (3/3), done.
Unpacking objects: 100% (5/5), done.
From https://github.com/yourname/my-project
   a1b2c3d..f9e8d7c  main           -> origin/main
 * [new branch]      feature-checkout -> origin/feature-checkout
```

- `a1b2c3d..f9e8d7c  main -> origin/main` — `origin/main` advanced from `a1b2c3d` to `f9e8d7c`
- `[new branch]` — a new branch appeared on the remote

If there's nothing new, `git fetch` prints nothing (no output = already up to date).

## Exercise

```bash
# Simulate a fetch workflow
# (works best if you have a GitHub repo with recent activity)
git fetch origin
git log main..origin/main --oneline   # see what arrived
git diff main origin/main             # review the changes
git merge origin/main                 # integrate when ready
```

## Summary

`git fetch` downloads new commits from the remote and updates remote-tracking branches without changing your local branches. This makes it safe to run at any time, even mid-work. Use `git log main..origin/main` and `git diff main origin/main` to review what arrived before merging. Use `--prune` regularly to remove stale remote-tracking references.

## Related

- [Pulling Changes with `git pull`](/lessons/git_03_remotes_07_git_pull_command)
- [Remote-Tracking Branches](/lessons/git_03_remotes_05_remote_tracking_branches)
- [Pushing Changes with `git push`](/lessons/git_03_remotes_04_git_push_command)
