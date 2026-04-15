---
type: lesson
title: "Staging Changes with `git add`"
description: "Master `git add` in all its forms — stage individual files, directories, all changes, and even individual hunks within a file to build precise, logical commits."
duration_minutes: 13
difficulty: Beginner
tags: [git, git-add, staging, index, workflow]
---

> `git add` doesn't record a commit — it builds one. Every `git add` call is you making an intentional choice about what your next commit will contain.

## Why This Matters

`git add` is the command that sits between your edits and your commits. It's the tool you use to select, filter, and organize changes before permanently recording them. Using it well is the difference between a clean commit history and a chaotic one.

## The Basic Forms

### Stage a Single File

```bash
git add README.md
```

Copies the current content of `README.md` from the working directory into the staging area.

### Stage Multiple Specific Files

```bash
git add auth.js payments.js
```

Stages both files in one command.

### Stage All Changes in a Directory

```bash
git add src/
```

Stages all modified and new files inside the `src/` directory recursively.

### Stage Everything in the Repository

```bash
git add .
```

Stages all changes (modified + new untracked files) in the current directory and all subdirectories.

<Callout type="warning">
`git add .` is convenient but blunt — it stages everything. Use it carefully, especially in projects without a solid `.gitignore`. Run `git status` first to confirm you know what's about to be staged.
</Callout>

Practice staging in the sandbox below — three files are ready to stage. Try staging them individually, then run `git status` to confirm:

<TerminalSandbox
  stateUrl="/sandbox/git_01_init_commit_04.json"
  height="22rem"
/>

## What `git add` Actually Does

`git add` does not simply mark files as "to be committed." It:

1. Reads the file's current content from the working directory
2. Computes its SHA-1 hash
3. Writes a blob object to `.git/objects/`
4. Updates the staging index (`.git/index`) to point to that blob

This means the staging area captures the file as it was **at the moment you ran `git add`**. If you edit the file again afterwards, that second edit is NOT automatically staged — it stays in the working directory only.

### Demonstrating Snapshot Behavior

```bash
echo "version 1" > notes.txt
git add notes.txt         # stages "version 1"

echo "version 2" > notes.txt
# notes.txt in working dir now says "version 2"
# notes.txt in staging area still says "version 1"

git status
```

```
Changes to be committed:
        modified:   notes.txt   ← "version 1" will be committed

Changes not staged for commit:
        modified:   notes.txt   ← "version 2" is in working dir only
```

Running `git commit` now would commit "version 1". To commit "version 2", run `git add notes.txt` again.

## Interactive (Patch) Staging

`git add -p` is one of the most powerful staging workflows. It lets you stage individual **hunks** — sections of a file's changes — rather than the whole file.

```bash
git add -p auth.js
```

Git shows each changed section and prompts you:

```
@@ -12,8 +12,12 @@ function login(user, password) {
   if (!user || !password) {
-    return false;
+    throw new Error('Missing credentials');
   }
Stage this hunk [y,n,q,a,d,s,e,?]?
```

**Common responses:**

| Key | Action |
| :-- | :--- |
| `y` | Stage this hunk |
| `n` | Skip this hunk (don't stage) |
| `s` | Split into smaller hunks |
| `e` | Open hunk in editor for manual edit |
| `q` | Quit — stop reviewing |
| `?` | Show all options |

This is invaluable when a single file contains two unrelated changes you want in separate commits.

## Staging New (Untracked) Files

`git add` also starts tracking a file that Git has never seen before:

```bash
touch newfeature.js
git add newfeature.js
git status
```

```
Changes to be committed:
        new file:   newfeature.js
```

Without `git add`, untracked files are never included in commits, no matter how many times you commit.

## Verifying What's Staged

After staging, always verify:

```bash
git status          # summary view
git diff --staged   # see exact changes staged
```

`git diff --staged` shows the line-by-line diff of what is in the staging area compared to the last commit — exactly what `git commit` will record.

<Callout type="tip">
Build this habit: `git add [files]` → `git diff --staged` (review what you're about to commit) → `git commit`. The extra review step catches staging mistakes before they become permanent.
</Callout>

## Exercise

Try this in your test repository:

```bash
# Create two files with different purposes
echo "const DB_HOST = 'localhost';" > config.js
echo "function getUser(id) { return db.find(id); }" > user.js

# Stage only the config
git add config.js

# Check what's staged and what isn't
git status
git diff --staged

# Commit just the config
git commit -m "Add database configuration"

# Now stage and commit the other
git add user.js
git commit -m "Add user lookup function"

# Review your clean history
git log --oneline
```

## Summary

`git add` stages changes from the working directory into the staging area. Use specific filenames for precision, `.` for everything, or `-p` for hunk-by-hunk control. The staging area captures a snapshot at the moment of `git add` — later edits stay unstaged until you run `git add` again.

## Related

- [Viewing Staged vs. Unstaged Changes with `git diff`](/lessons/git_01_init_commit_05_git_diff_command)
- [Creating Your First Commit](/lessons/git_01_init_commit_06_first_commit)
- [Understanding the Staging Area and Why It Exists](/lessons/git_01_init_commit_02_understanding_staging_area)
