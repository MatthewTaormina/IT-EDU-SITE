---
title: "Unit Review — Git & CLI"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Unit Review — Git & CLI

> Work through this without looking back at the lessons. If you cannot answer a question, that is the lesson to revisit.

---

## What You Covered

| Lesson | Summary |
| :--- | :--- |
| The Terminal | Navigating the file system with `cd`, `ls`, `mkdir`, `touch`, `rm`, `mv`, `cp`, and understanding absolute vs. relative paths |
| Git Fundamentals | Initializing a repo, staging with `git add`, committing with `git commit`, viewing history with `git log` |
| Remotes & GitHub | Creating a remote on GitHub, linking it with `git remote add`, and pushing/pulling with `git push` / `git pull` |
| Branching & Merging | Creating branches with `git switch -c`, merging with `git merge`, and understanding the PR workflow |
| npm Basics | Installing Node.js, using `npm init`, installing packages, understanding `package.json` and `node_modules`, running scripts |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Shell** | The command-line interpreter (bash, zsh, PowerShell) that executes commands |
| **Working directory** | The folder your terminal session is currently inside |
| **Absolute path** | A path starting from the root: `/Users/alice/projects/portfolio` |
| **Relative path** | A path relative to the working directory: `../assets/image.png` |
| **Repository** | A directory tracked by Git; contains your project files and a `.git/` folder with full history |
| **Staging area** | The intermediate zone where you select which file changes to include in the next commit |
| **Commit** | A permanent, labeled snapshot of staged changes; identified by a SHA hash |
| **`HEAD`** | A pointer to the current commit on the current branch |
| **Remote** | A hosted copy of the repository (e.g., on GitHub); typically named `origin` |
| **Branch** | An independent line of development; `main` is the default |
| **Merge** | Integrating the history of one branch into another |
| **Pull Request (PR)** | A GitHub interface for reviewing and merging branch changes |
| **`node_modules/`** | The directory where npm installs package dependencies; never commit this folder |
| **`package.json`** | The project manifest: name, version, dependencies, and scripts |
| **`package-lock.json`** | An exact record of installed dependency versions; commit this file |

---

## Quick Check

1. You are in `~/projects` and want to navigate to `~/projects/portfolio/css`. Write the command using a relative path.

2. What is the difference between `git add .` and `git add -p`? When would you use each?

3. You run `git status` and see a file listed under "Changes not staged for commit." What does that mean, and what is the next step?

4. What does `git push -u origin main` do? What does the `-u` flag set up?

5. You want to start working on a new feature without affecting `main`. Write the commands to: create a new branch called `feature/search`, switch to it, and confirm you are on it.

6. What is `HEAD~1` in Git terms? How does `git diff HEAD~1` differ from `git diff`?

7. Explain the difference between `npm install express` and `npm install express --save-dev`. When does each choice matter?

8. Your teammate cloned the repository but gets errors running the project. The `node_modules/` folder is empty. What command do they need to run, and why does this situation arise?

---

## Common Misconceptions

**"I should commit every few minutes."**
Commits are meaningful checkpoints, not time-based saves. A commit should represent one complete, working change. Committing incomplete or broken code creates a messy history that is hard to navigate or revert.

**"Pushing and committing are the same thing."**
Committing creates a snapshot in your *local* repository. Pushing uploads those local commits to the remote. You can have many local commits that have never been pushed.

**"`git merge` destroys my branch."**
Merging does not delete either branch. It creates a new merge commit on the target branch combining the histories of both. You can continue using the feature branch after merging.

**"I should commit `node_modules/` so others can run the project."**
`node_modules/` should always be in `.gitignore`. The `package.json` and `package-lock.json` files record all dependencies. Anyone can reinstall them in seconds with `npm install`. Committing `node_modules/` inflates repo size by megabytes and creates merge conflicts.

**"A commit message of 'fixed stuff' is fine."**
Clear commit messages are professional courtesy and practical tooling. When you `git log` a project six months from now, "fix: correct off-by-one error in pagination" is immediately useful. "fixed stuff" is not.

---

## What Comes Next

Unit 01 — Asynchronous JavaScript will be the first time you write code that communicates with the internet. Every project you build from here will use `git push` as its deployment mechanism. You now have that tool. In the next unit you will build code that fetches data from servers you do not control — understanding the event loop and Promises is the key that unlocks it.

---

## Further Reading

- [Pro Git — Free book by Scott Chacon and Ben Straub](https://git-scm.com/book/en/v2) — The definitive open-source Git resource; chapters 1–3 cover everything in this unit
- [Oh My Git! — Interactive Git learning game](https://ohmygit.org/) — Visualizes the commit graph as you play
- [npm Docs — Getting started](https://docs.npmjs.com/getting-started) — Official npm documentation
