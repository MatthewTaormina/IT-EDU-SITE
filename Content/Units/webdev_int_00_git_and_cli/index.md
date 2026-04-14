---
type: unit
title: "Git & CLI"
description: "The terminal, file system navigation, Git version control, GitHub, branching, and npm — the workflow tools every developer uses before writing a single line of app code."
domain: "WebDev"
difficulty: "Beginner"
estimated_hours: 7
tags:
  - git
  - cli
  - terminal
  - github
  - npm
  - version-control
prerequisites:
  - "Front-End Basics (web) — webdev course complete"
learning_objectives:
  - "Navigate the file system and manage files and directories using the terminal"
  - "Explain what Git is and why version control matters"
  - "Initialize a Git repo, stage changes, write commit messages, and push to GitHub"
  - "Clone a repository, create a branch, and open a pull request"
  - "Install Node.js, use npm to manage packages, and run npm scripts"
references:
  - type: lesson
    slug: webdev_int_00_git_and_cli_01_the_terminal
  - type: lesson
    slug: webdev_int_00_git_and_cli_02_git_fundamentals
  - type: lesson
    slug: webdev_int_00_git_and_cli_03_remotes_and_github
  - type: lesson
    slug: webdev_int_00_git_and_cli_04_branching_and_merging
  - type: lesson
    slug: webdev_int_00_git_and_cli_05_npm_basics
---

# Git & CLI

> **Unit Summary:** Before you write a single line of your next project, you need the tools that all professional developers use every day — the terminal and Git. This unit teaches you how to navigate your computer from the command line, track changes with Git, collaborate via GitHub, and manage project dependencies with npm.

## Learning Objectives

By the end of this unit, you will be able to:

- Navigate the file system and manage files and directories using the terminal
- Explain what Git is and why version control matters
- Initialize a Git repo, stage changes, write commit messages, and push to GitHub
- Clone a repository, create a branch, and open a pull request
- Install Node.js, use npm to manage packages, and run npm scripts

## Prerequisites

- **Front-End Basics (web)** — any level of HTML/CSS/JS is sufficient; no prior terminal or Git experience needed.

## Lessons in this Unit

1. [The Terminal](../../Lessons/webdev_int_00_git_and_cli_01_the_terminal.md)
2. [Git Fundamentals](../../Lessons/webdev_int_00_git_and_cli_02_git_fundamentals.md)
3. [Remotes & GitHub](../../Lessons/webdev_int_00_git_and_cli_03_remotes_and_github.md)
4. [Branching & Merging](../../Lessons/webdev_int_00_git_and_cli_04_branching_and_merging.md)
5. [npm Basics](../../Lessons/webdev_int_00_git_and_cli_05_npm_basics.md)

## Core Terminology

**Shell**
The command-line interpreter — the program that reads what you type and executes it. Common shells: `bash`, `zsh` (macOS default), PowerShell (Windows).

**Working directory**
The folder your terminal session is currently "inside." Every command you run operates relative to this location.

**Repository (repo)**
A directory tracked by Git. Contains your project files plus a hidden `.git/` folder storing the full history.

**Staging area (index)**
A waiting area between your edited files and your next commit. You decide exactly which changes go into each commit.

**Commit**
A permanent, named snapshot of the staged changes. Each commit has a unique SHA hash and a message.

**Remote**
A hosted copy of the repository — typically on GitHub — that multiple people can push to and pull from.

**Branch**
An independent line of development. The default branch is `main`. Feature branches let you work on changes without affecting `main` until you're ready.

**npm**
Node Package Manager — the tool used to install JavaScript libraries, manage versions, and run project scripts.

---

## Unit Challenge

After completing all five lessons, build the following from the terminal — no GUI file explorer allowed:

**Goal:** Create a new Git repository, write a simple HTML file, commit it, push it to GitHub, and deploy it to GitHub Pages.

**Requirements:**
- Create a new folder using `mkdir`
- Initialize a Git repo with `git init`
- Create `index.html` with `echo` or a text editor opened from the terminal
- Stage and commit the file
- Create a GitHub repository and push your code
- Enable GitHub Pages in the repository settings
- Verify the page is live at `https://<your-username>.github.io/<repo-name>/`

**Success Criteria:**
- [ ] The repository exists on GitHub with at least one commit
- [ ] The commit message follows the convention: `feat: initial HTML page`
- [ ] The page renders correctly at the GitHub Pages URL
- [ ] You completed all steps without using the GitHub web interface to create files

> **💡 Hint:** GitHub Pages serves from the `main` branch by default. Make sure your file is named `index.html`.

---

> **Unit Insight:** The terminal feels slow at first. Within a month of daily use, it is faster than any GUI. The investment pays dividends for your entire career.
