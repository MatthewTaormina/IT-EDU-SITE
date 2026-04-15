---
type: lesson
title: "Pushing Changes with `git push`"
description: "Upload local commits to a remote repository using `git push`, set upstream tracking, and handle common push rejections."
duration_minutes: 12
difficulty: Beginner
tags: [git, git-push, remotes, upstream, workflow]
---

> `git push` transfers your local commits to a remote repository. It's how your work becomes visible to teammates, and how deployments often trigger.

## Why This Matters

Commits only exist locally until you push. A committed-but-not-pushed codebase is still isolated on your machine — it's not backed up, not visible to collaborators, and not deployable. Pushing is the step that makes work real in a collaborative context.

## Basic Push

```bash
git push origin main
```

This pushes your local `main` branch to the remote named `origin`. Git transfers all commits in your local `main` that the remote doesn't have yet.

```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Writing objects: 100% (3/3), 300 bytes | 300.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To https://github.com/yourname/my-project.git
   a1b2c3d..e3f4a5b  main -> main
```

The last line confirms: your local `main` (at `e3f4a5b`) has been pushed to `origin/main`.

## Setting the Upstream: `git push -u`

The `-u` flag sets the upstream tracking relationship between your local branch and the remote branch:

```bash
git push -u origin feature-login
```

After this, you can push with just:

```bash
git push
```

Git remembers that this branch pushes to `origin/feature-login`. The tracking association is stored in `.git/config`:

```ini
[branch "feature-login"]
    remote = origin
    merge = refs/heads/feature-login
```

<Callout type="tip">
Always use `-u` the first time you push a new branch. Every subsequent push on that branch can be just `git push` — no need to specify remote and branch name.
</Callout>

## Pushing a New Branch

When you create a local branch and push it for the first time, the remote doesn't know about it yet:

```bash
git switch -c feature/auth
# ... make commits ...
git push -u origin feature/auth
```

This creates the branch on the remote and sets up tracking.

## What Happens if Push Is Rejected

Git rejects a push when the remote branch has commits your local branch doesn't have. This means someone else pushed to the same branch since your last `git pull` or `git fetch`.

```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'origin'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.
```

**The fix: pull first, then push.**

```bash
git pull origin main    # merge remote changes into your local branch
git push origin main    # now push the merged result
```

<Callout type="warning">
Never use `git push --force` unless you understand exactly what you're overwriting. Force-push replaces the remote branch history with your local history — any commits on the remote that you don't have locally will be permanently lost for all collaborators.

The safer option is `git push --force-with-lease`, which adds a check: it refuses to force-push if someone else has pushed since your last fetch.
</Callout>

## Pushing All Branches

```bash
git push --all origin
```

Pushes every local branch to the remote. Use with caution on shared repositories — you may push experimental branches you didn't intend to share.

## Pushing Tags

Regular `git push` does not push tags:

```bash
git push origin v1.0.0       # push a specific tag
git push origin --tags        # push all tags
```

## Checking Ahead/Behind Before Pushing

```bash
git status
```

```
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
  (use "git push" to publish your local commits)
```

"Ahead by 2" means you have 2 local commits not yet on the remote. "Behind by 3" (or "diverged") means you need to pull before pushing.

## Quick Reference

```bash
git push origin main            # push local main to origin
git push -u origin feature-x    # push new branch + set upstream
git push                        # push to tracked remote (after -u)
git push origin --delete branch # delete a remote branch
git push --force-with-lease     # safe force push
git push origin --tags          # push tags
```

## Summary

`git push origin <branch>` uploads local commits to the remote. Use `-u` the first time to set upstream tracking so future pushes need no arguments. A rejected push means the remote has newer commits — pull first, then push. Avoid `--force` except in solo workflows; prefer `--force-with-lease` when rewriting history on a branch.

## Related

- [Fetching Changes with `git fetch`](/lessons/git_03_remotes_06_git_fetch_command)
- [Pulling Changes with `git pull`](/lessons/git_03_remotes_07_git_pull_command)
- [Feature Branch Workflow](/lessons/git_02_branching_09_feature_branch_workflow)
