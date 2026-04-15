---
type: lesson
title: "Cloning a Repository with `git clone`"
description: "Clone a remote repository to your local machine with `git clone`, and understand what Git sets up for you automatically during the clone process."
duration_minutes: 10
difficulty: Beginner
tags: [git, git-clone, remotes, github, workflow]
---

> `git clone` is the first command in almost every real-world Git workflow. It copies a repository and automatically sets up everything you need to push and pull — in one command.

## Why This Matters

You'll use `git clone` the first time you start working on any existing project: an employer's codebase, an open-source project, or a repository you created on GitHub. Understanding what clone actually does explains commands like `git push origin main` without mystery.

## Basic Clone

```bash
git clone https://github.com/username/repository.git
```

This creates a folder named `repository` in the current directory and populates it with the full repository: every commit, branch, and object from the remote.

## What `git clone` Does For You

Cloning is not just a file download. Git also:

1. **Creates a new local directory** using the repository name (or a name you specify)
2. **Initializes a Git repository** inside (`git init`)
3. **Adds `origin`** as a remote pointing to the URL you cloned from (`git remote add origin <url>`)
4. **Downloads all objects** — commits, trees, blobs from all branches
5. **Creates remote-tracking branches** for all remote branches (e.g., `origin/main`, `origin/feature-x`)
6. **Checks out the default branch** (usually `main`) and sets up tracking

After cloning, running `git remote -v` immediately shows `origin` configured. You don't need to add it manually.

## Cloning with a Custom Directory Name

```bash
git clone https://github.com/username/repository.git my-local-name
```

The repository is cloned into `my-local-name/` instead of `repository/`.

## Cloning into the Current Directory

```bash
git clone https://github.com/username/repository.git .
```

Clones into the current directory (must be empty).

## Shallow Clone: Faster for Large Repositories

For large repositories with deep history, you can clone only the most recent commits:

```bash
git clone --depth 1 https://github.com/username/large-repo.git
```

`--depth 1` downloads only the latest commit and its tree, not the full history. Useful for CI/CD pipelines or when you only need to build the code, not inspect its history.

<Callout type="warning">
Shallow clones can cause issues with commands that need history (`git log`, `git blame`, `git bisect`). Use `git fetch --unshallow` to restore the full history when needed.
</Callout>

## Cloning via SSH

```bash
git clone git@github.com:username/repository.git
```

Requires an SSH key configured in your GitHub account. Once set up, this method avoids password prompts for every push and fetch.

## After Cloning: What You Have

```bash
cd repository
git branch -a
```

```
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature-login
  remotes/origin/main
```

- `main` — your local branch, checked out
- `remotes/origin/main` — remote-tracking reference to `main` on the remote
- `remotes/origin/feature-login` — remote-tracking reference to another remote branch

To work on a remote branch that isn't checked out locally:

```bash
git switch feature-login
# Git automatically creates a local branch tracking origin/feature-login
```

## Distinguishing Clone from Fetching Updates

`git clone` is a one-time setup operation. After that, you use `git fetch` or `git pull` to get new commits from the remote — you don't clone again.

```bash
# First time: get the repository
git clone https://github.com/username/repo.git

# Every subsequent time: get updates
git pull origin main
```

<Callout type="tip">
Check the repository URL and default branch before cloning a large project. GitHub shows both prominently on the repository page. The green "Code" button reveals the HTTPS and SSH clone URLs.
</Callout>

## Exercise

```bash
# Clone a public repository to experiment with
git clone https://github.com/github/gitignore.git

# Navigate in
cd gitignore

# Check what was set up
git remote -v            # origin auto-configured
git branch -a            # local main + remote-tracking refs
git log --oneline -5     # recent history
```

## Summary

`git clone <url>` creates a local copy of a remote repository — full history included — and auto-configures `origin` as the remote. It checks out the default branch and creates remote-tracking branches for all remote branches. Use `--depth 1` for large repositories when you only need the newest snapshot. After cloning, use `git pull` to get future updates.

## Related

- [Pushing Changes with `git push`](/lessons/git_03_remotes_04_git_push_command)
- [Managing Remotes with `git remote`](/lessons/git_03_remotes_02_git_remote_command)
- [Remote-Tracking Branches](/lessons/git_03_remotes_05_remote_tracking_branches)
