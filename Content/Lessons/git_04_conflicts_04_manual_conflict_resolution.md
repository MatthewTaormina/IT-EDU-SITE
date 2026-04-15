---
type: lesson
title: "Resolving Conflicts Manually"
description: "Open conflicted files, read both versions, make the correct editorial decision, and remove conflict markers to produce a clean, working resolution."
duration_minutes: 14
difficulty: Intermediate
tags: [git, conflicts, resolution, merge, editing]
---

> Resolving a conflict is an editorial decision — not a Git operation. You open the file, understand both sides, write the correct combined result, and remove the markers. No special command required.

## Why This Matters

The mechanical skill of conflict resolution is straightforward. The harder skill is making the right editorial decision: which version is correct? Should you keep one, the other, or combine both? That requires understanding what each change was trying to accomplish.

## The Resolution Process

1. Open the conflicted file in your editor
2. Read both versions (HEAD and incoming)
3. Decide the correct merged result
4. Rewrite the conflict block as the final version
5. Remove ALL three marker lines (`<<<<<<<`, `=======`, `>>>>>>>`)
6. Save the file
7. Stage it with `git add`

## Starting Point: A Conflicted File

```js
// auth.js

function authenticate(user, password) {
  if (!user || !password) {
<<<<<<< HEAD
    throw new Error('Missing credentials: user and password are required');
=======
    return null;
>>>>>>> feature-login
  }
  return db.checkCredentials(user, password);
}
```

Two approaches are in conflict:
- **HEAD (`main`)**: throw an Error with a descriptive message
- **`feature-login`**: return null silently

## Decision Frameworks

### 1. Keep Your Version (HEAD)

If the incoming change is wrong or you want to discard it:

```js
function authenticate(user, password) {
  if (!user || !password) {
    throw new Error('Missing credentials: user and password are required');
  }
  return db.checkCredentials(user, password);
}
```

### 2. Keep the Incoming Version

If the incoming change is better:

```js
function authenticate(user, password) {
  if (!user || !password) {
    return null;
  }
  return db.checkCredentials(user, password);
}
```

### 3. Combine Both

Often the correct answer combines the intent of both sides:

```js
function authenticate(user, password) {
  if (!user || !password) {
    console.warn('Authentication called with missing credentials');
    return null;
  }
  return db.checkCredentials(user, password);
}
```

Or if both changes are entirely valid and independent (e.g., each branch added a different new feature):

```js
function authenticate(user, password) {
  if (!user || !password) {
    throw new Error('Missing credentials');
  }
  // Feature-login addition: log the attempt
  auditLog.record({ event: 'auth_attempt', user });
  return db.checkCredentials(user, password);
}
```

<Callout type="tip">
When unsure which version to keep, look at the commit messages on each branch to understand intent. `git log main..feature-login --oneline` shows what the incoming branch was trying to accomplish. Talk to the author if needed — resolving a conflict is often a two-second conversation.
</Callout>

## What "Resolving" Means Technically

The file is resolved when:
1. No conflict marker lines remain (`<<<<<<<`, `=======`, `>>>>>>>`)
2. The file is syntactically valid and logically correct
3. You've saved the edited file

Git doesn't validate that your resolution is "correct" — it only checks that the markers are gone and that you stage the file. The correctness check falls to you (and your tests).

## Editing in VS Code

VS Code detects conflict markers and shows a visual editor above each block:

```
Current Change (HEAD) ── Accept Current Change | Accept Incoming | Accept Both | Compare
─────────────────────────────────
  throw new Error('Missing credentials');

Incoming Change (feature-login)
─────────────────────────────────
  return null;
```

Clicking "Accept Current Change" removes the markers and keeps the HEAD version. Clicking "Accept Both" keeps both versions sequentially. For complex merges, choose "Accept Both" then manually edit the combined result to be correct.

## After Editing: Stage the Resolution

```bash
git add auth.js
```

Staging is how you tell Git "auth.js is resolved." Until you stage it, Git still considers it unresolved.

Do NOT run `git add .` carelessly during conflict resolution — only stage files you've actually verified are resolved.

## What About Binary Files?

Images, PDFs, compiled assets — Git can't show conflict markers in binary files. When a binary file conflicts:

```
CONFLICT (content): Merge conflict in logo.png
```

You must choose one version in its entirety:

```bash
# Keep your version (HEAD)
git checkout --ours logo.png
git add logo.png

# Keep the incoming version
git checkout --theirs logo.png
git add logo.png
```

<Callout type="warning">
`git checkout --ours` and `git checkout --theirs` are also available for text files, but using them means discarding one side entirely. Only use them when you've confirmed one version is completely correct as-is.
</Callout>

## Summary

To resolve a conflict: open the file, read both sides, write the correct merged content, remove all three marker lines, save, and `git add` to stage. Use `--ours` or `--theirs` for binary files where combining isn't possible. The decision of what's correct is editorial — Git handles the mechanics, but the content call is yours.

## Related

- [Completing the Merge After Resolution](/lessons/git_04_conflicts_05_completing_merge)
- [Reading Conflict Markers](/lessons/git_04_conflicts_02_conflict_markers)
- [Identifying All Conflicts](/lessons/git_04_conflicts_03_identifying_conflicts)
