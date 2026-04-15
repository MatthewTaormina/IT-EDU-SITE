---
type: lesson
title: "Git's Object Model: Blobs, Trees, and Commits"
description: "Understand how Git stores every version of every file as immutable, content-addressed objects — blobs, trees, and commits — and why this model makes Git so reliable."
duration_minutes: 18
difficulty: Beginner
tags: [git, object-model, internals, blob, tree, commit, sha1]
---

> Git is not a tool that tracks file changes — it is a content-addressed object store that snapshots entire project states. Understanding this distinction changes how you read every Git command.

## Why This Matters

Most developers think of version control as "tracking diffs" — storing what changed between versions. Git does something fundamentally different: **it stores complete snapshots, addressed by the hash of their content**. This design gives Git its speed, reliability, and resilience.

Once you understand the three object types, all Git behavior is predictable. Commands stop being magic incantations and become logical manipulations of a known data structure.

## The Content-Addressed Object Store

Git's database lives inside `.git/objects/`. Every piece of data Git stores is called an **object**. Each object is identified by the **SHA-1 hash of its contents** — a 40-character hexadecimal string.

Two key properties follow from this:
1. **Identical content always produces the same hash.** If two files have the same bytes, they produce a single shared blob object. No duplication.
2. **Objects are immutable.** Changing any bit of content produces a different hash, which is a different object. The original object is unchanged forever.

Git has three fundamental object types.

## Object Type 1: Blob (File Content)

A **blob** stores the raw bytes of a single file. It has no filename, no path, no metadata — just content.

```
Bytes:  "Hello, world!\n"
SHA-1:  8ab686eafeb1f44702738c8b0f24f2567c36da6d
```

The same file content, renamed, produces the **same blob**. Blobs don't know their own names — that's the tree's job.

**Why this matters:** If 1,000 files in your project all contain the same license text, Git stores a single blob. Every reference points to that one object. This is why Git repositories are often smaller than you'd expect.

## Object Type 2: Tree (Directory Snapshot)

A **tree** captures the structure of a directory at a point in time. It maps names to blobs (files) or other trees (subdirectories).

```
tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
├── blob 8ab686...  README.md
├── blob 3b18e5...  index.html
└── tree 9c3f9a...  src/
    ├── blob 1e2f4a...  main.js
    └── blob 2f3b5c...  utils.js
```

A tree is a snapshot of one directory level, linked to sub-trees for any subdirectories.

**Why this matters:** When you commit, Git doesn't record "these lines changed." It records the complete state of every file in the tree, as a set of linked objects. Two commits that differ by one byte differ in a blob, a tree (the directory containing that file), and all parent trees up to the root — plus the commit object itself.

## Object Type 3: Commit (Named Snapshot)

A **commit** is a named, authored snapshot of the entire project. It contains:

- A pointer to the **root tree** (the complete state of all files)
- **Author** — name, email, timestamp (who wrote the code)
- **Committer** — name, email, timestamp (who applied it — can differ in patched/rebased commits)
- **Commit message** — human-readable explanation
- **Zero or more parent commit SHA-1s**
  - Zero parents: the initial commit
  - One parent: a normal commit
  - Two or more parents: a merge commit

Here is what a commit object looks like internally:

```
tree   4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 9f0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f
author Alice <alice@example.com> 1713888000 -0400
committer Alice <alice@example.com> 1713888000 -0400

Add homepage hero section

- Implement responsive hero layout
- Add CTA button with hover state
- Wire up scroll-to-content link
```

The SHA-1 of a commit is computed from all of these fields together. Change the message, the timestamp, or any parent — you get a new, different commit. The old commit still exists, unchanged, in the object database.

## How the Three Types Link Together

Every commit points to a root tree. The root tree points to blobs (files) and sub-trees (directories). Sub-trees point to more blobs. It's a deeply nested web of content-addressed objects:

```
commit a1b2c3d4
   └─▶ tree 4b825dc   ← root
           ├─▶ blob 8ab686   (README.md)
           ├─▶ blob 3b18e5   (index.html)
           └─▶ tree 9c3f9a   (src/)
                   ├─▶ blob 1e2f4a  (main.js)
                   └─▶ blob 2f3b5c  (utils.js)
```

When you run `git commit`, Git:
1. Writes blobs for any changed file contents
2. Writes trees for any changed directories
3. Writes a commit object pointing to the new root tree and the previous commit as its parent

<Callout type="tip">
You can inspect any object manually with `git cat-file -p <sha1>`. Try it after making a commit: `git log --oneline` to get a SHA-1, then `git cat-file -p <sha1>` to see the raw commit object. This is not required for daily use, but seeing it once cements the mental model.
</Callout>

## Immutability Is Git's Guarantee

Because objects are content-addressed and never modified, Git's entire history is tamper-evident. If someone changes a commit, the SHA-1 changes — every subsequent commit that references it (through parent pointers) also gets a new SHA-1. You literally cannot change history without changing every SHA-1 from that point forward.

This is why `git push --force` is dangerous on shared branches — it rewrites history in a way that breaks other developers' references.

<Callout type="warning">
Never force-push to a branch that teammates are working from. Rewriting shared history makes their local branches refer to objects that no longer match the remote — causing confusing divergence.
</Callout>

## Summary

Git stores project history as three immutable, content-addressed object types:
- **Blob** — file content (no name)
- **Tree** — directory snapshot (maps names to blobs/trees)
- **Commit** — named snapshot (points to root tree + parent commit)

Every operation in Git is a manipulation of these objects. When you understand them, nothing Git does is mysterious.

## Related

- [The DAG: Directed Acyclic Graph of Commits](/learn/git_foundations/git_01_init_commit_08_dag_commit_graph)
- [The Three Working Areas](/learn/git_foundations/git_00_intro_03_three_working_areas)
- [Three Generations of Version Control Systems](/learn/git_foundations/git_00_intro_02_three_generations_vcs)
