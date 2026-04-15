---
type: lesson
title: "Updating Your Branch with `git pull`"
description: "Use `git pull` to fetch and integrate remote changes in one step, understand what it does internally, and handle the common 'diverged branches' scenario."
duration_minutes: 12
difficulty: Beginner
tags: [git, git-pull, remotes, merge, fetch, workflow]
---

> `git pull` is the everyday command you run when you want your branch to reflect the latest work from the remote. It fetches and merges in one step.

## Why This Matters

Unless you're working in complete isolation, the remote will have commits you don't have. Before you push, and often at the start of each work session, you pull to stay synchronized with teammates. Knowing what pull does — and what it doesn't do — prevents surprises.

## What `git pull` Does

```bash
git pull origin main
```

Under the hood, this is exactly:

```bash
git fetch origin
git merge origin/main
```

Step 1: Download new commits from the remote and update `origin/main`.  
Step 2: Merge `origin/main` into your current local branch.

No magic — it's two commands combined.

## Basic Pull

```bash
git pull
```

If your branch is tracking a remote branch (set by `-u` during push), Git knows which remote and branch to pull from. No need to specify `origin main` every time.

## Fast-Forward Pull (Common Case)

If no one has touched your local branch since you last pulled, the incoming commits can be fast-forwarded:

```bash
git pull
```

```
Updating a1b2c3d..f9e8d7c
Fast-forward
 checkout.js | 25 +++++++++++++++++++++++++
 1 file changed, 25 insertions(+)
```

Your local branch pointer simply slides forward. No merge commit is created. Your history stays linear.

## Diverged Branches (Merge Needed)

If you've committed locally AND the remote has new commits, the branches have diverged:

```bash
git pull
```

```
Auto-merging README.md
Merge made by the 'ort' strategy.
 README.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Git creates a merge commit, combining both sides. This is normal and expected.

If the diverged changes conflict, Git pauses and asks you to resolve the conflict manually (covered in Unit 04).

## Pull with Rebase Instead of Merge

Some teams prefer to rebase rather than merge when pulling:

```bash
git pull --rebase origin main
```

Instead of creating a merge commit, this replays your local commits on top of the incoming remote commits. The result is a linear history.

Configure this globally for a consistently linear history:

```bash
git config --global pull.rebase true
```

<Callout type="tip">
The right choice between `--rebase` and merge depends on your team's strategy. For beginners: the default merge behavior is fine. When you see experienced Git users using `--rebase`, it's usually to maintain a clean linear log on feature branches before pushing.
</Callout>

## What to Do When `git pull` Is Blocked

If your working directory has uncommitted changes that conflict with incoming commits:

```
error: Your local changes to the following files would be overwritten by merge:
        login.js
Please commit your changes or stash them before you merge.
```

**Fix it:**

```bash
git stash          # park your changes
git pull           # bring in the remote changes
git stash pop      # restore your changes on top
```

Or commit your changes first, then pull.

## Checking Before You Pull

Before pulling, see how far the remote has gotten ahead:

```bash
git fetch origin              # update remote-tracking refs
git log HEAD..origin/main --oneline    # commits coming in
```

Then decide whether the pull is safe to run.

## Quick Reference

```bash
git pull                      # pull from tracked remote branch
git pull origin main          # explicit: pull origin's main into current
git pull --rebase             # pull + rebase instead of merge
git pull --ff-only            # pull, but fail if not fast-forwardable
```

`--ff-only` is useful on `main` branches where you never want a merge commit: if fast-forward isn't possible, the pull fails with an error, prompting you to rebase manually instead.

## Summary

`git pull` runs `git fetch` + `git merge` in one command. It's the standard way to stay synchronized with the remote. When branches are clean and linear, the result is a fast-forward. When branches have diverged, a merge commit is created. Use `--rebase` for a linear history, `--ff-only` to prevent merge commits on protected branches. Stash uncommitted changes before pulling if conflicts are likely.

## Related

- [Downloading Updates with `git fetch`](/lessons/git_03_remotes_06_git_fetch_command)
- [Pushing Changes with `git push`](/lessons/git_03_remotes_04_git_push_command)
- [The GitHub Collaboration Workflow](/lessons/git_03_remotes_08_github_workflow)
