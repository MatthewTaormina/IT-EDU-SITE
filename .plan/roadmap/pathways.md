# WebDev Pathway — High-Level Node Map

> **Status:** Node 2 (FrontEndIntermediate) — IN PROGRESS. All other nodes pending approval after Node 2 is reviewed.
> **Constraint:** All courses follow the Competency Node strategy — every course has an explicit Prerequisite and a Terminal Project.
> Linked to: [[.plan/vision/vision.md]] | [[.plan/operations/tasks.md]] | [[.plan/roadmap/milestones.md]]
> Source research: [[.research/programming/core-competencies-fullstack.md]] | [[.research/web-dev/frontend-stack.md]] | [[.research/web-dev/backend-stack.md]] | [[.research/web-dev/infrastructure.md]]

---

## Pathway Overview

```
FrontEndBasic ──► FrontEndIntermediate ──► FrontEndAdvanced
                                                   │
                                                   ▼
                                          BackendCore ──► BackendAdvanced
                                                   │              │
                                                   └──────┬───────┘
                                                          ▼
                                                 FullStackIntegration
                                                          │
                                                          ▼
                                                 FullStackAdvanced
```

Learners may branch at FrontEndIntermediate:
- **Frontend track:** FrontEndBasic → FrontEndIntermediate → FrontEndAdvanced
- **Full-stack track:** FrontEndBasic → FrontEndIntermediate → FrontEndAdvanced → BackendCore → BackendAdvanced → FullStackIntegration → FullStackAdvanced

---

## Course Node Specifications

> Detail below is **top-level only** (Tier mapping, competency targets, prerequisite, terminal project).
> Unit/lesson breakdown is NOT generated here — each course node expands only after the previous one is reviewed and approved.

---

### Node 1 — FrontEndBasic ✅ LAUNCHED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev` |
| **Pathway slug** | `webdev_beginner` |
| **Competency Tiers** | Tier 0 (partial: web theory only) + Tier 1 (HTML, CSS, Vanilla JS, DOM) |
| **Prerequisites** | None |
| **Key Coverage** | How the web works; HTML structure & semantics; CSS (cascade, box model, Flexbox, Grid, responsive); JavaScript fundamentals, control flow, functions, data structures, DOM manipulation & events |
| **Terminal Project** | Static personal portfolio website — deployed to Netlify or GitHub Pages |
| **Estimated Hours** | ~60 |
| **Kanban** | TASK-000 (DONE) |
| **Known Gaps (see Gap Analysis)** | Missing: Git, CLI, Async JS, DevTools unit, a11y woven throughout, CSS transitions; addressed in Node 2 |

---

### Node 2 — FrontEndIntermediate 🔲 PLANNED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev_intermediate` |
| **Competency Tiers** | Tier 0 (remaining: Git, CLI, file system, dev environment) + Tier 1 remaining (Async JS, DevTools, a11y deeper) |
| **Prerequisites** | FrontEndBasic (`webdev`) |
| **Key Coverage** | Git & CLI fundamentals (init, commit, push, branch, PR workflow); terminal navigation & npm basics; async JavaScript (callbacks → Promises → async/await); Fetch API & REST consumption; ES6+ features (destructuring, spread, modules, optional chaining); Browser APIs (localStorage, sessionStorage, History API); CSS transitions & animations; DevTools mastery (Elements, Console, Network, Sources, debugger); accessibility woven into JS & CSS |
| **Terminal Project** | Data-driven single-page app consuming a public REST API, with local persistence (localStorage), deployed via GitHub Pages using Git push |
| **Estimated Hours** | ~40 |
| **Kanban** | TASK-018 |
| **Missing Research** | [[.research/programming/git-workflow.md]] (TASK-016 — to create) |

---

### Node 3 — FrontEndAdvanced 🔲 PLANNED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev_advanced_frontend` |
| **Competency Tiers** | Tier 2 (Frontend Advanced: TypeScript, React, build tooling, testing, utility CSS) |
| **Prerequisites** | FrontEndIntermediate (`webdev_intermediate`) |
| **Key Coverage** | TypeScript fundamentals (types, interfaces, generics, strict mode); React 18 (JSX, components, props, state, hooks: useState/useEffect/useContext/useRef); React Router v6 (client-side routing); Vite (build tool, HMR, env variables); Tailwind CSS (utility-first, after CSS mastery is confirmed); frontend testing (Vitest + React Testing Library); WCAG AA accessibility gates; performance basics (lazy loading, code splitting) |
| **Terminal Project** | TypeScript + React SPA with multi-route navigation, API data fetching (Tanstack Query), component test suite, and Vercel deployment |
| **Estimated Hours** | ~60 |
| **Kanban** | TASK-019 |
| **Missing Research** | [[.research/programming/automated-testing.md]] (TASK-011 — CRITICAL, to create) |

---

### Node 4 — BackendCore 🔲 PLANNED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev_backend_core` |
| **Competency Tiers** | Tier 3 (Backend Core: Node.js, Express, REST, SQL, auth) |
| **Prerequisites** | FrontEndIntermediate (`webdev_intermediate`); FrontEndAdvanced recommended but not required |
| **Key Coverage** | Node.js runtime (event loop, modules, npm, environment variables); Express.js (routing, middleware, error handling); REST API design (resources, HTTP verbs, status codes, versioning); PostgreSQL & SQL fundamentals (SELECT/JOIN/INSERT/UPDATE/DELETE, parameterized queries); Authentication (JWT + bcrypt — stateless auth flow, httpOnly cookie tradeoffs); server-side input validation (zod); structured error responses; secrets management (.env, never commit) |
| **Terminal Project** | Authenticated REST API with ≥3 resource endpoints, PostgreSQL database, JWT auth, input validation, deployed to Render |
| **Estimated Hours** | ~50 |
| **Kanban** | TASK-020 |
| **Missing Research** | None — [[.research/web-dev/backend-stack.md]] and [[.research/web-dev/infrastructure.md]] cover this tier |

---

### Node 5 — BackendAdvanced 🔲 PLANNED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev_backend_advanced` |
| **Competency Tiers** | Tier 4 (Backend Advanced: ORM, security, testing, real-time) |
| **Prerequisites** | BackendCore (`webdev_backend_core`) |
| **Key Coverage** | Prisma ORM (schema definition, migrations, type-safe queries — after raw SQL is established); PostgreSQL advanced (indexes, transactions, relationships, basic query optimization); API security (CORS, rate limiting, CSRF, XSS prevention, OWASP Top 10 framing); backend testing (Vitest unit tests + Supertest integration tests + test database management); WebSockets with Socket.IO (real-time bidirectional communication); Server-Sent Events (one-way streaming); file uploads (multipart/form-data, local vs. cloud storage strategies) |
| **Terminal Project** | Real-time collaborative API (e.g., a live feed or notification system) using WebSockets, Prisma ORM, full integration test suite, security headers configured |
| **Estimated Hours** | ~50 |
| **Kanban** | TASK-021 |
| **Missing Research** | [[.research/web-dev/web-security.md]] (TASK-012 — to create); `.research/web-dev/backend-stack.md` WebSockets expansion (TASK-013) |

---

### Node 6 — FullStackIntegration 🔲 PLANNED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev_fullstack` |
| **Competency Tiers** | Tier 3 + Tier 4 integration; Tier 5 (DevOps intro: Docker, env management, separated deployment) |
| **Prerequisites** | FrontEndAdvanced (`webdev_advanced_frontend`) + BackendCore (`webdev_backend_core`) |
| **Key Coverage** | Full-stack architecture patterns (separated frontend + backend vs. monorepo); connecting a React frontend to an Express API (CORS, env variables, proxy config); shared TypeScript types between client and server; Docker fundamentals (Dockerfile, docker-compose.yml for app + PostgreSQL); environment management across dev/staging/production; deployment architecture (Vercel for frontend, Render for backend, Railway for database); static vs. dynamic deployments; DNS and custom domains |
| **Terminal Project** | Full-stack app (React + Express + PostgreSQL) with Docker Compose for local dev, deployed as separated frontend (Vercel) and backend (Render), with custom domain configured |
| **Estimated Hours** | ~45 |
| **Kanban** | TASK-022 |
| **Missing Research** | None — [[.research/web-dev/infrastructure.md]] covers Docker, deployment, and DNS at the required level |

---

### Node 7 — FullStackAdvanced 🔲 PLANNED

| Field | Value |
| :--- | :--- |
| **Slug** | `webdev_fullstack_advanced` |
| **Competency Tiers** | Tier 5 (DevOps complete: CI/CD, observability) + Tier 6 (Professional Skills) + Next.js full-stack paradigm |
| **Prerequisites** | FullStackIntegration (`webdev_fullstack`) + BackendAdvanced (`webdev_backend_advanced`) |
| **Key Coverage** | Next.js (App Router, SSR, SSG, ISR, server components, server actions, API routes); CI/CD with GitHub Actions (test on push, deploy on merge, environment-specific secrets); Kubernetes fundamentals (pods, deployments, services, ingress — conceptual + kubectl basics); observability basics (structured logging with Pino, error tracking with Sentry, OpenTelemetry instrumentation); professional Git workflow (feature branches, PR templates, code review etiquette, semantic commits, changelogs); performance optimization (Core Web Vitals, Lighthouse audit, bundle analysis) |
| **Terminal Project** | Production-grade Next.js full-stack application with: CI/CD pipeline (GitHub Actions), Docker Compose, Sentry error tracking, structured logging, Lighthouse score ≥90, deployed to Vercel with custom domain |
| **Estimated Hours** | ~60 |
| **Kanban** | TASK-023 |
| **Missing Research** | [[.research/web-dev/nextjs-fullstack.md]] (TASK-014 — to create); [[.research/web-dev/observability.md]] (TASK-015 — to create) |

---

## Missing Research Summary

The following research documents must be created before the corresponding course nodes can be fully authored. These are tracked in [[.plan/operations/tasks.md]].

| Task | File to Create/Expand | Required By | Severity |
| :--- | :--- | :--- | :--- |
| TASK-011 | `.research/programming/automated-testing.md` | FrontEndAdvanced (Node 3), BackendAdvanced (Node 5), FullStackAdvanced (Node 7) | 🔴 CRITICAL |
| TASK-012 | `.research/web-dev/web-security.md` | BackendAdvanced (Node 5) | 🟠 HIGH |
| TASK-013 | Expand `.research/web-dev/backend-stack.md` (WebSockets & SSE) | BackendAdvanced (Node 5) | 🟡 MEDIUM |
| TASK-014 | `.research/web-dev/nextjs-fullstack.md` | FullStackAdvanced (Node 7) | 🟠 HIGH |
| TASK-015 | `.research/web-dev/observability.md` | FullStackAdvanced (Node 7) | 🟠 HIGH |
| TASK-016 | `.research/programming/git-workflow.md` | FrontEndIntermediate (Node 2) | 🟠 HIGH |

---

## Approval Gate

> **⏸️ PAUSED — awaiting approval of this high-level node map.**
> Once the 7-node structure is approved, course nodes will be expanded one at a time, starting with **Node 2 (FrontEndIntermediate)** as it addresses the most critical gaps in the currently launched pathway.
> Each expansion will add: unit list, learning objectives per unit, lesson list, and terminal project spec.

---

*Last updated: 2026-04-14 | Owner: Lead Curriculum Architect | Source: [[.plan/vision/vision.md]], [[.research/programming/core-competencies-fullstack.md]]*
