---
type: project
title: "Intermediate Capstone — Data SPA"
description: "Build a data-driven single-page application that fetches from a public REST API, persists bookmarks in localStorage, and deploys via GitHub Pages — applying all six units of FrontEndIntermediate."
domain: "WebDev"
difficulty: "Intermediate"
prerequisites:
  - "Unit 00 — Git & CLI (complete)"
  - "Unit 01 — Asynchronous JavaScript (complete)"
  - "Unit 02 — ES6+ Modern JavaScript (complete)"
  - "Unit 03 — Browser APIs & Storage (complete)"
  - "Unit 04 — CSS Transitions & Animations (complete)"
  - "Unit 05 — Browser DevTools (complete)"
---

# Intermediate Capstone — Data SPA

> **Project Summary:** You have mastered the tools, the async patterns, the modern syntax, and the browser APIs. Now build something real. You will receive a client brief, wireframes, and acceptance criteria. Your job is to deliver a working, deployed single-page application — no starter code, no tutorials to follow.

---

## What This Is

This is not a lesson. It is a **professional simulation** — the kind of assignment a junior front-end developer receives in their first month on the job.

You will receive:

- 📋 **A client brief** — who the client is, what they need, and why
- 🗂️ **User stories** — what the end user should be able to do
- 📐 **Wireframes** — layout reference for the two primary views
- ✅ **Acceptance criteria** — the specific checklist your build must pass

---

## What You Will Build

A **GitHub Repository Explorer** — a search and bookmarking application backed by the GitHub Search API.

```
┌─────────────────────────────────────────┐
│  🔍 Search GitHub Repositories          │
│  ┌──────────────────────────┐ [Search]  │
│  │ javascript frameworks... │           │
│  └──────────────────────────┘           │
│                                         │
│  [All Results]  [Saved (3)]             │
│                                         │
│  ┌─────────────────┐ ┌───────────────┐  │
│  │ facebook/react  │ │ vuejs/vue     │  │
│  │ ⭐ 220k         │ │ ⭐ 208k       │  │
│  │ JavaScript      │ │ TypeScript    │  │
│  │ [Save]          │ │ [Saved ✓]    │  │
│  └─────────────────┘ └───────────────┘  │
└─────────────────────────────────────────┘
```

---

## Views and Features

| View | URL | What It Shows |
| :-- | :-- | :-- |
| Search Results | `?q=<query>` | API results for the current query |
| Saved | `?view=saved` | Repos bookmarked by the user |

---

## Deliverables

```
repo-explorer/
├── index.html
├── app.js           (entry point — event wiring only)
├── api.js           (fetch functions — no DOM)
├── ui.js            (DOM rendering functions — no fetch)
├── storage.js       (localStorage utilities)
└── style.css
```

No frameworks. No libraries. No CDN imports for logic. Plain HTML, CSS, and ES Modules.

---

## Documents

1. [Client Brief & Wireframes](./brief.md)
2. [Technical Requirements & Acceptance Criteria](./requirements.md)

---

## Before You Start

Read the full brief and requirements *before* writing any code. Then set up your Git repository:

```bash
mkdir repo-explorer && cd repo-explorer
git init
npm create vite@latest . -- --template vanilla
npm install
git add . && git commit -m "chore: initial Vite scaffold"
```

After the scaffold is committed, create a GitHub repository and enable GitHub Pages before writing a single line of your own code. This makes deployment a `git push` from day one.

> **💡 Approach tip:** Build in this order: (1) get a working search that logs data to console; (2) render the results to the DOM; (3) add save/unsave; (4) add the Saved view with URL navigation; (5) add CSS animations; (6) polish and deploy.
