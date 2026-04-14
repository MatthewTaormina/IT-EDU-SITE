# Tasks — Kanban Board

> Source of truth for all active work items.
> Every idea must have a corresponding task entry here.
> Linked to: [[.plan/vision/vision.md]] | [[.plan/roadmap/milestones.md]]

---

## [BACKLOG]

| ID | Title | Priority | Assignee | PRD / Notes |
|----|-------|----------|----------|-------------|
| TASK-002 | Author Networking pathway — units & lessons | P0 | — | Milestone M-01; [[.plan/specs/PRD_networking_pathway.md]] *(to create)* |
| TASK-003 | Author Networking capstone project | P0 | — | Depends on TASK-002 |
| TASK-004 | Author Security pathway | P1 | — | Milestone M-02; depends on TASK-002 |
| TASK-005 | Author Python pathway | P1 | — | Milestone M-03 |
| TASK-006 | Extend CatalogSearch with multi-tag filter | P1 | — | [[.plan/specs/PRD_search.md]] *(to create)* |
| TASK-007 | Client-side progress tracking (localStorage) | P2 | — | [[.plan/roadmap/milestones.md]] P-01 |
| TASK-008 | Open contribution guide & PR template | P2 | — | Referenced in [[.skills/edu_content_authoring.md]] |
| TASK-009 | Performance audit (Core Web Vitals baseline) | P2 | — | — |
| TASK-010 | SEO — unique meta descriptions for all content pages | P2 | — | — |
| TASK-011 | Research: Create `.research/programming/automated-testing.md` | P0 | — | GAP-004 (CRITICAL); required by WebDev courses 3, 5, 7; covers testing pyramid, Vitest, React Testing Library, Supertest, Playwright, TDD/BDD |
| TASK-012 | Research: Create `.research/web-dev/web-security.md` | P0 | — | GAP-011 (MEDIUM → escalated to P0 for WebDev pathway); OWASP Top 10 (2021), dependency auditing, CSP, security headers, secret scanning; required by BackendAdvanced course |
| TASK-013 | Research: Expand `.research/web-dev/backend-stack.md` — WebSockets & SSE section | P1 | — | GAP-012 (MEDIUM); promote WebSockets from "Aware" to "Fluent" in Tier 4; add Server-Sent Events patterns; required by BackendAdvanced course |
| TASK-014 | Research: Create `.research/web-dev/nextjs-fullstack.md` | P1 | — | No current coverage; covers Next.js App Router, SSR/SSG/ISR, server components, server actions, Vercel deployment; required by FullStackAdvanced course |
| TASK-015 | Research: Create `.research/web-dev/observability.md` | P1 | — | GAP-006 (HIGH); structured logging (Pino/Winston), OpenTelemetry SDK for Node.js, Sentry error tracking, Grafana/Prometheus basics; required by FullStackAdvanced course |
| TASK-016 | Research: Create `.research/programming/git-workflow.md` | P1 | — | No dedicated research doc; covers feature branch workflow, PRs, rebase vs. merge, conflict resolution, commit message conventions, GitHub Actions integration; required by FrontEndIntermediate course |
| TASK-017 | Fix FrontEndBasic course index — complete unit listing | P1 | — | `Content/Courses/webdev/index.md` only shows Units 1–2; CSS and JS units are hidden behind HTML comment; course appears incomplete to learners |
| TASK-018 | Author WebDev pathway — FrontEndIntermediate course | P1 | — | Addresses critical gaps: Git/CLI, Async JS, ES6+, DevTools, Browser APIs; see [[.plan/roadmap/pathways.md]] for node spec; highest-priority new course |
| TASK-019 | Author WebDev pathway — FrontEndAdvanced course | P1 | — | TypeScript, React 18, Vite, Tailwind CSS, component testing; prerequisite: TASK-018; see [[.plan/roadmap/pathways.md]] |
| TASK-020 | Author WebDev pathway — BackendCore course | P1 | — | Node.js, Express, REST, SQL/PostgreSQL, JWT/bcrypt auth; prerequisite: TASK-018; see [[.plan/roadmap/pathways.md]] |
| TASK-021 | Author WebDev pathway — BackendAdvanced course | P2 | — | Prisma ORM, OWASP security, testing, WebSockets/SSE; prerequisite: TASK-020; see [[.plan/roadmap/pathways.md]] |
| TASK-022 | Author WebDev pathway — FullStackIntegration course | P2 | — | React ↔ Express integration, Docker basics, env management, separated deployment; prerequisites: TASK-019 + TASK-020; see [[.plan/roadmap/pathways.md]] |
| TASK-023 | Author WebDev pathway — FullStackAdvanced course | P2 | — | Next.js, CI/CD, Kubernetes concepts, observability, professional Git workflow; prerequisites: TASK-021 + TASK-022; see [[.plan/roadmap/pathways.md]] |

---

## [IN_PROGRESS]

| ID | Title | Priority | Assignee | Started | PRD / Notes |
|----|-------|----------|----------|---------|-------------|
| — | — | — | — | — | — |

---

## [REVIEW]

| ID | Title | Priority | Assignee | Review Link | PRD / Notes |
|----|-------|----------|----------|-------------|-------------|
| — | — | — | — | — | — |

---

## [DONE]

| ID | Title | Completed | Notes |
|----|-------|-----------|-------|
| TASK-000 | Front-End Basics (web) pathway launched (`webdev_beginner`) | 2026-Q1 | [[Content/Pathways/webdev_beginner]], [[Content/Courses/webdev]] |
| TASK-001 | Initialise `.plan/` directory (vision, Kanban, PRD template, agent coordination) | 2026-04-14 | [[.plan/vision/vision.md]], [[.plan/specs/PRD_TEMPLATE.md]] |

---

## Task Format Reference

```
ID:       TASK-NNN       (sequential, never reused)
Title:    Short imperative description
Priority: P0 (must-have) | P1 (should-have) | P2 (nice-to-have)
Assignee: Human name or "Copilot Agent"
PRD:      Link to .plan/specs/PRD_<slug>.md (required for P0/P1 features)
```

---

*Last updated: 2026-04-14 (revised 2026-04-14 — WebDev pathway expansion tasks added TASK-011–TASK-023) | Source of truth: [[.plan/operations/tasks.md]]*
