---
type: lesson
title: "Identifying All Conflicts in a Merge"
description: "Use `git status`, `git diff`, and grep to find every conflicted file in a merge, so nothing gets missed before you commit the resolution."
duration_minutes: 9
difficulty: Intermediate
tags: [git, conflicts, git-status, git-diff, identification]
---

> When a merge conflict occurs, there may be one conflicted file or a dozen. Your first step is always a complete inventory — you can't resolve what you haven't found.

## Why This Matters

Developers sometimes resolve the first conflict they see, commit, and later discover other conflicted files slipped through. Git won't let you commit unresolved conflicts, but only if you know to check. Building a systematic identification habit prevents incomplete resolutions.

## Step 1: `git status` — Your First Look

The moment a conflict occurs, run:

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
        both modified:   styles.css

Changes to be committed:
        modified:   footer.html
        new file:   checkout.js
```

**Reading this output:**

- **`Unmerged paths`** section — these files have conflicts that need manual resolution
- **`Changes to be committed`** section — these were merged cleanly and are already staged; don't touch them
- Each line under `Unmerged paths` is one conflicted file

This is your working list. Resolve every file listed here.

## The "Both Modified" Label

```
both modified:   login.js
```

"Both modified" = the standard content conflict. Both branches changed this file in overlapping locations.

Other unmerged labels you may see:

| Label | Meaning |
| :---- | :------ |
| `both modified` | Same section changed on both sides |
| `deleted by us` | Your branch deleted it; incoming branch modified it |
| `deleted by them` | Incoming branch deleted it; your branch modified it |
| `added by both` | Both branches created a file with the same name |

Each label requires a different resolution decision.

## Step 2: `git diff` — See All Conflict Blocks

```bash
git diff
```

With an ongoing merge conflict, `git diff` shows the conflict markers in every unresolved file in one continuous output. Scroll through to see all conflict blocks before deciding where to start.

```diff
++<<<<<<< HEAD
 +throw new Error('Missing credentials');
++=======
+ return null;
++>>>>>>> feature-login
```

Note the double `+` prefix on conflict marker lines — this is `git diff`'s way of showing the markers themselves.

## Step 3: Search for Remaining Markers

After resolving some conflicts, confirm no markers remain:

```bash
grep -rn "<<<<<<" .
```

If this prints nothing, no conflict markers remain in tracked files. This is your final safety check before committing.

You can also search for all three marker types:

```bash
grep -rn -e "<<<<<<" -e "=======" -e ">>>>>>" -- "*.js" "*.css" "*.html"
```

<Callout type="tip">
Add this grep check to your resolution workflow as the last step before `git add`. You'll catch forgotten conflict blocks that are easy to miss in large files.
</Callout>

## Step 4: Check That Resolution Is Complete

After editing all conflicted files:

```bash
git status
```

```
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
        modified:   login.js
        modified:   styles.css
        modified:   footer.html
        new file:   checkout.js
```

"All conflicts fixed but you are still merging" = your conflicts are resolved and staged, but the merge commit hasn't been created yet. Run `git commit` to finish.

If any files still appear under `Unmerged paths`, they're still conflicted.

## Using an IDE or Merge Tool

Most editors detect conflict markers and provide a visual three-panel merge view. VS Code, for example, shows colored regions for "Current Change" (HEAD) and "Incoming Change" with buttons to accept one side or both.

To launch Git's configured merge tool:

```bash
git mergetool
```

This opens the configured tool (VS Code, vimdiff, IntelliJ, etc.) for each conflicted file in sequence.

Configure your merge tool:

```bash
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

## Summary

Use `git status` immediately after a conflict to list all conflicted files under `Unmerged paths`. Use `git diff` to see all conflict blocks in sequence. After resolving, grep for remaining `<<<<<<<` markers as a final check. Then `git status` again — when `Unmerged paths` is empty and all files are under `Changes to be committed`, you're ready to commit the merge.

## Related

- [Manual Conflict Resolution](/learn/git_foundations/git_04_conflicts_04_manual_conflict_resolution)
- [Reading Conflict Markers](/learn/git_foundations/git_04_conflicts_02_conflict_markers)
- [Completing the Merge](/learn/git_foundations/git_04_conflicts_05_completing_merge)
