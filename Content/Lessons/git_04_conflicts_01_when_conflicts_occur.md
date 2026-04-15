---
type: lesson
title: "When Merge Conflicts Occur"
description: "Understand the exact conditions that trigger a merge conflict, why Git cannot automatically resolve them, and what happens to your repository state during one."
duration_minutes: 10
difficulty: Intermediate
tags: [git, conflicts, merge, three-way-merge, workflow]
---

> A conflict is not an error. It is Git saying: "Two people edited the same lines, and I need a human to decide which version is correct." It's a normal part of team development.

## Why This Matters

Developers new to Git are often alarmed when a merge conflict appears. Understanding the mechanics — what triggered it, what state the repository is in, and what's expected of you — transforms conflicts from a crisis into a routine, manageable task.

## The Condition That Causes a Conflict

A merge conflict occurs when:

1. Two branches both **modified the same lines** in the same file
2. Git cannot determine which version (or combination) is correct

That's it. If two branches change **different parts** of a file, or different files entirely, Git merges automatically with no conflict.

### Conflict: same lines modified differently

```
Branch A modified line 7 of login.js: `return false;` → `throw new Error(...)`
Branch B modified line 7 of login.js: `return false;` → `return null;`
```

Git has two different new versions of line 7. It cannot choose — it marks the file as conflicted.

### No conflict: different lines modified

```
Branch A modified lines 5–8 of login.js
Branch B modified lines 20–24 of login.js
```

Git applies both changes cleanly. No conflict.

## What Triggers the Conflict During a Merge

When you run `git merge` and a conflict occurs:

```bash
git merge feature-login
```

```
Auto-merging login.js
CONFLICT (content): Merge conflict in login.js
Automatic merge failed; fix conflicts and then commit the result.
```

Git has:
1. Merged all non-conflicting changes successfully
2. Left the conflicting file(s) in a **partially merged state** with conflict markers
3. **Paused** — the merge is in progress but not complete

## Repository State During a Conflict

The merge is in a suspended state. Run `git status` to see exactly what's happening:

```bash
git status
```

```
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   login.js

Changes to be committed:
        modified:   footer.html
```

This output shows:
- The merge is in progress (`You have unmerged paths`)
- `login.js` has a conflict — it's unresolved (listed under `Unmerged paths`)
- `footer.html` was merged successfully and is staged (listed under `Changes to be committed`)

**While you're in this state, you cannot commit, switch branches, or pull. You must either resolve the conflict or abort the merge.**

## Types of Conflicts

| Type | Description |
| :--- | :---------- |
| **Content conflict** | Both branches modified the same lines differently |
| **Delete/modify conflict** | One branch deleted a file, the other modified it |
| **Rename conflict** | Both branches renamed the same file to different names |
| **Add/add conflict** | Both branches created a new file with the same name but different content |

The most common by far is the content conflict.

## What Doesn't Cause a Conflict

These situations are NOT conflicts:
- Branches editing different files
- Branches editing different lines of the same file
- One branch adding a file that doesn't exist on the other branch
- A fast-forward merge (no divergence exists)

<Callout type="tip">
The best way to minimize conflicts is to keep feature branches short-lived and pull from `main` frequently. The more your branch diverges over time, the more likely the same lines will be edited in parallel.
</Callout>

## Summary

A merge conflict occurs when two branches modified the same lines in the same file, and Git cannot automatically decide which version to keep. During a conflict, the repository is in a suspended merge state — unresolved files are marked as "both modified" in `git status`. You must resolve the conflict and commit, or abort the merge. Conflicts are normal, not errors.

## Related

- [Understanding Conflict Markers](/learn/git_foundations/git_04_conflicts_02_conflict_markers)
- [Three-Way Merges](/learn/git_foundations/git_02_branching_07_three_way_merge)
- [Aborting a Merge](/learn/git_foundations/git_04_conflicts_07_aborting_merge)
