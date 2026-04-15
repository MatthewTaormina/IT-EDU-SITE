---
type: lesson
title: "Fast-Forward Merges"
description: "Understand when Git performs a fast-forward merge, what it looks like in the commit graph, and when to prefer it versus a merge commit."
duration_minutes: 10
difficulty: Beginner
tags: [git, merge, fast-forward, branches, workflow]
---

> A fast-forward merge doesn't create a merge commit. It simply moves a branch pointer forward along a straight-line path of commits.

## Why This Matters

When you merge a branch that is directly ahead of your current branch, Git doesn't need to construct a new commit to reconcile divergence — there's no divergence. The merge is a "fast-forward": the pointer slides forward along the existing commit chain.

## The Fast-Forward Condition

A fast-forward is possible when the target branch has NOT received any new commits since the feature branch was created. In other words: the branch you're merging into is an **ancestor** of the branch you're merging in.

```
A ← B ← C             ← main
              \
               D ← E  ← feature-login
```

`main` is at `C`. `feature-login` is at `E`. Every commit in `main` exists in `feature-login` (C is an ancestor of E). This is the fast-forward case.

## Performing the Merge

```bash
git switch main
git merge feature-login
```

```
Updating c9b8a7a..e3f4a5b
Fast-forward
 login.html | 1 +
 auth.js    | 8 ++++++++
 2 files changed, 9 insertions(+)
```

Git printed "Fast-forward" — no merge commit was created. The `main` pointer moved to `E`:

```
A ← B ← C ← D ← E    ← main (was here: C), feature-login, HEAD
```

## What Changed (and What Didn't)

The commit graph has a single straight line. There is no merge commit — just the two feature commits now reachable from `main`. The history looks as if all the work was done directly on `main`.

**Advantages of fast-forward:**
- Clean linear history — easy to read with `git log --oneline`
- No extra "merge commit" noise in the log
- `git bisect` and `git log` work well with linear history

**Disadvantages:**
- The branch boundary disappears from the log — you can't tell at a glance that this work was done on a separate branch
- On shared teams, understanding the feature's scope from the log requires looking at commit messages rather than graph topology

The sandbox starts on `feature/nav` — a branch ahead of `main` by zero commits. Add a commit on this feature branch, switch back to `main`, and run `git merge feature/nav`:

<TerminalSandbox
  stateUrl="/sandbox/git_02_branching_06.json"
  height="26rem"
/>

<Callout type="tip">
After committing on `feature/nav`, run `git log --oneline` to confirm your branch is ahead of `main`. Then `git checkout main` and `git merge feature/nav` to complete the fast-forward.
</Callout>

## Preventing Fast-Forward: Always Create a Merge Commit

Some teams require merge commits even when a fast-forward is possible, to preserve evidence that work was done on a branch:

```bash
git merge --no-ff feature-login
```

This forces a merge commit regardless of eligibility:

```
A ← B ← C ← D ← E ← M    ← main
              ↑           ↗
              +──────────+   ← feature-login
```

`M` is the merge commit. The feature's work is clearly grouped in the DAG as a side branch.

<Callout type="tip">
`--no-ff` is the default behavior of GitHub and GitLab merge buttons when using "Create a merge commit." If your team uses a pull request workflow, most merges go through a platform UI that controls this option rather than the command line.
</Callout>

## Checking Whether a Fast-Forward is Possible

Before merging, check divergence:

```bash
git log feature-login..main --oneline
```

If this prints nothing — `main` has no commits that `feature-login` doesn't have — a fast-forward is possible.

If it prints commits, `main` has diverged and a three-way merge will be used instead.

## Exercise

```bash
# Start: main with one commit
echo "initial" > file.txt
git add file.txt && git commit -m "Initial commit"

# Create a feature branch and add commits
git switch -c add-about
echo "about page" > about.html
git add about.html && git commit -m "Add about page"

# Merge back into main — fast-forward expected
git switch main
git merge add-about
git log --oneline --graph
# Should show a straight line — no merge commit bubble
```

## Summary

A fast-forward merge moves the target branch pointer forward without creating a merge commit. It's possible only when the target branch is a direct ancestor of the source. The resulting history is linear and clean. Use `--no-ff` to force a merge commit when you want to preserve evidence of a branch in the DAG.

## Related

- [Three-Way Merges](/learn/git_foundations/git_02_branching_07_three_way_merge)
- [Divergent Histories](/learn/git_foundations/git_02_branching_05_divergent_histories)
- [Deleting Branches After Merging](/learn/git_foundations/git_02_branching_08_deleting_branches)
