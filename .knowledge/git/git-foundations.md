---
node_id: "git_foundations"
domain: "git"
type: "research"
title: "Git Foundations"
description: "Foundational knowledge of Git version control: VCS history, Git's snapshot-based data model (blobs, trees, commits, DAG), the three working areas, core commands (init, clone, add, commit, log, diff, branch, switch, merge, push, pull, fetch), conflict resolution, and GitHub remote workflow."
tags:
  [
    "git",
    "version-control",
    "vcs",
    "distributed-vcs",
    "git-init",
    "git-commit",
    "git-branch",
    "git-merge",
    "git-remote",
    "git-push",
    "git-pull",
    "merge-conflict",
    "github",
    "staging-area",
    "dag",
  ]
related_topics:
  - "[[git_best_practices]]"
  - "[[software-engineering-principles]]"
  - "[[core-competencies-fullstack]]"
  - "[[infrastructure]]"
prerequisites: []
keywords:
  [
    "version control",
    "git init",
    "git add",
    "git commit",
    "git status",
    "git log",
    "git branch",
    "git merge",
    "git push",
    "git pull",
    "git fetch",
    "git clone",
    "staging area",
    "working directory",
    "DAG",
    "SHA-1",
    "blob",
    "tree object",
    "commit object",
    "HEAD",
    "merge conflict",
    "conflict markers",
    "fast-forward merge",
    "three-way merge",
    "remote",
    "origin",
    "GitHub",
  ]
terminal_objective:
  prerequisite: "No programming prerequisite; learner must be comfortable using a terminal/command line (navigating directories, running commands) and understand what a file system is"
  concept: "Git is a distributed version control system that stores project history as a directed acyclic graph (DAG) of immutable, content-addressed snapshot objects (blobs, trees, commits). Every operation — staging, committing, branching, merging — is a transformation of pointer positions or an addition of new objects to this graph. Understanding this object model removes all ambiguity from command behavior and is the mental model prerequisite for every advanced Git skill."
  practical_application: "Initialize a repository, move changes through the three areas (working directory → staging area → repository), create and switch branches to work on features in isolation, merge branches back together (fast-forward and three-way), push to a remote on GitHub, pull remote changes, and resolve a merge conflict by editing conflict markers and completing the merge commit."
  market_value: "Git is the single most universally required technical skill in software development. Stack Overflow Developer Survey 2024 (65,000+ respondents) shows Git usage at over 93% of professional developers — the highest of any tool in the survey. Inability to use Git is a disqualifying gap at all experience levels and is the foundational prerequisite for all CI/CD, deployment, collaboration, and code review workflows."
created: "2026-04-14"
last_updated: "2026-04-14"
---

## Summary for AI Agents

Git stores project history as a DAG of immutable snapshot objects addressed by SHA-1 hash. All operations move changes through three areas: **Working Directory** → **Staging Area (Index)** → **Repository**. Branches are lightweight movable pointers to commits; `HEAD` is a pointer to the current branch pointer. Merges are either fast-forward (linear, no merge commit) or three-way (divergent histories, creates a merge commit). Remotes are named aliases for remote repository URLs; `push`/`pull`/`fetch` synchronize object databases. Merge conflicts arise when two branches modify the same lines; they are resolved by editing conflict markers, staging the resolved file, and completing the merge commit. This document is the foundational prerequisite for `[[git_best_practices]]` and covers the content domain of the `git_foundations` course (units: git_intro, git_init_commit, git_branching, git_remotes, git_conflicts). Skills covered: `git:init_repo`, `git:add_commit`, `git:status_log`, `git:branch_merge`, `git:remote_basics`, `git:resolve_conflicts`.

---

# Git Foundations

## 1. Why Version Control Exists

Version control is the practice of tracking and managing changes to files over time, enabling recall of any previous state, comparison of changes, identification of who changed what and when, and safe parallel development.

### The Three Generations of VCS

| Generation | Examples | Model | Core Problem |
| :--- | :--- | :--- | :--- |
| **Local VCS** | RCS, SCCS | Files tracked in a local database on one machine | No collaboration; single point of failure |
| **Centralized VCS (CVCS)** | CVS, Subversion (SVN), Perforce | Single authoritative server; clients check out working copies | Server is a single point of failure; no offline work; slow branching |
| **Distributed VCS (DVCS)** | Git, Mercurial, Darcs | Every clone is a full copy of the entire repository including its history | Enables offline work, multiple remotes, fast local branching, no single point of failure |

Git is a DVCS. When a developer clones a repository, they receive the entire object database — every version of every file, every commit, every branch. This is why Git operations like `git log`, `git diff`, and `git branch` are nearly instantaneous: they read from a local database.

### What Git Solves

| Problem | Git Solution |
| :--- | :--- |
| "I broke something and need to go back" | `git revert` / `git checkout` to any past commit |
| "Two people edited the same file" | Branching + merge / conflict resolution |
| "Who introduced this bug?" | `git bisect` + `git blame` |
| "I need to try something risky without breaking the main codebase" | Feature branches |
| "We need to release a patch while a new feature is in development" | Hotfix branches off a release tag |
| "We need an audit trail of all changes" | Immutable commit history + `git log` |

---

## 2. Git's Data Model

### 2.1 Three Object Types

Git's repository is a content-addressed object store. Every object is identified by the SHA-1 hash of its contents. There are three fundamental object types:

#### Blob

Stores the raw contents of a single file (bytes, no filename). A blob does not know its own name.

```
Content: "Hello, world!\n"
SHA-1:   8ab686eafeb1f44702738c8b0f24f2567c36da6d
```

#### Tree

A directory snapshot. Maps filenames to blobs (files) or other trees (subdirectories). A tree captures the structure of a directory at one point in time.

```
tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
├── blob 8ab686...  README.md
├── blob 3b18e5...  index.html
└── tree 9c3f9a...  src/
```

#### Commit

A named snapshot. Contains:
- A pointer to the root tree (the full project state)
- Author name, email, and timestamp
- Committer name, email, and timestamp
- Commit message
- Zero or more parent commit SHA-1s (zero for initial commit; one for normal commit; two or more for merge commits)

```
commit a1b2c3d4
tree   4b825dc...
parent 9f0e1a2...
author Alice <alice@example.com> 1713888000
committer Alice <alice@example.com> 1713888000

Add homepage structure
```

### 2.2 The DAG (Directed Acyclic Graph)

Commits form a DAG. Each commit points to its parent(s). Because commits are immutable and content-addressed, you can never change history — only add to it.

```
A ← B ← C ← D  (main)
             ↑
             E ← F  (feature)
```

When `feature` is merged into `main`, a new merge commit `G` is created with two parents (`D` and `F`):

```
A ← B ← C ← D ← G  (main)
             ↑  /
             E ← F  (feature)
```

### 2.3 The Three Working Areas

Every Git workflow moves file changes through exactly three areas:

| Area | Location | Description |
| :--- | :--- | :--- |
| **Working Directory** | Project folder on disk | The files you see and edit. Git tracks which of these differ from the repository. |
| **Staging Area (Index)** | `.git/index` | A proposed next commit. `git add` moves hunks from working directory into the index. |
| **Repository** | `.git/objects/` | The permanent DAG of commit objects. `git commit` snapshots the index into the repository. |

```
Working Directory  →  git add  →  Staging Area  →  git commit  →  Repository
     (edit files)                   (index)                       (.git/objects/)
```

**Key insight:** `git add` does not record which *files* changed — it records *content*. The same content added twice produces the same blob SHA-1, deduplicating storage automatically.

### 2.4 HEAD and Branches

A **branch** is a text file containing a 40-character SHA-1 (the commit it points to). It is an alias for a commit — not a copy of files. Creating a branch is O(1): Git writes 41 bytes to a file.

**`HEAD`** is a special pointer that tracks the currently checked-out branch (or directly to a commit in "detached HEAD" state). When you make a new commit, the current branch pointer advances to the new commit; `HEAD` moves with it.

```
HEAD → main → commit D
             feature → commit F
```

After `git switch feature` and a new commit `G`:

```
HEAD → feature → commit G
       main → commit D
```

---

## 3. Core Commands

### 3.1 Configuration

```bash
# Identity — required before first commit
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Default branch name (industry standard: 'main')
git config --global init.defaultBranch main

# View all settings
git config --list
```

Configuration is stored in three scopes: system (`/etc/gitconfig`), global (`~/.gitconfig`), local (`.git/config`). Local overrides global overrides system.

### 3.2 Starting a Repository

```bash
# Initialize a new repository in the current directory
git init

# Clone an existing repository (full copy of all history)
git clone https://github.com/user/repo.git

# Clone into a custom directory name
git clone https://github.com/user/repo.git my-project
```

`git init` creates a `.git/` directory. Nothing is tracked yet. `git clone` creates the directory, initializes `.git/`, downloads all objects, and checks out the default branch.

### 3.3 The Stage-Commit Cycle

```bash
# Inspect working tree status
git status

# Stage a specific file
git add README.md

# Stage all changes in working directory
git add .

# Commit with a message (opens editor if -m omitted)
git commit -m "feat: add homepage"

# Stage all tracked modified files and commit in one step
git commit -a -m "fix: correct typo in title"
# Note: git commit -a does NOT stage untracked (new) files
```

**`git status` output states:**
| State | Meaning |
| :--- | :--- |
| `Untracked` | New file, not yet in any commit or the index |
| `Modified` | Tracked file changed in working directory but not staged |
| `Staged` | Change in the index, will be included in next commit |
| `Unmodified` | Tracked file matches repository — no changes |

### 3.4 Inspecting History and Differences

```bash
# Compact one-line log
git log --oneline

# Full log with diff stats
git log --stat

# Visual ASCII branch graph
git log --oneline --graph --all

# Show what's changed in working directory vs. staging area
git diff

# Show what's staged vs. last commit (what will be committed)
git diff --staged

# Show changes in a specific commit
git show a1b2c3d4
```

### 3.5 Undoing Changes

```bash
# Discard working directory changes to a file (revert to staged or committed state)
git restore README.md

# Unstage a file (keep working directory changes)
git restore --staged README.md

# Amend the most recent commit (message or content)
# WARNING: only use on commits not yet pushed to shared branch
git commit --amend -m "corrected message"
```

### 3.6 Ignoring Files

`.gitignore` specifies patterns for files Git should not track. Placed in the repository root (or any subdirectory for subdirectory scope).

```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment files (NEVER commit secrets)
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# Editor directories
.vscode/
.idea/
```

**Security rule:** Never commit secrets, API keys, passwords, or `.env` files to Git. Use `.gitignore` to prevent accidental staging. Even if removed in a later commit, secrets in history can be recovered.

---

## 4. Branching and Merging

### 4.1 Branch Commands

```bash
# List all local branches (* marks current branch)
git branch

# List all local and remote-tracking branches
git branch -a

# Create a new branch (does NOT switch to it)
git branch feature/login

# Switch to an existing branch
git switch feature/login

# Create and immediately switch (preferred modern syntax)
git switch -c feature/login

# Legacy equivalent (still widely used)
git checkout -b feature/login

# Rename current branch
git branch -m new-name

# Delete a merged branch
git branch -d feature/login

# Force-delete an unmerged branch (data loss risk — use carefully)
git branch -D feature/login
```

### 4.2 Merge Strategies

#### Fast-Forward Merge

Occurs when the target branch (e.g., `main`) has not diverged from the source branch (e.g., `feature`). Git simply moves the `main` pointer forward — no new commit is created.

```
Before:  main → A ← B ← C
                          ↑
                  feature → D ← E

After (ff merge):  main → D ← E
                   feature → D ← E
```

```bash
git switch main
git merge feature/login  # fast-forward if main hasn't moved
```

#### Three-Way Merge

Occurs when both branches have diverged (each has commits the other lacks). Git finds the **merge base** (the common ancestor) and constructs a new **merge commit** with two parents.

```
Before:  main → A ← B ← C ← D
                    ↑
                    E ← F ← G ← feature

After (merge commit M):  main → A ← B ← C ← D ← M
                                     ↑           /
                                     E ← F ← G ← feature
```

```bash
git switch main
git merge feature/login  # creates merge commit if branches diverged
```

To always create a merge commit (keeps explicit record of merge):
```bash
git merge --no-ff feature/login
```

### 4.3 HEAD in Detached State

When you check out a specific commit SHA (not a branch name), HEAD points directly to that commit rather than through a branch pointer. Changes made in detached HEAD state create unreachable commits unless a branch is created to point to them.

```bash
git checkout a1b2c3d4        # detached HEAD — for inspection only
git switch -c hotfix/v1.2.1  # attach HEAD to a new branch if changes needed
```

---

## 5. Working with Remotes

### 5.1 Remote Concepts

A **remote** is a named URL alias pointing to a copy of the repository hosted elsewhere (GitHub, GitLab, Bitbucket, or a self-hosted server). The conventional name for the primary remote is **`origin`** — this is set automatically by `git clone`.

**Remote-tracking branches** (e.g., `origin/main`) are read-only local references that record the state of the remote as of the last fetch. They are updated by `git fetch`, `git pull`, and `git push`.

### 5.2 Remote Commands

```bash
# List remotes with their URLs
git remote -v

# Add a remote named 'origin'
git remote add origin https://github.com/user/repo.git

# Change a remote's URL (e.g., switch HTTPS → SSH)
git remote set-url origin git@github.com:user/repo.git

# Remove a remote
git remote remove origin
```

### 5.3 Push, Fetch, and Pull

```bash
# Push local branch to remote; -u sets upstream tracking
git push -u origin main

# Push subsequent times (shorthand after -u is set)
git push

# Download all remote objects and update remote-tracking branches
# Does NOT modify local branches or working directory
git fetch origin

# Fetch AND merge remote changes into current branch
# Equivalent to: git fetch + git merge origin/main
git pull

# Fetch AND rebase instead of merge (cleaner linear history)
git pull --rebase
```

**`fetch` vs `pull`:**
- `git fetch` is always safe — it only updates remote-tracking refs, never touches your working directory.
- `git pull` is `fetch` + `merge` and may create a merge commit or conflict.

### 5.4 GitHub Authentication

| Method | Setup | Use case |
| :--- | :--- | :--- |
| **HTTPS + Personal Access Token (PAT)** | Generate PAT in GitHub Settings → Developer settings | Default for new users; token is used as password |
| **SSH Key Pair** | Generate key with `ssh-keygen`, add public key to GitHub Settings → SSH Keys | Recommended for daily use; no password prompts |

**SSH setup:**
```bash
ssh-keygen -t ed25519 -C "you@example.com"
# Copy public key (~/.ssh/id_ed25519.pub) to GitHub → Settings → SSH Keys
ssh -T git@github.com  # test connection
```

### 5.5 The Fork → Branch → PR Model (GitHub Flow)

GitHub Flow is the standard collaborative workflow on GitHub:

1. **Fork** the upstream repository (your own copy on GitHub)
2. **Clone** your fork locally
3. **Create a branch** for your change
4. **Commit** changes on the branch
5. **Push** the branch to your fork
6. **Open a Pull Request** targeting the upstream repository's main branch
7. Code review → CI checks → merge

```bash
git clone https://github.com/YOUR_USERNAME/repo.git
git switch -c fix/typo-in-readme
# ... make changes ...
git add . && git commit -m "fix: correct typo in README"
git push -u origin fix/typo-in-readme
# Now open PR on GitHub
```

---

## 6. Resolving Merge Conflicts

### 6.1 When Conflicts Occur

A merge conflict occurs when two branches have each made changes to the **same lines** of the same file, or when one branch deleted a file that the other modified. Git cannot auto-resolve which version to keep.

### 6.2 Conflict Markers

Git inserts conflict markers directly into the file:

```
<<<<<<< HEAD
Button text = "Submit"
=======
Button text = "Send"
>>>>>>> feature/rename-button
```

| Marker | Meaning |
| :--- | :--- |
| `<<<<<<< HEAD` | Start of current branch's (HEAD) version |
| `=======` | Separator between the two versions |
| `>>>>>>> branch-name` | End of incoming branch's version |

Everything between `<<<<<<<` and `=======` is the current branch's content.  
Everything between `=======` and `>>>>>>>` is the incoming branch's content.

### 6.3 Resolution Process

```bash
# 1. Identify conflicting files
git status
# → "both modified: src/button.js"

# 2. Open each conflicting file and edit to the desired final state
#    Remove ALL conflict markers (<<<<<<<, =======, >>>>>>>)
#    The resulting file should be exactly what you want

# 3. Stage the resolved file
git add src/button.js

# 4. Verify no remaining conflicts
git status
# → "All conflicts fixed but you are still merging."

# 5. Complete the merge commit
git commit
# Opens editor with auto-generated merge commit message; save and close

# To abort a merge entirely and return to pre-merge state
git merge --abort
```

### 6.4 Conflict Prevention

| Practice | Effect |
| :--- | :--- |
| Merge `main` into your feature branch frequently | Smaller divergence = fewer conflicts |
| Keep branches short-lived | Less drift from the main codebase |
| Coordinate with team who owns which files | Avoid simultaneous edits to same modules |
| Use `git pull --rebase` | Produces linear history; surfaces conflicts earlier |

---

## 7. The .git Directory Structure

Understanding what Git physically stores removes "magic" from commands:

```
.git/
├── HEAD           ← Points to current branch (e.g., "ref: refs/heads/main")
├── config         ← Repository-local git config
├── description    ← Used by GitWeb (mostly irrelevant)
├── hooks/         ← Scripts that run on git events (pre-commit, post-merge, etc.)
├── index          ← The staging area (binary file)
├── objects/       ← All blobs, trees, commit objects stored by SHA-1
│   ├── pack/      ← Packed object files (compression of loose objects)
│   └── info/
└── refs/
    ├── heads/     ← Local branch pointers (one file per branch)
    │   └── main   ← Contains SHA-1 of latest commit on main
    └── remotes/   ← Remote-tracking branch pointers
        └── origin/
            └── main
```

Key insight: `git branch new-feature` writes one 41-byte file to `.git/refs/heads/new-feature`. That is the entirety of branch creation.

---

## 8. Industry Context and Market Value

### Git Adoption (Stack Overflow Developer Survey 2024)

Git is used by **93.4% of professional developers** — the highest usage rate of any single tool in the survey (65,000+ respondents). No other version control system has significant uptake.

### GitHub Dominance

GitHub hosts over 420 million repositories (Octoverse 2024). It is the primary platform for:
- Open-source contribution (fork/PR workflow)
- Portfolio hosting (public repos signal skills to recruiters)
- CI/CD integration (GitHub Actions, the leading CI platform)
- Code review (Pull Requests)

### Employer Expectations

- **Entry-level:** Must be able to `git init`, `git add`, `git commit`, `git push`, open a PR
- **Mid-level:** Branch strategy, conflict resolution, rebase awareness, PR descriptions
- **Senior:** Interactive rebase, bisect, cherry-pick, reflog, release tagging, CI/CD integration
- **Portfolio signal:** Recruiters and hiring managers read commit histories; sparse or unstructured histories are a negative signal regardless of code quality

### Git in CI/CD Pipelines

Every mainstream CI/CD system (GitHub Actions, GitLab CI, CircleCI, Jenkins) is triggered by Git events: push to branch, PR opened, tag created. Git is not optional for any developer working in a team environment.

---

## 9. Prerequisite Knowledge

- **File system navigation:** `cd`, `ls`/`dir`, `mkdir`, `touch`/`New-Item` — all Git commands run in a terminal
- **Text editing:** Ability to edit files and understand that conflict markers are plain text
- **What a URL is:** Required for `git clone` and remote configuration

---

## 10. Related Topics

- `[[git_best_practices]]` — Atomic commits, Conventional Commits, interactive rebase, branching strategies, PR workflow; assumes this document as prerequisite
- `[[software-engineering-principles]]` — SOLID, DRY, and clean code practices that inform what belongs in a commit
- `[[core-competencies-fullstack]]` — Tier 0 professional skills; Git is listed as a pre-entry baseline competency
- `[[infrastructure]]` — CI/CD with GitHub Actions; deployment triggers via Git push events
