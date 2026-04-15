---
type: lesson
title: "Installing Git and Configuring Your Identity"
description: "Install Git on your machine, verify the installation, and configure the name and email that will appear on every commit you ever make."
duration_minutes: 14
difficulty: Beginner
tags: [git, setup, configuration, git-config, install]
---

> Your first two Git commands will never be `git add` or `git commit` — they'll be installing Git and setting your identity. Every commit you make is signed with your name and email. Set it up correctly once.

## Why This Matters

Every Git commit permanently records who created it. That metadata is used by teammates to see who made a change, by code review tools to attribute work, and by blame/log tools to trace history. Setting a wrong or missing identity creates commits that are hard to attribute and unprofessional in team settings.

This lesson is short and entirely hands-on. By the end, you'll have Git installed and configured and be ready to make your first commit.

## Installing Git

### macOS

The easiest way is via the official installer:

1. Download from [git-scm.com/download/mac](https://git-scm.com/download/mac)
2. Run the `.pkg` installer and follow the prompts

Alternatively, if you have Homebrew:

```bash
brew install git
```

### Windows

1. Download from [git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer — the defaults are fine for most users
3. When prompted about the default branch name, select **main**
4. When prompted about line endings, use **Checkout Windows-style, commit Unix-style**

The installer includes **Git Bash**, a terminal emulator that provides a Unix-like shell on Windows. Use this for all Git commands.

### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install git
```

### Linux (Fedora / RHEL)

```bash
sudo dnf install git
```

## Verify the Installation

Once installed, open a terminal (or Git Bash on Windows) and run:

```bash
git --version
```

Expected output:

```
git version 2.44.0
```

Any version 2.x is current and fully capable. If you see an error, the installation did not complete successfully.

## Configuring Your Identity

Before you make your first commit, configure your name and email. Git attaches these to every commit permanently.

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Use your real name (or the name you use professionally) and the email address associated with your GitHub account.

The `--global` flag writes this to `~/.gitconfig` — a file in your home directory that applies to all repositories on this machine.

### Verify Your Configuration

```bash
git config --list
```

Look for these two lines in the output:

```
user.name=Your Name
user.email=your.email@example.com
```

You can also check individual values:

```bash
git config user.name
git config user.email
```

## Setting the Default Branch Name

Modern Git repositories use `main` as the default branch name (rather than the older `master`). Configure this globally:

```bash
git config --global init.defaultBranch main
```

This ensures every new repository you create starts with a branch named `main`.

<Callout type="tip">
If you already have a GitHub account, use the same email address you registered with. GitHub uses the email to associate your commits with your account profile.
</Callout>

## Where Configuration Is Stored

Git has three scopes of configuration, each stored in a different file:

| Scope | File | Coverage |
| :--- | :--- | :--- |
| **System** | `/etc/gitconfig` | All users on this machine |
| **Global** | `~/.gitconfig` | All repositories for your user |
| **Local** | `.git/config` | One specific repository |

Local overrides global; global overrides system. You can set different identities per repository (useful if you have work and personal GitHub accounts on the same machine):

```bash
# Inside a specific work repository:
git config user.email "you@company.com"
```

<Callout type="tip">
If you use both a personal GitHub and a work GitHub account on the same machine, use global config for one identity and per-repo local config for the other.
</Callout>

## Your First Repository (Preview)

The next unit covers repository initialization in full detail, but running these commands now is the fastest way to confirm your Git installation is working end to end.

1. Create and enter a new directory:

```bash
mkdir my-first-repo && cd my-first-repo
```

2. Initialize a repository:

```bash
git init
```

Expected output:

```
Initialized empty Git repository in .../my-first-repo/.git/
```

3. Check the repository status:

```bash
git status
```

Expected output:

```
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

<Callout type="tip">
"On branch main" confirms the default branch name was applied correctly — a direct result of setting `init.defaultBranch main` in the earlier configuration step. If you see "On branch master" instead, re-run `git config --global init.defaultBranch main` and initialize a fresh test directory.
</Callout>

## Your Setup Checklist

Before continuing to the next unit, confirm all of the following:

- [ ] `git --version` outputs a version number without error
- [ ] `git config user.name` returns your name
- [ ] `git config user.email` returns your email
- [ ] `git config init.defaultBranch` returns `main`

## Summary

Installing Git and configuring your identity is a one-time setup. Use `git config --global` to set your name, email, and default branch name. These values are written to `~/.gitconfig` and apply to every repository you work in.

## Related

- [Initializing Your First Repository](/lessons/git_01_init_commit_01_init_repository)
- [The Three Working Areas](/lessons/git_00_intro_03_three_working_areas)
