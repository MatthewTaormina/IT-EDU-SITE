---
tags: [fullstack, competencies, web-development, career-readiness, curriculum-design, skills-map]
related_topics:
  - "[[frontend-stack]]"
  - "[[backend-stack]]"
  - "[[web-standards]]"
  - "[[infrastructure]]"
  - "[[software-engineering-principles]]"
  - "[[it-education-strategies]]"
  - "[[programming-paradigms]]"
last_updated: "2026-04-14"
terminal_objective:
  prerequisite: "None — this is the curriculum scoping reference; used to map content to employment targets"
  concept: "Full-stack web development competency is a 7-tier progression (Tier 0 foundations → Tier 6 professional skills) covering frontend, backend, DevOps, and professional engineering practices; tiers are prerequisites for each other."
  practical_application: "Use this map to: assess learner placement tier, identify gaps between current curriculum and a target role, prioritize what to teach next, and scope capstone project requirements by tier."
  market_value: "Critical — maps directly to 2025–2026 hiring criteria; Tier 0–3 covers entry-level roles ($65–95k); Tier 4–5 covers mid-level ($95–130k); Tier 6 mastery required for senior ($130k+)."
---

## Summary for AI Agents

This document maps the core competencies required for full-stack web development, organized by tier (foundational, frontend, backend, DevOps/infrastructure, professional skills). It serves as a curriculum scoping reference — a map of *what must be taught* at each level, with industry alignment notes. Cross-reference [[frontend-stack]], [[backend-stack]], [[infrastructure]], and [[web-standards]] for detailed technology-level research. Use this document to scope learning pathways, design course sequences, and identify gaps in existing curricula.

---

# Core Competencies for Full-Stack Web Development

## Overview

A **full-stack web developer** is a professional who can design, build, deploy, and maintain complete web applications — from the user-facing frontend to the server-side backend and the infrastructure that connects them.

This document maps the competency landscape: what a developer must *know* and *be able to do* at each level of proficiency. It is intended as a curriculum design reference, not a job description.

---

## Competency Map by Tier

### Tier 0: Foundational (Prerequisites)

These competencies are prerequisites for all web development. They are not "web dev" per se, but without them, progress stalls immediately.

| Competency | Description | Proficiency Target |
| :--- | :--- | :--- |
| **File system literacy** | Navigate file systems; understand paths (absolute vs. relative); manage files via terminal | Proficient |
| **Command-line basics** | Navigate directories, move/copy/delete files, run programs | Proficient |
| **Version control (Git)** | Initialize repos; stage, commit, push; branch and merge; resolve conflicts | Proficient |
| **Text editor proficiency** | Efficient use of VS Code (or equivalent); keyboard shortcuts; multi-cursor; extensions | Proficient |
| **How the web works** | Client-server model; DNS; HTTP request-response cycle; browsers | Aware → Fluent |
| **Problem decomposition** | Break a problem into sub-problems; write pseudocode | Proficient |

---

### Tier 1: Frontend Core

| Competency | Description | Proficiency Target |
| :--- | :--- | :--- |
| **HTML structure** | Semantic elements, document structure, forms, accessibility attributes | Proficient |
| **CSS fundamentals** | Box model, selectors, specificity, cascade, typography | Proficient |
| **CSS layout** | Flexbox, Grid, responsive design, media queries | Proficient |
| **JavaScript fundamentals** | Variables, types, functions, scope, DOM manipulation, events | Proficient |
| **Asynchronous JavaScript** | Callbacks, Promises, async/await, Fetch API | Proficient |
| **Browser DevTools** | Inspect, debug, network tab, console | Proficient |
| **Accessibility (a11y)** | WCAG 2.1 basics, ARIA roles, keyboard navigation | Aware → Fluent |
| **Performance basics** | Critical path, lazy loading, image optimization | Aware |

---

### Tier 2: Frontend Advanced

| Competency | Description | Proficiency Target |
| :--- | :--- | :--- |
| **JavaScript ES6+** | Destructuring, spread/rest, modules, template literals, classes, arrow functions | Proficient |
| **TypeScript** | Types, interfaces, generics, strict mode | Fluent |
| **React (or equivalent SPA framework)** | Components, props, state, hooks (useState, useEffect), conditional rendering, lists | Proficient |
| **React ecosystem** | React Router, Context API, custom hooks | Fluent |
| **State management** | Local state vs. global state; when to lift state; Redux or Zustand | Aware → Fluent |
| **CSS-in-JS / Utility CSS** | Tailwind CSS or CSS Modules | Fluent |
| **Testing (frontend)** | Unit tests with Vitest/Jest; component tests with React Testing Library | Fluent |
| **Build tooling** | Vite, Webpack basics; bundling, tree-shaking, environment variables | Aware |

---

### Tier 3: Backend Core

| Competency | Description | Proficiency Target |
| :--- | :--- | :--- |
| **Server fundamentals** | What a server does; ports; listening for requests | Fluent |
| **Node.js** | Event loop; modules (CommonJS + ESM); npm; reading environment variables | Proficient |
| **Express.js (or equivalent)** | Routing, middleware, request/response objects, error handling | Proficient |
| **REST API design** | Resources, HTTP verbs, status codes, JSON, versioning | Proficient |
| **Authentication** | Sessions, cookies, JWT, bcrypt, OAuth concepts | Proficient |
| **SQL fundamentals** | SELECT, JOIN, WHERE, INSERT, UPDATE, DELETE; normalization basics | Proficient |
| **Database interaction** | Raw SQL driver or query builder (e.g., pg, Knex); parameterized queries | Proficient |
| **Input validation** | Server-side validation; never trust client input | Proficient |
| **Error handling & logging** | Structured error responses; logging libraries | Fluent |

---

### Tier 4: Backend Advanced

| Competency | Description | Proficiency Target |
| :--- | :--- | :--- |
| **ORM** | Prisma or Sequelize; migration management | Fluent |
| **PostgreSQL** | Indexes, transactions, relationships, basic query optimization | Fluent |
| **API security** | CORS, rate limiting, CSRF, XSS, SQL injection prevention | Proficient |
| **Testing (backend)** | Unit and integration tests; test database management | Fluent |
| **GraphQL** (optional depth) | Schema definition, resolvers, queries/mutations | Aware |
| **WebSockets** | Real-time bidirectional communication | Aware |
| **File uploads** | Multipart form data; storage strategies (local vs. cloud) | Aware |

---

### Tier 5: DevOps & Infrastructure

| Competency | Description | Proficiency Target |
| :--- | :--- | :--- |
| **Environment management** | `.env` files, environment-specific config, secrets management | Proficient |
| **Docker basics** | Containers, Dockerfiles, Docker Compose | Fluent |
| **Deployment (static)** | Netlify, Vercel, GitHub Pages | Proficient |
| **Deployment (backend)** | Railway, Render, Fly.io, or equivalent; process management | Fluent |
| **CI/CD basics** | GitHub Actions; automated tests on push; deploy on merge | Aware → Fluent |
| **DNS & domains** | A records, CNAME, NS records; domain registration | Aware |
| **HTTPS/TLS** | How certificates work; Let's Encrypt; HSTS | Aware |

---

### Tier 6: Professional Skills

These are not technical skills, but they differentiate entry-level from employable developers.

| Competency | Description |
| :--- | :--- |
| **Code reading** | Read and understand unfamiliar codebases efficiently |
| **Git workflow** | Feature branches, pull requests, code review etiquette |
| **Technical communication** | Write clear commit messages, PR descriptions, and documentation |
| **Debugging methodology** | Systematic, hypothesis-driven approach to bug resolution |
| **Estimation** | Break work into tasks; estimate effort; communicate uncertainty |
| **Self-directed learning** | Use documentation, MDN, Stack Overflow, and official repos effectively |

---

## Curriculum Sequencing Guidance

The competency tiers above suggest a natural curriculum sequence:

```
Tier 0 (Foundations)
  └─ Tier 1 (Frontend Core)
       └─ Tier 2 (Frontend Advanced) ──┐
            └─ Tier 3 (Backend Core)   ├─ Tier 5 (DevOps, introduced incrementally)
                  └─ Tier 4 (Backend Advanced)
                        └─ Tier 6 (Professional Skills — woven throughout)
```

> **💡 Tip:** DevOps skills (Tier 5) should not wait until the end. Introduce static deployment at Tier 1 (deploy an HTML page to Netlify on Day 1). Introduce version control at Tier 0. Learners who never see their work live have lower motivation.

---

## Industry Alignment Notes (2025)

| Technology | Status | Notes |
| :--- | :--- | :--- |
| React | Dominant frontend framework | 67% of frontend developer job postings (Stack Overflow 2024) |
| Next.js | Growing significantly | Server-side rendering + static generation; increasingly required |
| TypeScript | Industry standard | Required in most non-trivial JS projects; teach from Tier 2 |
| Node.js + Express | Foundational backend | Stable; broad industry adoption; good teaching tool |
| PostgreSQL | Primary relational DB for web | SQL knowledge transfers; strong community |
| Docker | Expected in mid-senior roles | Introductory Docker is now expected at junior level |
| Git/GitHub | Non-negotiable | Required from Day 1; not optional |

---

## Key Takeaways

- Full-stack competency is organized in tiers; sequencing matters because tiers build on each other.
- Foundational skills (Tier 0) are the highest-leverage investment — bottlenecks here cascade.
- TypeScript and React are industry standards; curricula that avoid them are preparing learners for a less competitive market.
- Professional skills (Tier 6) are not soft skills — they are the difference between a coder and an engineer.
- Deploy early and often — learners who see their work live are more motivated and learn deployment skills earlier.
