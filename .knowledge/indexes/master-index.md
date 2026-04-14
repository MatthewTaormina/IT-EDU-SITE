---
tags: [index, master-index, research-navigation, all-nodes]
related_topics:
  - "[[cross-reference-map]]"
  - "[[project-based-learning]]"
  - "[[scaffolding]]"
  - "[[cognitive-load-theory]]"
  - "[[bloom-taxonomy]]"
  - "[[it-education-strategies]]"
  - "[[language-fundamentals]]"
  - "[[programming-paradigms]]"
  - "[[software-engineering-principles]]"
  - "[[programming-pedagogy]]"
  - "[[core-competencies-fullstack]]"
  - "[[frontend-stack]]"
  - "[[backend-stack]]"
  - "[[web-standards]]"
  - "[[infrastructure]]"
last_updated: "2026-04-14"
---

## Summary for AI Agents

This is the master index of the `.knowledge/` knowledge base. It lists all research nodes by domain, their file paths, primary tags, and key relationships. Use this document as the entry point for navigating the research graph. For relationship maps between nodes, see [[cross-reference-map]]. For the machine-readable node graph, see `map.json` in the `.knowledge/` root.

---

# Master Research Index

## Research Graph Overview

The `.knowledge/` knowledge base contains 14 research nodes organized into 3 subject domains and 1 index domain.

```
.knowledge/
├── pedagogy/           (5 nodes — educational frameworks and learning science)
├── programming/        (5 nodes — language concepts, paradigms, engineering principles)
├── web-dev/            (4 nodes — frontend, backend, standards, infrastructure)
└── indexes/            (2 nodes — navigation and cross-reference)
```

---

## Domain: Pedagogy

Research into educational frameworks, curriculum design, and learning science applied to IT education.

| Node | File | Primary Topic | Key Relationships |
| :--- | :--- | :--- | :--- |
| [[project-based-learning]] | `pedagogy/project-based-learning.md` | PBL methodology, driving questions, authentic products | → scaffolding, bloom-taxonomy, it-education-strategies |
| [[scaffolding]] | `pedagogy/scaffolding.md` | ZPD, fading strategies, code scaffolds | → project-based-learning, cognitive-load-theory, bloom-taxonomy |
| [[cognitive-load-theory]] | `pedagogy/cognitive-load-theory.md` | Working memory, intrinsic/extraneous/germane load, CLT effects | → scaffolding, bloom-taxonomy, project-based-learning |
| [[bloom-taxonomy]] | `pedagogy/bloom-taxonomy.md` | Six levels, learning objective writing, assessment alignment | → cognitive-load-theory, scaffolding, it-education-strategies |
| [[it-education-strategies]] | `pedagogy/it-education-strategies.md` | Concept-first sequencing, competency-based progression, threshold concepts | → project-based-learning, bloom-taxonomy, programming-pedagogy |

### Key Questions Answered in Pedagogy Domain

- What is Project-Based Learning and when is it appropriate for IT?
- How do you prevent cognitive overload in programming learners?
- How do you write measurable learning objectives using Bloom's Taxonomy?
- What scaffolding strategies are most effective for code-learning?
- What research-backed strategies distinguish effective IT education from ineffective?
- What are threshold concepts in IT and why do they matter?

---

## Domain: Programming

Research into programming language concepts, paradigms, software engineering principles, and teaching programming.

| Node | File | Primary Topic | Key Relationships |
| :--- | :--- | :--- | :--- |
| [[language-fundamentals]] | `programming/language-fundamentals.md` | Types, control flow, functions, scope, memory | → programming-paradigms, programming-pedagogy |
| [[programming-paradigms]] | `programming/programming-paradigms.md` | OOP, functional, declarative, event-driven | → language-fundamentals, software-engineering-principles, frontend-stack |
| [[software-engineering-principles]] | `programming/software-engineering-principles.md` | SOLID, DRY, YAGNI, design patterns, clean code | → programming-paradigms, core-competencies-fullstack |
| [[programming-pedagogy]] | `programming/programming-pedagogy.md` | Notional machine, PRIMM, worked examples, Parsons Problems | → it-education-strategies, cognitive-load-theory, scaffolding |
| [[core-competencies-fullstack]] | `programming/core-competencies-fullstack.md` | Tiered competency map for full-stack web development | → frontend-stack, backend-stack, infrastructure, web-standards |

### Key Questions Answered in Programming Domain

- What programming language concepts are universal vs. language-specific?
- What are the major programming paradigms and how do they apply in web development?
- What are SOLID principles and when should they be taught?
- What is the notional machine and why does it matter for teaching programming?
- What competencies does a full-stack developer need at each experience tier?
- How should introductory programming languages be selected for IT education?

---

## Domain: Web Development

Research into the specific technology stacks, standards, and infrastructure of modern web development.

| Node | File | Primary Topic | Key Relationships |
| :--- | :--- | :--- | :--- |
| [[frontend-stack]] | `web-dev/frontend-stack.md` | HTML5, CSS3, JavaScript/TypeScript, React, Vite | → backend-stack, web-standards, core-competencies-fullstack |
| [[backend-stack]] | `web-dev/backend-stack.md` | Node.js, Express, REST, PostgreSQL, auth, security | → frontend-stack, infrastructure, web-standards |
| [[web-standards]] | `web-dev/web-standards.md` | W3C, WHATWG, IETF, ECMAScript, HTTP, WCAG | → frontend-stack, backend-stack |
| [[infrastructure]] | `web-dev/infrastructure.md` | Hosting, DNS, HTTPS, Docker, CI/CD | → backend-stack, core-competencies-fullstack |

### Key Questions Answered in Web Development Domain

- What is the current industry-standard frontend tech stack (2025)?
- What is the teaching sequence for frontend technologies?
- How should REST APIs be designed and what HTTP status codes should be used?
- When should TypeScript be introduced and how?
- What are the WCAG accessibility requirements and why are they non-optional?
- How does DNS resolution work?
- What is Docker and when should it be introduced in curriculum?
- What are the differences between Netlify, Vercel, Render, and Railway?

---

## Domain: Indexes

Navigation and cross-reference documents for AI agent traversal.

| Node | File | Primary Topic |
| :--- | :--- | :--- |
| [[master-index]] | `indexes/master-index.md` | This document — all nodes listed by domain |
| [[cross-reference-map]] | `indexes/cross-reference-map.md` | Adjacency relationships between all nodes |

---

## Full Node List (Alphabetical)

| Node Name | Domain | File Path |
| :--- | :--- | :--- |
| backend-stack | web-dev | `web-dev/backend-stack.md` |
| bloom-taxonomy | pedagogy | `pedagogy/bloom-taxonomy.md` |
| cognitive-load-theory | pedagogy | `pedagogy/cognitive-load-theory.md` |
| core-competencies-fullstack | programming | `programming/core-competencies-fullstack.md` |
| cross-reference-map | indexes | `indexes/cross-reference-map.md` |
| frontend-stack | web-dev | `web-dev/frontend-stack.md` |
| infrastructure | web-dev | `web-dev/infrastructure.md` |
| it-education-strategies | pedagogy | `pedagogy/it-education-strategies.md` |
| language-fundamentals | programming | `programming/language-fundamentals.md` |
| master-index | indexes | `indexes/master-index.md` |
| programming-paradigms | programming | `programming/programming-paradigms.md` |
| programming-pedagogy | programming | `programming/programming-pedagogy.md` |
| project-based-learning | pedagogy | `pedagogy/project-based-learning.md` |
| scaffolding | pedagogy | `pedagogy/scaffolding.md` |
| software-engineering-principles | programming | `programming/software-engineering-principles.md` |
| web-standards | web-dev | `web-dev/web-standards.md` |
