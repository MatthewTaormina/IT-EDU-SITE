---
type: lesson
title: "Initializing Your First Repository"
description: "Run `git init` to turn any folder into a Git repository, understand what the .git directory contains, and verify your repository is ready to track changes."
duration_minutes: 12
difficulty: Beginner
tags: [git, git-init, repository, setup]
---

> Every Git repository starts with a single command: `git init`. It takes an ordinary folder and transforms it into a version-controlled project by creating the hidden `.git` directory that stores your entire history.

## Why This Matters

Until you initialize a repository, Git knows nothing about your project. After `git init`, every subsequent Git command — `git add`, `git commit`, `git log` — has a place to read from and write to.

This lesson is hands-on. Follow along in your terminal.

## Creating and Initializing a Repository

Start by creating a new project folder and initializing it:

```bash
mkdir my-first-repo
cd my-first-repo
git init
```

Expected output:

```
Initialized empty Git repository in /Users/alice/my-first-repo/.git/
```

Your folder is now a Git repository. Nothing is tracked yet — you have an empty object database and a single default branch (`main`, if configured).

Try it yourself in the sandbox below — the directory already exists, ready to initialize:

<TerminalSandbox
  stateUrl="/sandbox/git_01_init_commit_01.json"
  height="20rem"
/>

### Initializing an Existing Project

You can also initialize a repository in an existing folder that already has files:

```bash
cd existing-project
git init
```

The files aren't tracked yet. You'll need to run `git add` and `git commit` to create an initial snapshot.

## What `git init` Creates: The `.git` Directory

`git init` creates a hidden `.git` folder inside your project. This folder IS your repository — deleting it would erase all history. The rest of your project files are just the current working copy.

```
my-first-repo/
├── .git/              ← the repository
│   ├── config         ← repository-level Git configuration
│   ├── HEAD           ← pointer to the current branch
│   ├── objects/       ← object database (blobs, trees, commits)
│   └── refs/
│       ├── heads/     ← local branch pointers
│       └── tags/      ← tag pointers
└── (your project files)
```

You rarely need to touch anything in `.git` directly. Git commands manage it for you.

<Callout type="warning">
Never manually edit files inside `.git/`. Manual edits can corrupt your repository. Use Git commands instead.
</Callout>

## Checking the Repository State

After initializing, run `git status` to see the current state:

```bash
git status
```

Output on a brand-new, empty repository:

```
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

This tells you:
- You're on the `main` branch
- No commits have been made yet
- There's nothing to commit

Now create a file:

```bash
echo "# My Project" > README.md
git status
```

New output:

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md

nothing added to commit but untracked files present (use "git add" to track)
```

Git sees the new file. It's **untracked** — in the working directory, not yet in the staging area or repository.

<Callout type="tip">
Run `git status` constantly. It's the safest habit in Git — it always tells you exactly what state you're in and suggests the next command to run.
</Callout>

## Try It: Your First Repository

Follow these steps to create and verify your first repository:

```bash
# 1. Create a project
mkdir portfolio-site
cd portfolio-site

# 2. Initialize
git init

# 3. Create a starter file
echo "# Portfolio Site" > README.md
echo "" >> README.md
echo "My personal portfolio." >> README.md

# 4. Check status
git status

# 5. Confirm .git was created
ls -la   # On macOS/Linux
# or:
dir /a   # On Windows
```

You should see `.git/` in the listing. Your repository is initialized and ready.

## Summary

- `git init` creates a `.git/` folder, turning any directory into a Git repository
- The `.git/` folder IS the repository — don't delete or modify it manually
- After initialization, files are **untracked** until you `git add` them
- `git status` tells you the current state at any moment

## Related

- [Understanding the Staging Area and Why It Exists](/lessons/git_01_init_commit_02_understanding_staging_area)
- [Checking Repository Status with `git status`](/lessons/git_01_init_commit_03_git_status_command)
- [The Three Working Areas](/lessons/git_00_intro_03_three_working_areas)
