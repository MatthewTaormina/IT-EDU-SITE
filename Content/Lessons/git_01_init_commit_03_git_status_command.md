---
type: lesson
title: "Checking Repository Status with `git status`"
description: "Learn to read `git status` output and instantly know which files are modified, staged, or untracked — the most important habit in a Git workflow."
duration_minutes: 11
difficulty: Beginner
tags: [git, git-status, workflow, working-directory, staging-area]
---

> If you only learn one Git habit, make it running `git status` before every other command. It always tells you exactly where you are and what to do next.

## Why This Matters

`git status` is the orientation tool of Git. Before you stage, commit, switch branches, or push — run `git status`. It shows everything happening across all three working areas and suggests the commands to fix any situation.

Understanding its output removes every "what just happened?" moment.

## Basic Usage

```bash
git status
```

That's it. No flags required for daily use. Let's walk through the output in different states.

## Reading the Output: State by State

### Clean Working Tree

Nothing to do:

```
On branch main
nothing to commit, working tree clean
```

- You're on the `main` branch
- The working directory matches the last commit
- Nothing is staged

### Untracked Files

You created `index.html` but haven't staged it yet:

```
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        index.html
```

- `index.html` exists in the working directory
- Git has never seen it — it's not in any commit or the staging area

### Modified but Unstaged

You edited `styles.css` after the last commit:

```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   styles.css
```

- `styles.css` differs from the last commit
- The changes are in the working directory but NOT in the staging area
- These changes will NOT be included in the next commit without `git add`

### Staged for Commit

You've run `git add styles.css`:

```
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   styles.css
```

- `styles.css` is in the staging area
- Running `git commit` now will include this change

### Mixed State (Most Common in Practice)

A file can appear in both sections simultaneously when you edit it, stage it, then edit it again:

```
On branch main
Changes to be committed:
        modified:   auth.js    ← first edit is staged

Changes not staged for commit:
        modified:   auth.js    ← second edit is NOT staged
```

Here, `auth.js` appears twice. The staging area holds the first version of your edits. The working directory has additional changes made after staging. Running `git commit` would commit the staged version — the second round of edits would remain unstaged.

### All States at Once

A realistic mid-session status:

```
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   payments.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   auth.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        scratch-notes.txt
```

Reading this:
- `payments.js` — new file, staged, will be in next commit
- `auth.js` — modified, not staged, will NOT be in next commit
- `scratch-notes.txt` — new file, not tracked, will NOT be in next commit

The sandbox below starts with a repo where `README.md` is committed, `index.js` is staged, and `notes.txt` is untracked. Run `git status` to see all three sections:

<TerminalSandbox
  stateUrl="/sandbox/git_01_init_commit_03.json"
  height="22rem"
/>

Edit a file (e.g., add a line to `index.js`), then run `git status` again to see the "Changes not staged" section appear.

## Short Status Output

For a more concise view:

```bash
git status -s
```

Output:

```
M  auth.js    ← staged modification (left column)  
 M config.js  ← unstaged modification (right column)
?? notes.txt  ← untracked
A  payments.js← new file staged
```

The two-column format shows: `XY filename` where X is the staged status and Y is the working directory status. This is useful when you have many files.

## Reading Ahead/Behind Information

When your local branch has a remote tracking branch, `git status` also shows sync state:

```
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
  (use "git push" to publish your local commits)
```

Or:

```
Your branch is behind 'origin/main' by 3 commits, and can be fast-forwarded.
  (use "git pull" to update your local branch)
```

<Callout type="tip">
Make `git status` a reflex. Run it when you sit down to work, before staging anything, before committing, and before switching branches. It takes less than a second and prevents every category of "I have no idea what just happened" mistake.
</Callout>

## Summary

`git status` reports the state of all three working areas at once, grouped into three sections: staged changes, unstaged changes, and untracked files. Only staged changes go into the next commit. The output always includes hints for what to do next.

## Related

- [Staging Changes with `git add`](/learn/git_foundations/git_01_init_commit_04_git_add_command)
- [Understanding the Staging Area and Why It Exists](/learn/git_foundations/git_01_init_commit_02_understanding_staging_area)
- [The Three Working Areas](/learn/git_foundations/git_00_intro_03_three_working_areas)
