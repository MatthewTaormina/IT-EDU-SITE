---
type: lesson
title: "Completing the Merge After Resolving Conflicts"
description: "Finish a conflict resolution by staging resolved files and running `git commit` to create the merge commit that closes the merge operation."
duration_minutes: 8
difficulty: Intermediate
tags: [git, conflicts, merge-commit, git-add, git-commit]
---

> Resolving the conflict edits the file. Completing the merge is the two-step sequence that records those edits permanently: `git add` each resolved file, then `git commit`.

## Why This Matters

Conflict resolution happens in two distinct phases. Many beginners get tripped up because editing the file doesn't complete the merge — you also have to stage and commit. These steps have specific meaning in Git's state machine.

## Where You Are After Resolving

After editing and saving all conflicted files, your repository is still in "merging" state:

```bash
git status
```

```
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
        modified:   auth.js
        modified:   styles.css
        modified:   footer.html
```

"All conflicts fixed but you are still merging" means:
- All files are staged and clean (no unresolved markers)
- The merge commit hasn't been created yet

## Step 1: Stage Each Resolved File

```bash
git add auth.js
git add styles.css
```

Or if you've verified all files are clean:

```bash
git add .
```

Staging is your explicit confirmation to Git: "This file is resolved and ready to be committed."

**Do not run `git add` on a file that still contains conflict markers.** Git will accept it — but your code will be broken. Always verify before staging.

## Verifying No Markers Remain

Before staging, do a final check:

```bash
grep -rn "<<<<<<" .
```

If this prints nothing, no markers remain anywhere in the repository. Safe to stage.

## Step 2: Commit the Merge

```bash
git commit
```

Git opens your default editor pre-populated with the merge commit message:

```
Merge branch 'feature-login'

# Conflicts:
#       auth.js
#       styles.css
#
# It looks like you may be committing a merge.
# If this is not correct, please run
#       git update-ref -d MERGE_HEAD
# and try again.
```

The conflict files are listed in comments for reference. The commit message defaults to `Merge branch 'feature-login'`.

You can add notes about how conflicts were resolved, or keep the default:

```
Merge branch 'feature-login'

Resolved auth.js conflict: kept throw-on-error approach from main
instead of null return from feature branch, per code review discussion.
```

Save and close the editor. The merge commit is created.

## The Result

```bash
git log --oneline --graph
```

```
*   a3b4c5d (HEAD -> main) Merge branch 'feature-login'
|\
| * e3f4a5b (feature-login) Add auth logic
| * d2c3b4a Add login form
* | f1e2d3c Update footer
|/
* c9b8a7a Initial project setup
```

The merge commit `a3b4c5d` has two parents — the tip of `main` before the merge (`f1e2d3c`) and the tip of `feature-login` (`e3f4a5b`).

## Non-Interactive Commit (Skip the Editor)

If you're satisfied with the default message:

```bash
git commit --no-edit
```

Uses the pre-generated merge commit message without opening an editor. Common in automated scripts and CI/CD workflows.

## What `.git/MERGE_HEAD` Is

During an ongoing merge, Git creates `.git/MERGE_HEAD` containing the hash of the branch being merged in. Once you run `git commit`, this file is deleted — Git knows the merge is complete.

If Git is confused about whether a merge is in progress, check:

```bash
cat .git/MERGE_HEAD
# If this file exists, you're mid-merge
```

<ProgressCheck>
Trigger a conflict in a test repository, resolve it manually, stage the file, and run `git commit`. Confirm the merge commit shows two parents in `git log --oneline --graph`.
</ProgressCheck>

## Summary

After resolving all conflicts, complete the merge with: `git add <resolved-files>` → verify with grep → `git commit`. Git opens an editor pre-filled with the merge commit message. Use `--no-edit` to accept the default message without opening the editor. The resulting merge commit has two parents. The `.git/MERGE_HEAD` file disappears when the merge is complete.

## Related

- [Manual Conflict Resolution](/learn/git_foundations/git_04_conflicts_04_manual_conflict_resolution)
- [Identifying All Conflicts](/learn/git_foundations/git_04_conflicts_03_identifying_conflicts)
- [Aborting a Merge](/learn/git_foundations/git_04_conflicts_07_aborting_merge)
