---
type: lesson
title: "The GitHub Collaboration Workflow"
description: "Walk through the complete GitHub pull request workflow — fork, clone, branch, push, open PR, review, merge — as used in professional and open-source teams."
duration_minutes: 16
difficulty: Beginner
tags: [git, github, pull-request, workflow, collaboration, open-source]
---

> The GitHub pull request workflow is the dominant collaboration model in the software industry. Once you internalize its cycle, you can contribute to any project on Earth that uses Git.

## Why This Matters

Git is the tool; GitHub is the platform. The pull request (PR) workflow built on top of Git enables asynchronous code review, automated testing integration, and a documented changelog of decisions. Every modern software team — startup to Fortune 500 — uses some variant of this workflow.

## Two Situations: Contributor vs. Team Member

**Contributing to a project you don't own (open source):**
```
Fork the repository → clone your fork → branch → push to your fork → open PR to the original
```

**Working as a team member on a shared repository:**
```
Clone the shared repository → branch → push branch → open PR → merge after review
```

This lesson covers both.

## The Full Cycle: Team Member Workflow

### 1. Start From Updated `main`

```bash
git switch main
git pull origin main
```

Always begin from the latest `main`. Never start a feature from a stale branch.

### 2. Create a Feature Branch

```bash
git switch -c feature/checkout-page
```

Name after the feature, ticket number, or bugfix description.

### 3. Do the Work — Commit Often

```bash
# Make changes
vim checkout.js

git add checkout.js
git commit -m "Add checkout form markup"

vim checkout.js
git add checkout.js
git commit -m "Add form validation logic"

vim tests/checkout.test.js
git add tests/checkout.test.js
git commit -m "Add checkout form tests"
```

Frequent commits are fine on a feature branch. They create a useful record of intent and make it easy to revert specific steps.

### 4. Push the Branch

```bash
git push -u origin feature/checkout-page
```

The `-u` sets up tracking so future pushes on this branch are just `git push`.

### 5. Open a Pull Request on GitHub

In the GitHub UI:
- Navigate to the repository
- GitHub usually detects the recently pushed branch and shows "Compare & pull request" — click it
- Or go to **Pull requests** → **New pull request** and select your branch

**Write a thorough PR description:**
- What does this PR do?
- Why is it needed? (link to ticket or issue)
- How was it tested?
- Any known limitations or follow-up tasks?

### 6. Code Review

Reviewers leave comments on specific lines. You respond by:
- Pushing additional commits to the same branch (they appear in the PR automatically)
- Replying to comments with explanation

```bash
# Address reviewer feedback
vim checkout.js
git add checkout.js
git commit -m "Fix: use aria-label on submit button (feedback from review)"
git push
```

### 7. Merge the Pull Request

Once approved:
- The repository maintainer (or you, if you have write access) clicks **Merge pull request**
- GitHub offers: "Create a merge commit", "Squash and merge", or "Rebase and merge"
- The most common for team repos is **"Squash and merge"** — combines all PR commits into one clean commit on `main`

### 8. Delete the Branch and Clean Up

GitHub offers a "Delete branch" button immediately after merging. Click it.

Locally:

```bash
git switch main
git pull origin main           # get the merged commit
git branch -d feature/checkout-page    # delete local branch
```

## The Fork-Based Workflow (Open Source)

When you don't have write access to the repository:

### 1. Fork the Repository
On GitHub, click **Fork**. This creates your own copy of the repository under your account.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/original-repo.git
cd original-repo
```

### 3. Add the Original as `upstream`

```bash
git remote add upstream https://github.com/original-owner/original-repo.git
git remote -v
```

```
origin    https://github.com/your-username/original-repo.git (fetch)
upstream  https://github.com/original-owner/original-repo.git (fetch)
```

### 4. Keep Your Fork Updated

```bash
git fetch upstream
git switch main
git merge upstream/main     # or: git rebase upstream/main
git push origin main        # keep your fork's main in sync
```

### 5. Branch, Work, Push to Your Fork

```bash
git switch -c fix/typo-in-readme
# make changes
git push -u origin fix/typo-in-readme
```

### 6. Open PR from Your Fork to the Original

On GitHub, go to your fork → **New pull request** → select `original-owner/original-repo` as the base repository.

<Callout type="tip">
When your PR is open for several days, keep it up to date with the original `main` by running `git fetch upstream && git rebase upstream/main` and force-pushing to your fork: `git push --force-with-lease`. This prevents merge conflicts from accumulating.
</Callout>

## PR Description Template (Good Practice)

```markdown
## What

Adds the checkout page with form validation and accessibility improvements.

## Why

Part of the Q3 cart overhaul — closes #142.

## How was it tested?

- Unit tests added in `tests/checkout.test.js`
- Manual testing on Chrome, Firefox, Safari
- Screen reader tested with NVDA

## Notes

- The payment integration is mocked; real integration is in #156.
```

<ProgressCheck>
Walk through one full cycle in a practice repository: create a branch, make two commits, push the branch, and if you're on GitHub, open a PR targeting your own repository's `main`. Merge it via the GitHub UI and then clean up locally.
</ProgressCheck>

## Summary

The GitHub PR workflow follows: branch → commit → push → PR → review → merge → clean up. Team members push branches to the shared repo and open PRs directly. Open-source contributors fork the repo, add the original as `upstream`, and open PRs from their fork. Keep branches short-lived, write descriptive PR descriptions, and address review feedback with additional commits pushed to the same branch.

## Related

- [Feature Branch Workflow](/lessons/git_02_branching_09_feature_branch_workflow)
- [Pushing Changes with `git push`](/lessons/git_03_remotes_04_git_push_command)
- [Pulling Changes with `git pull`](/lessons/git_03_remotes_07_git_pull_command)
