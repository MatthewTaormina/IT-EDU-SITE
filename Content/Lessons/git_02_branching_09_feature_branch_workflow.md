---
type: lesson
title: "The Feature Branch Workflow"
description: "Apply the feature branch workflow — the industry standard pattern for managing work with Git — where every feature, fix, and experiment lives on its own branch."
duration_minutes: 14
difficulty: Beginner
tags: [git, workflow, feature-branch, pull-request, collaboration]
---

> The feature branch workflow is the most widely adopted Git strategy in professional software development. Every piece of work — no matter how small — starts on a dedicated branch.

## Why This Matters

Working directly on `main` is how teams break things. The feature branch workflow keeps `main` stable and deployable at all times while allowing parallel development across many contributors. It also enables code review: branches are submitted as pull requests before anything lands on `main`.

## The Core Principle

**`main` (or `master`) is always the stable, deployable branch.** All new work happens on short-lived branches that eventually merge back. You never commit directly to `main`.

## The Standard Cycle

```
1. Update local main
2. Create a feature branch
3. Do the work (commit freely)
4. Push the branch to the remote
5. Open a pull request for review
6. Merge (after approval)
7. Delete the branch
```

### Step 1: Start From Updated main

```bash
git switch main
git pull origin main
```

Always pull the latest before branching. Starting from stale `main` means more potential conflicts later.

### Step 2: Create a Branch

```bash
git switch -c feature/user-authentication
```

Name after the feature or ticket (e.g., `bugfix/nav-overflow`, `hotfix/null-pointer-checkout`).

### Step 3: Do the Work

Commit often. Commits on a feature branch are cheap and disposable — you'll clean up the message history before merging, or the merge commit acts as the summary.

```bash
# Make changes
vim auth.js
git add auth.js
git commit -m "Add JWT token generation"

vim tests/auth.test.js
git add tests/auth.test.js
git commit -m "Add tests for JWT generation"

# ... more commits ...
```

### Step 4: Push the Branch to the Remote

<Callout type="tip">
`git push` and `origin` are covered in detail in the next unit (Working with Remotes). For now, understand that `git push -u origin <branch>` publishes your local branch to the shared remote repository so teammates can see it and so you can open a pull request. You don't need to fully understand remote mechanics yet — just follow the pattern.
</Callout>

```bash
git push -u origin feature/user-authentication
```

The `-u` flag sets the upstream tracking relationship — future `git push` and `git pull` commands will know where to push/pull this branch without specifying the remote and branch name.

### Step 5: Open a Pull Request

On GitHub, GitLab, or Bitbucket:
- Navigate to your repository
- Click "New pull request" / "New merge request"
- Select `feature/user-authentication` → `main`
- Write a description of what changed and why
- Request reviewers

**Pull requests are a GitHub/GitLab concept, not a Git concept.** The underlying mechanism is `git merge`, but the review layer sits on top.

### Step 6: Merge After Approval

Once approved, the PR is merged via the platform UI. Most platforms default to creating a merge commit, though squash merge and rebase merge are also offered.

### Step 7: Delete the Branch

```bash
git switch main
git pull origin main              # get the newly merged commits
git branch -d feature/user-authentication         # delete local
git push origin --delete feature/user-authentication   # delete remote
```

## Hotfix Pattern

For critical production bugs that can't wait for a normal branch cycle:

```bash
git switch main
git pull origin main
git switch -c hotfix/critical-auth-bypass
# ... fix the bug ...
git commit -m "Fix authentication bypass vulnerability"
git push -u origin hotfix/critical-auth-bypass
# Open PR → fast-track review → merge → delete
```

Hotfix branches follow the same pattern, just with urgency.

<Callout type="tip">
Keep feature branches short-lived. A branch that lives for more than a few days starts accumulating merge conflicts with `main`. Merge or push to review within 1–3 days of starting, even if the feature isn't complete — use draft pull requests for work in progress.
</Callout>

## Naming Conventions

```
feature/<short-description>       feature/user-authentication
bugfix/<issue-or-description>     bugfix/nav-overflow-mobile
hotfix/<description>              hotfix/critical-auth-bypass
chore/<task>                      chore/update-dependencies
release/<version>                 release/v2.1.0
```

Consistent naming lets team members and CI/CD pipeline rules identify branch types at a glance.

## What `main` Looks Like After Several Features

```bash
git log --oneline --graph main
```

```
*   a1b2c3d Merge pull request #45: Add user authentication
|\
| * e3f4a5b Add tests for JWT generation
| * d2c3b4a Add JWT token generation
|/
*   9f8e7d6 Merge pull request #44: Fix nav overflow on mobile
|\
| * c4b5a60 Fix nav padding at 320px
|/
* 7d6e5f4 Initial project setup
```

`main` shows a clear record of every merged feature in reverse chronological order.

Put the full workflow into practice — the sandbox starts you on `main` with an initial commit. Work through each step: create a feature branch, make changes, commit, and merge back:

<TerminalSandbox
  stateUrl="/sandbox/git_02_branching_09.json"
  height="30rem"
/>

<ProgressCheck>
Run through the full feature branch cycle in your practice repository: start from main, create a branch, make two commits, merge back into main. Then view the resulting graph with `git log --oneline --graph`.
</ProgressCheck>

## Summary

The feature branch workflow keeps `main` stable and deployable. Every task gets a branch, work happens on the branch, the branch is pushed and reviewed via pull request, then merged and deleted. Name branches with type prefixes. Keep branches short-lived to minimize drift from `main`. This cycle is the foundation of professional Git collaboration.

## Related

- [Pushing to a Remote with `git push`](/learn/git_foundations/git_03_remotes_04_git_push_command)
- [Creating Branches](/learn/git_foundations/git_02_branching_02_creating_branches)
- [Deleting Branches](/learn/git_foundations/git_02_branching_08_deleting_branches)
