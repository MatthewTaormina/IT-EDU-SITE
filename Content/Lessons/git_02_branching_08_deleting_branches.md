---
type: lesson
title: "Deleting Branches"
description: "Safely delete merged local and remote branches to keep your repository clean, and understand when deletion is safe versus dangerous."
duration_minutes: 8
difficulty: Beginner
tags: [git, branches, git-branch, cleanup, remote]
---

> A branch is just a pointer. Once it's merged, deleting it removes the label — not the commits. Keeping merged branches around only creates clutter.

## Why This Matters

Left unmanaged, branch lists grow into hundreds of stale entries. Deleting merged branches is routine hygiene. Knowing when deletion is safe — and what the `-D` force option actually does — prevents accidental data loss.

## Deleting a Merged Local Branch

```bash
git branch -d feature-login
```

```
Deleted branch feature-login (was e3f4a5b).
```

Git confirms what commit the branch was pointing to before deletion. The commits themselves remain in the graph — accessible from any branch that can reach them (like `main`).

The `-d` flag is safe: it refuses to delete branches that have **not** been merged into the current branch:

```bash
git branch -d unfinished-idea
```

```
error: The branch 'unfinished-idea' is not fully merged.
If you are sure you want to delete it, run 'git branch -D unfinished-idea'.
```

## Force-Deleting an Unmerged Branch

```bash
git branch -D unfinished-idea
```

`-D` is uppercase and bypasses the merge check. Use it when you intentionally want to abandon work on a branch.

<Callout type="warning">
`git branch -D` deletes the pointer. If no other branch, tag, or stash references the commits at the tip, those commits will be unreachable — eventually garbage-collected by Git. They are recoverable for 30–90 days using `git reflog`, but treat `-D` as permanent deletion.
</Callout>

## When Is It Safe to Delete?

| Scenario | Safe? | Command |
| :------- | :---- | :------ |
| Branch is merged into current branch | ✓ Yes | `git branch -d` |
| Branch is merged into a different branch | Partial — Git checks current branch only | Verify first, then `git branch -d` |
| Branch has unmerged commits you want to keep | ✗ No | Don't delete yet |
| Branch has unmerged commits you want to abandon | Intentional | `git branch -D` |

To confirm a specific branch is merged into `main` regardless of which branch you're currently on:

```bash
git branch --merged main | grep feature-login
```

See the section above for listing all merged or unmerged branches at once.

## Checking Merge Status Before Deleting

Before deleting branches, confirm which ones have actually been merged. Running `git branch -d` will refuse to delete an unmerged branch, but it's better to know in advance.

### List All Merged Branches

```bash
git branch --merged
```

```
  bugfix/nav
* main
```

These branches have work that is fully reachable from the current branch — their entire history has been incorporated into `main` (or whatever branch you're currently on). They are safe to delete.

### List All Unmerged Branches

```bash
git branch --no-merged
```

```
  feature-login
  release/v1.2
```

These branches contain commits that are NOT yet in the current branch. Deleting them discards those commits. Do not delete these branches unless you intentionally want to abandon that work.

<Callout type="tip">
Run `git branch --merged` and `git branch --no-merged` as part of your regular branch cleanup routine. They give you an instant read on what's safe to delete versus what's still in flight.
</Callout>

## Deleting a Remote Branch

```bash
git push origin --delete feature-login
```

This removes the branch from the remote repository (e.g., GitHub). Your local copy of the branch is unaffected — delete it separately if needed.

```bash
git branch -d feature-login              # delete local
git push origin --delete feature-login  # delete remote
```

## Pruning Stale Remote-Tracking References

After remote branches are deleted by others, your local list may still show them:

```bash
git branch -r
# origin/feature-login    ← this was deleted remotely but still shows locally
```

Clean them up:

```bash
git fetch --prune
# or on a single remote:
git remote prune origin
```

This removes local references to remote branches that no longer exist on the remote.

<Callout type="tip">
Run `git fetch --prune` regularly (many teams add `--prune` to their `git fetch` alias or configure it globally):
```bash
git config --global fetch.prune true
```
After this, `git fetch` automatically prunes stale remote-tracking refs.
</Callout>

## Exercise

```bash
# Create a branch, make a commit, merge it into main, then delete
git switch -c temp-branch
echo "temp" > temp.txt
git add temp.txt && git commit -m "Temp work"
git switch main
git merge temp-branch

# Now delete the branch
git branch -d temp-branch
git branch   # should no longer show temp-branch

# Confirm the commits are still in main
git log --oneline | head -3
```

## Summary

`git branch -d` deletes a branch pointer if the branch is merged (safe). `git branch -D` force-deletes regardless of merge status. Deleting a branch does not delete commits — it removes the label, and commits remain in the graph while reachable from other branches. Delete remote branches with `git push origin --delete <branch>` and prune stale references with `git fetch --prune`.

## Related

- [Listing and Inspecting Branches](/learn/git_foundations/git_02_branching_03_listing_branches)
- [Feature Branch Workflow](/learn/git_foundations/git_02_branching_09_feature_branch_workflow)
- [Remote-Tracking Branches](/learn/git_foundations/git_03_remotes_05_remote_tracking_branches)
