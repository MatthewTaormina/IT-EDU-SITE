---
type: lesson
title: "Reading Conflict Markers"
description: "Read and interpret the conflict markers Git inserts into conflicted files — understand what HEAD, the branch name, and the separator line mean."
duration_minutes: 10
difficulty: Intermediate
tags: [git, conflicts, conflict-markers, merge, resolution]
---

> When Git can't resolve a conflict automatically, it marks the affected file with conflict markers — inline annotations that show you both versions of the conflicting section. Your job is to read them and decide the correct outcome.

## Why This Matters

Conflict markers look alarming the first time, but they follow a strict, predictable format. Once you can read them fluently, identifying what each side contributed and what the merge should look like becomes straightforward.

## The Three-Part Structure

Git inserts conflict markers directly into the file at the conflicting section:

```
<<<<<<< HEAD
throw new Error('Missing credentials');
=======
return null;
>>>>>>> feature-login
```

This is called a **conflict block**. Every conflict block has exactly three parts:

| Section | Meaning |
| :------ | :------ |
| `<<<<<<< HEAD` | Start of current branch's version (the branch you're merging INTO) |
| Content above `=======` | What YOUR branch has at this location |
| `=======` | Separator — divides the two versions |
| Content below `=======` | What the INCOMING branch has at this location |
| `>>>>>>> feature-login` | End of incoming branch's version |

<Callout type="warning">
The conflict markers themselves (`&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, `&gt;&gt;&gt;&gt;&gt;&gt;&gt;`) are NOT valid code. They are placeholders that must be removed or replaced before the file can be committed. Running untouched conflicted files will break most languages at compile or parse time.
</Callout>

## A Full Conflicted File Example

Imagine `login.js` before the conflict:

```js
// login.js
function authenticate(user, password) {
  if (!user || !password) {
    return false;
  }
  return db.checkCredentials(user, password);
}
```

`main` branch changed line 4 to throw an error:
```js
    throw new Error('Missing credentials');
```

`feature-login` branch changed it to return null:
```js
    return null;
```

After `git merge feature-login` conflicts, `login.js` looks like this:

```
// login.js
function authenticate(user, password) {
  if (!user || !password) {
<<<<<<< HEAD
    throw new Error('Missing credentials');
=======
    return null;
>>>>>>> feature-login
  }
  return db.checkCredentials(user, password);
}
```

The rest of the file — every line outside the conflict block — was merged cleanly and is fine. Only the block between the markers needs your decision.

## Multiple Conflict Blocks in One File

A single file can have multiple conflict blocks if several sections conflict:

```
<<<<<<< HEAD
const API_URL = 'https://api.production.example.com';
=======
const API_URL = 'https://api.staging.example.com';
>>>>>>> feature-login

// ... other code ...

<<<<<<< HEAD
export default function login() {
=======
export async function login() {
>>>>>>> feature-login
```

Each block represents a separate decision. Resolve them all before the file is conflict-free.

## The Diff3 Format (Extended Context)

You can configure Git to show the original version in addition to both sides:

```bash
git config --global merge.conflictstyle diff3
```

With `diff3`, conflict blocks look like:

```
<<<<<<< HEAD
throw new Error('Missing credentials');
||||||| parent of abc1234 (Add error handling)
return false;
=======
return null;
>>>>>>> feature-login
```

The `|||||||` section shows the **common ancestor** version — what the line looked like before either branch changed it. This is often the clearest way to understand what each branch was trying to do relative to the original.

<Callout type="tip">
Enable `diff3` merge conflict style. It provides the context you need to make a better decision about the correct resolution, especially when the two sides look similar.
```bash
git config --global merge.conflictstyle diff3
```
</Callout>

## What the Marker Lines Tell You About Authorship

- `<<<<<<< HEAD` — HEAD is always the branch you were ON when you ran `git merge`
- `>>>>>>> feature-login` — the branch name after the angle brackets is the branch you were MERGING IN

So if you're on `main` and run `git merge feature-login`:
- `HEAD` section = main's version
- `feature-login` section = the incoming branch's version

## Summary

Conflict markers divide a conflicted section into three parts: `HEAD` version (your current branch), `=======` separator, and the incoming branch version. Every conflict marker must be removed and replaced with the correct merged content before committing. Use `diff3` conflict style to also see the common ancestor version, which adds valuable context for resolution.

## Related

- [Identifying All Conflicts in a Merge](/learn/git_foundations/git_04_conflicts_03_identifying_conflicts)
- [Manual Conflict Resolution](/learn/git_foundations/git_04_conflicts_04_manual_conflict_resolution)
- [When Conflicts Occur](/learn/git_foundations/git_04_conflicts_01_when_conflicts_occur)
