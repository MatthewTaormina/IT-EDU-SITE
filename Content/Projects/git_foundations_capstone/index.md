---
type: project
format: ticket
title: "First Day at Stackworks Labs"
description: "Complete three real git workflow tickets on your first day as a junior developer at a fictional tech company."
difficulty: Beginner
estimated_hours: 2
tags: [git, branching, merge-conflict, workflow]
references:
  - type: course
    slug: git_foundations
---

# First Day at Stackworks Labs

## Company Background

**Stackworks Labs** is a small SaaS startup building developer-facing tooling. Their flagship product, **Launchpad**, is a developer onboarding platform that automates environment setup, access provisioning, and documentation delivery for engineering teams. The backend is a lightweight Node.js service — no framework, just plain modules and a thin HTTP layer. It runs with `node src/index.js`.

The team is six people. They track work in GitHub Issues and operate on two-week sprints. All code goes through Git. Branches are reviewed via pull requests before merging to `main`.

## Your Role

You joined Stackworks Labs today as a **Junior Developer**. Your tech lead, **Jordan Rivera**, has already assigned you three tickets to complete on your first day. They're scoped to be completable in a single session, but they cover the full loop: setup, feature work, and a merge conflict that needs careful resolution.

The repository is at: `https://github.com/stackworks-labs/launchpad`

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Node.js (CommonJS, no transpilation) |
| Entry point | `src/index.js` |
| Package manager | npm |
| Version control | Git — hosted on GitHub |
| Branching model | Feature branches off `main`; merge via PR |

## Welcome Message

---

**From:** Jordan Rivera, Tech Lead  
**To:** You — Junior Developer  
**Date:** 2026-04-14  
**Subject:** Welcome + your first-day tickets

Hey, welcome to the team.

I've dropped three tickets into your queue for today. Work through them in order — each one builds on the last. SWL-003 has a merge conflict. That's real work, not a gotcha, so read the ticket carefully before you start.

A few things about how we work:

- Commit messages follow the `type: description` convention (`feat:`, `fix:`, `chore:`). Write messages that tell a reviewer what changed and why, not just what file you touched.
- Branch names should be descriptive and match the convention in the ticket.
- We don't force-push to `main`. Ever.

Ping me on Slack if anything is genuinely broken. Otherwise, push your branches when you're done and I'll review.

— Jordan

---

## Project Files

| File | Description |
|---|---|
| [TICKET-001.md](TICKET-001.md) | SWL-001 — Set Up Your Local Environment |
| [TICKET-002.md](TICKET-002.md) | SWL-002 — Implement Newsletter Signup Validation |
| [TICKET-003.md](TICKET-003.md) | SWL-003 — Resolve Merge Conflict on the Auth Module |
| [checklist.md](checklist.md) | Acceptance criteria across all three tickets |
| [rubric.md](rubric.md) | Scoring rubric — 100 points total |
| [assets/alex_auth_conflict.js](assets/alex_auth_conflict.js) | Alex Kim's committed version of `src/auth.js` (as it exists on `main`) |
| [starter/src/signup.js](starter/src/signup.js) | Initial `signup.js` stub |
| [starter/src/auth.js](starter/src/auth.js) | Initial `auth.js` (before Alex's changes) |
