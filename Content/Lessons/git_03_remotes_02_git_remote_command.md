---
type: lesson
title: "Managing Remotes with `git remote`"
description: "Add, list, rename, and remove remote connections using `git remote` to manage where your repository synchronizes."
duration_minutes: 10
difficulty: Beginner
tags: [git, remotes, git-remote, configuration, workflow]
---

> `git remote` is the command that manages your repository's list of remote connections — the named shortcuts to other repositories you push to and pull from.

## Why This Matters

Every `git push` and `git fetch` requires knowing which remote and which URL to communicate with. `git remote` lets you add new remotes, update URLs when repositories move, rename them for clarity, and remove stale connections.

## Listing Remotes

```bash
git remote
```

```
origin
```

```bash
git remote -v   # verbose — show URLs
```

```
origin  https://github.com/yourname/my-project.git (fetch)
origin  https://github.com/yourname/my-project.git (push)
```

## Adding a Remote

```bash
git remote add <name> <url>
```

Example:

```bash
git remote add origin https://github.com/yourname/my-project.git
```

After `git init` on a new local repo, you typically run this to connect it to a remote you created on GitHub.

You can add multiple remotes with different names:

```bash
git remote add upstream https://github.com/original-author/my-project.git
git remote add staging git@deploy.example.com:my-project.git
```

## Verifying a Remote Was Added

```bash
git remote -v
```

```
origin    https://github.com/yourname/my-project.git (fetch)
origin    https://github.com/yourname/my-project.git (push)
upstream  https://github.com/original-author/my-project.git (fetch)
upstream  https://github.com/original-author/my-project.git (push)
```

## Renaming a Remote

```bash
git remote rename origin github
```

Any command that previously used `origin` must now use `github`. Remote-tracking branch references (stored in `.git/refs/remotes/`) are automatically renamed.

## Removing a Remote

```bash
git remote remove upstream
```

Deletes the remote entry and all its remote-tracking branches from your local repository. The actual remote repository is unaffected.

## Updating a Remote URL

Repository URLs change frequently — when a project is renamed, moves organizations, or switches from HTTPS to SSH:

```bash
git remote set-url origin git@github.com:yourname/my-project.git
```

Verify the update:

```bash
git remote get-url origin
# git@github.com:yourname/my-project.git
```

## Inspecting a Remote in Detail

```bash
git remote show origin
```

```
* remote origin
  Fetch URL: https://github.com/yourname/my-project.git
  Push  URL: https://github.com/yourname/my-project.git
  HEAD branch: main
  Remote branches:
    feature-login  tracked
    main           tracked
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (up to date)
```

This shows the remote's default branch, all tracked remote branches, and the configured pull/push relationships.

## HTTPS vs. SSH URLs

Git supports two URL protocols for GitHub:

| Protocol | Example URL | Auth method |
| :------- | :---------- | :---------- |
| HTTPS | `https://github.com/user/repo.git` | Username + token (prompted) |
| SSH | `git@github.com:user/repo.git` | SSH key pair (silent if configured) |

SSH is preferred for daily development — no password prompts once your key is set up. Use `git remote set-url` to switch between protocols.

<Callout type="tip">
If you're having push authentication errors, check the protocol first:
```bash
git remote get-url origin
```
If it shows HTTPS and you haven't configured a credential manager or token, switch to SSH or add a personal access token.
</Callout>

## Quick Reference

```bash
git remote                          # list remote names
git remote -v                       # list with URLs
git remote add <name> <url>         # add a remote
git remote rename <old> <new>       # rename a remote
git remote remove <name>            # remove a remote
git remote set-url <name> <url>     # update a URL
git remote get-url <name>           # show a URL
git remote show <name>              # full details
```

## Summary

`git remote` manages the named URL shortcuts your repository uses to communicate with other repositories. Use `git remote add` to connect to a new remote, `git remote set-url` when a URL changes, and `git remote rename`/`remove` to clean up stale connections. Use `git remote show <name>` for a detailed view including branch tracking relationships.

## Related

- [What Is a Remote Repository?](/learn/git_foundations/git_03_remotes_01_remote_concept)
- [Cloning a Repository](/learn/git_foundations/git_03_remotes_03_git_clone_command)
- [Pushing Changes with `git push`](/learn/git_foundations/git_03_remotes_04_git_push_command)
