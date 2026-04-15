---
type: lesson
title: "Comparing Changes with `git diff`"
description: "Use `git diff` to inspect exactly what changed in your working directory and staging area before committing — line by line."
duration_minutes: 14
difficulty: Beginner
tags: [git, git-diff, diff, staging, review]
---

> Before committing, always know what you're committing. `git diff` is the tool that shows you the exact lines you've added, modified, or removed.

## Why This Matters

Committing without reviewing is like sending an email without proofreading. `git diff` gives you a line-by-line preview of your changes before they're saved. It prevents accidental commits of debug code, half-finished work, or files you didn't intend to include.

## Three Comparison Contexts

Git has three areas — working directory, staging area, and the committed history. `git diff` compares across different pairs of these areas:

| Command | What It Compares |
| :------ | :--------------- |
| `git diff` | Working directory vs. staging area |
| `git diff --staged` | Staging area vs. last commit |
| `git diff HEAD` | Working directory vs. last commit (everything) |
| `git diff <commit1> <commit2>` | Two specific commits |

## Reading Diff Output

When you run `git diff`, you see output like this:

```diff
diff --git a/index.html b/index.html
index 4b825dc..e7d963f 100644
--- a/index.html
+++ b/index.html
@@ -8,7 +8,9 @@ <body>
   <h1>Welcome</h1>
-  <p>Old content here</p>
+  <p>Updated content here</p>
+  <p>New paragraph added.</p>
 </body>
```

**Reading the diff line by line:**

- `--- a/index.html` — the original version (last commit or staging)
- `+++ b/index.html` — the modified version (working directory)
- `@@ -8,7 +8,9 @@` — the "hunk header": original started at line 8 for 7 lines; new version starts at line 8 for 9 lines
- Lines starting with `-` — removed from original
- Lines starting with `+` — added in new version
- Lines with no prefix — unchanged context lines

## Workflow: Check Before You Stage

```bash
# You've edited login.js
git diff login.js
```

This shows changes in your working directory that are NOT yet staged. If the diff looks right, stage it:

```bash
git add login.js
```

## Workflow: Check Before You Commit

```bash
# After staging, verify what will actually be committed
git diff --staged
```

This shows what's in the staging area compared to the last commit — exactly what `git commit` will record.

<Callout type="tip">
Use `git diff` before staging, `git diff --staged` after staging. Together they give you full visibility over both decisions: what to include and what will be committed.
</Callout>

## Comparing Specific Files

```bash
git diff styles.css           # unstaged changes in styles.css only
git diff --staged styles.css  # staged changes in styles.css only
```

## Comparing Commits

```bash
git diff main feature-branch     # diff between two branches
git diff abc123 def456           # diff between two commit hashes
git diff HEAD~1 HEAD             # diff between last commit and the one before it
```

`HEAD~1` means "one commit before HEAD." `HEAD~3` means three commits before.

## Seeing What Changed by File (Stat View)

If you don't want line-by-line output — just a summary of which files changed and how much:

```bash
git diff --stat
```

```
 auth.js   | 12 ++++++------
 styles.css |  5 ++---
 2 files changed, 10 insertions(+), 7 deletions(-)
```

This is helpful when reviewing a large branch diff to get a quick overview before diving into details.

## Diff in Color

Git diff uses colors by default in most terminals:
- **Red** — removed lines
- **Green** — added lines
- **White/neutral** — context lines

If you're not seeing color, run `git config --global color.ui auto`.

<Callout type="warning">
`git diff` with no arguments only shows **unstaged** changes. If you've already staged everything with `git add`, `git diff` appears blank. Use `git diff --staged` to see what's staged.
</Callout>

## Exercise

```bash
# Start in a repository with at least one commit
echo "<h1>Hello World</h1>" > index.html
git add index.html
git commit -m "Initial HTML file"

# Make changes
echo "<p>New paragraph</p>" >> index.html

# Review unstaged changes
git diff index.html

# Stage the change
git add index.html

# Confirm diff is now empty (nothing unstaged)
git diff

# Review staged change
git diff --staged
```

## Summary

Use `git diff` to see unstaged changes (working directory vs. staging area) and `git diff --staged` to see staged changes (staging area vs. last commit). Read diffs line by line: `-` lines are removed, `+` lines are added. Use `--stat` for a high-level file summary without line detail.

## Related

- [Creating Your First Commit](/lessons/git_01_init_commit_06_first_commit)
- [Staging Changes with `git add`](/lessons/git_01_init_commit_04_git_add_command)
- [Inspecting History with `git log`](/lessons/git_01_init_commit_07_git_log_command)
