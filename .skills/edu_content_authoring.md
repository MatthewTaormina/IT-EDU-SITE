# Skill: Educational Content Authoring for IT EDU SITE

## Project Context

This skill governs the creation of all educational content for the **IT EDU SITE** — an IT education platform authored in Markdown and rendered by a Docusaurus site.

**Content Stack:** Markdown files in `Content/`, served by Docusaurus at route `/courses`
**Assets:** Static files in `Assets/`, served via Docusaurus `staticDirectories`
**Subject Domain:** Information Technology (Web Dev, Networking, OS, Algorithms, Hardware, etc.)

### Supporting Directories

| Directory | Purpose |
| :--- | :--- |
| `.research/` | Instructional Knowledge Engine — domain research graph; **always consult before authoring** |
| `.plan/` | Operations — vision, roadmap, Kanban tasks, PRD specs, UX flows, and review checklists |
| `site/` | Docusaurus site configuration and React/MDX components |

> **Agent rule:** Read `.research/README_AGENT.md` and `.research/map.json` before creating any new content. Check `.plan/operations/tasks.md` to confirm the topic is in-scope before authoring.

---

## 1. Content Model — Seven First-Class Entity Types

The platform uses a **graph model**: every content type is its own independently addressable entity. Containment is expressed through `references` fields in frontmatter, not filesystem nesting. No entity is "owned by" another.

| Type | File Pattern | Purpose |
| :--- | :--- | :--- |
| **Learning Pathway** | `Pathways/<slug>/index.md` | Curated, goal-oriented sequence referencing Courses and/or Projects |
| **Course** | `Courses/<slug>/index.md` | Discipline-scoped curriculum referencing Units, Lessons, and/or Projects |
| **Unit** | `Units/<slug>/index.md` | Topic cluster referencing other Units and/or Lessons (recursive nesting allowed) |
| **Lesson** | `Lessons/<slug>.md` | Single focused concept; standalone deliverable |
| **Project** | `Projects/<slug>/index.md` | Applied, hands-on deliverable; referenceable from Pathways, Courses, or Units |
| **Article** | `Articles/<slug>.md` | Blog-style deep-dive; not tied to any course; may freely cite external sources |
| **Catalog** | `catalog.json` | Machine-readable search index generated from frontmatter; **never edit by hand** |

### Relationship Rules

```
Learning Pathway  ──references──▶  Course | Project
Course            ──references──▶  Unit | Lesson | Project
Unit              ──references──▶  Unit | Lesson   (recursive nesting OK)
Article           ──standalone──   (no parent required; links to any entity or external URL)
```

### Directory Structure

```
Content/
├── catalog.json                              ← generated search index (never edit by hand)
├── index.md                                  ← site landing page
├── Pathways/
│   └── webdev_beginner/
│       └── index.md                          ← type: pathway
├── Courses/
│   └── webdev/
│       └── index.md                          ← type: course
├── Units/
│   └── webdev_00_web_foundations/
│       ├── index.md                          ← type: unit
│       └── review.md
├── Lessons/
│   └── webdev_00_web_foundations_01_the_internet.md   ← type: lesson
├── Projects/
│   └── webdev_capstone_portfolio/
│       └── index.md                          ← type: project
└── Articles/
    └── internet_vs_web.md                    ← type: article
```

### Catalog Regeneration

Whenever content is added, modified, or removed, regenerate `catalog.json` by running the catalog generator script from the repo root. The catalog is the single source of truth for search and filtering in the future website. It is built by scanning all frontmatter.

Each catalog entry contains at minimum:

```json
{
  "slug": "webdev_00_web_foundations_01_the_internet",
  "type": "lesson",
  "title": "The Internet",
  "description": "The Internet is the global network...",
  "path": "Lessons/webdev_00_web_foundations_01_the_internet.md",
  "difficulty": "Beginner",
  "tags": ["internet", "client-server", "ip-address"]
}
```

---

## 2. Naming Conventions

- All **lowercase**, words separated by **underscores**.
- Lesson and Unit slugs **must** be prefixed with their domain and path to ensure global uniqueness:
  - **Domain prefix:** `webdev_`, `networking_`, `security_`, etc.
  - **Unit slug:** `webdev_00_web_foundations`
  - **Lesson slug:** `webdev_00_web_foundations_01_the_internet`
- Directory and file names for new content **must** include a two-digit numeric prefix: `00_`, `01_`, etc. This prefix controls sort order.
- No spaces, no hyphens, no uppercase in names.
- **Every index directory must contain an `index.md`** — no folder should exist without one.

---

## 3. Frontmatter (Metadata)

Every `.md` file **must** begin with a YAML frontmatter block. The `type` field is mandatory on all files.

### Learning Pathway (`Pathways/<slug>/index.md`)

```yaml
---
type: pathway
title: "Web Developer: Zero to Employable"
description: "One sentence summary."
difficulty: Beginner | Intermediate | Advanced
estimated_hours: 60
tags: [web, fullstack]
goal: "What the learner will achieve upon completion."
audience: "Who this is for and what they are assumed to know."
references:
  - type: course
    slug: webdev
  - type: project
    slug: webdev_capstone_portfolio
---
```

### Course (`Courses/<slug>/index.md`)

```yaml
---
type: course
title: "Web Development"
description: "One sentence summary."
domain: WebDev | Networking | OS | Hardware | Algorithms | Security
difficulty: Beginner | Intermediate | Advanced
tags: [html, css, javascript]
prerequisites:
  - slug: intro-to-computers
references:
  - type: unit
    slug: webdev_00_web_foundations
  - type: unit
    slug: webdev_01_html
  - type: project
    slug: webdev_capstone_portfolio
---
```

### Unit (`Units/<slug>/index.md`)

```yaml
---
type: unit
title: "Web Foundations"
description: "One sentence summary."
difficulty: Beginner | Intermediate | Advanced
tags: [internet, web, http]
prerequisites:
  - slug: intro-networking
references:
  - type: unit
    slug: webdev_02_css_04_layout_01_flexbox   # sub-unit example
  - type: lesson
    slug: webdev_00_web_foundations_01_the_internet
  - type: lesson
    slug: webdev_00_web_foundations_02_the_web
---
```

### Lesson (`Lessons/<slug>.md`)

```yaml
---
type: lesson
title: "The Internet"
description: "One sentence summary."
difficulty: Beginner | Intermediate | Advanced
duration_minutes: 15
tags:
  - internet
  - client-server
  - ip-address
---
```

### Project (`Projects/<slug>/index.md`)

```yaml
---
type: project
title: "Capstone Project — Personal Portfolio Website"
description: "One sentence summary."
difficulty: Beginner | Intermediate | Advanced
tags: [html, css, javascript, portfolio]
skills_practiced: [html-structure, css-layout, js-events, git]
deliverable: "A deployed static website with at least 3 pages."
prerequisites:
  - slug: webdev_01_html
  - slug: webdev_02_css
  - slug: webdev_03_js_basics
---
```

### Article (`Articles/<slug>.md`)

```yaml
---
type: article
title: "The Internet and the Web Are Not the Same Thing"
description: "One sentence summary."
author: "Author Name"
published_date: "2026-04-14"
tags:
  - internet
  - web
  - history
related_content:
  - type: lesson
    slug: webdev_00_web_foundations_01_the_internet
external_references:
  - title: "How the Web Works — MDN"
    url: "https://developer.mozilla.org/..."
---
```

---

## 4. Unit Structure (`Units/<slug>/index.md`)

A Unit is the landing page for a topic. It reads like a course syllabus.

```markdown
# [Unit Title]

> **Unit Summary:** One or two sentences describing what this unit covers and why it matters.

## Learning Objectives
By the end of this unit, you will be able to:
- Objective 1 (use action verbs: *identify, explain, compare, build, debug*)
- Objective 2

## Prerequisites
- Link or name of required prior knowledge

## Lessons in this Unit
1. [Lesson 1 Title](../../Lessons/<slug>.md)
2. [Lesson 2 Title](../../Lessons/<slug>.md)

## Core Terminology
A quick-reference glossary for the unit's key terms.

**Term**
Definition in one to two sentences.

---

## [Section 1: Concept Group]
...prose and sub-sections...

---

> **Unit Insight:** A closing thought or "big picture" takeaway.
```

### review.md Standard

Every Unit folder must contain a `review.md`. It is the final file in the unit.

**Required sections:**

| Section | Purpose |
| :--- | :--- |
| **What You Covered** | One-sentence summary of every lesson in the unit |
| **Key Terms** | Glossary of every important term introduced |
| **Quick Check** | 5–10 short-answer questions (no multiple choice) |
| **Common Misconceptions** | 3–5 things learners frequently get wrong, corrected plainly |
| **What Comes Next** | One-paragraph bridge to the next unit |

---

## 5. Lesson Structure (`Lessons/<slug>.md`)

A Lesson delivers a single, focused concept. It should be completable in one sitting.

```markdown
# [Lesson Title]

> **Lesson Summary:** What this lesson covers in one sentence.

## Concept Explanation
Clear, direct prose. No jargon without definition. Use analogies for abstract ideas.

## How It Works
Step-by-step breakdown, diagrams, or tables where appropriate.

## [EXAMPLES]
(See Section 7 for formatting conventions)

## [CHALLENGES]
(See Section 7 for formatting conventions)

## Key Takeaways
- Bullet summary of the 3–5 most important points.

## Further Reading / Research Questions
(See Section 7 for formatting conventions)
```

---

## 6. Article Structure (`Articles/<slug>.md`)

An Article is a standalone blog-style piece. It is not part of a course sequence.

```markdown
# [Article Title]

> **Article Summary:** What this article covers in one sentence.

---

## [Section 1]
...prose...

## [Section 2]
...

---

## Key Takeaways
- Bullet summary of the main points.

## Optional Resources
- [Title](https://url) — description of what it covers and why it's worth reading
```

Articles **may**:
- Cite external sources freely (in `external_references` frontmatter and inline links)
- Reference internal lessons, units, or courses (in `related_content` frontmatter and inline links)
- Cover topics from multiple domains

Articles **must not**:
- Be structured as a lesson (no strict "How It Works / Challenges" format required)
- Require prerequisite reading to be understood (they are self-contained)

---

## 7. Course Structure (`Courses/<slug>/index.md`)

A Course is a navigational hub — it organizes, it does not teach directly.

```markdown
# [Course Title]

> **Course Summary:** What this course covers, who it is for, and what the learner will achieve.

## Course Objectives
By the end of this course, you will be able to:
- High-level objective 1
- High-level objective 2

## Prerequisites
- [Prior Course or Concept](../../Courses/<slug>/)

## Curriculum
### Unit 1: [Unit Title]
Brief description. → [Start Unit](../../Units/<slug>/)

### Unit 2: [Unit Title]
...
```

---

## 8. Learning Pathway Structure (`Pathways/<slug>/index.md`)

A Learning Pathway is a curated, goal-oriented sequence of courses.

```markdown
# Learning Pathway: [Pathway Name]

> **Who this is for:** [Target audience]
> **Goal:** [What the learner achieves upon completion]
> **Estimated Time:** [Total hours]

## Pathway Overview

| Step | Content | Type | Skills Gained |
| :--- | :--- | :--- | :--- |
| 1 | [Course Name](../../Courses/<slug>/) | Course | Skill A |
| 2 | [Project Name](../../Projects/<slug>/) | Project | Skill B |

## Milestones
Describe 2–3 concrete checkpoints that mark meaningful progress.

## Recommended Tools & Environment
List any software, accounts, or setup required before starting.
```

---

## 9. Cross-References

- Use **relative markdown links** for all internal cross-references.
- Cross-references should be **inline** (at the point of relevance), not collected at the bottom.
- The `references` frontmatter field is for the search catalog — it does not replace prose links.

**Relative path rules:**

| Linking from | Linking to | Example relative path |
| :--- | :--- | :--- |
| `Lessons/<slug>.md` | Another lesson | `./other-lesson-slug.md` |
| `Units/<slug>/index.md` | A lesson | `../../Lessons/<lesson-slug>.md` |
| `Courses/<slug>/index.md` | A unit | `../../Units/<unit-slug>/` |
| `Pathways/<slug>/index.md` | A course | `../../Courses/<course-slug>/` |
| `Pathways/<slug>/index.md` | A project | `../../Projects/<project-slug>/` |
| Any file | An article | `../../Articles/<article-slug>` |

### Optional Resources

Every lesson ends with an **## Optional Resources** section. Third-party links are allowed and encouraged here.

```markdown
## Optional Resources

- [Title](https://url) — one-sentence description of what it covers and why it's worth reading
```

Unit-level resources are collected in `review.md` under a `## Further Reading` section.

---

## 10. Educational Element Conventions

### ✅ Example

```markdown
> **Example — [Short Label]:**
> [Explanation or code demonstrating the concept.]
>
> ```language
> // code here
> ```
```

**Rule:** Every abstract concept must have at least one Example immediately following it.

---

### 🔬 Research Question

```markdown
> **Research Question:** [Open-ended question that encourages the learner to explore further.]
>
> *Hint: Try searching for [keyword] or [related tool/technology].*
```

**Rule:** Include 1–3 Research Questions at the end of each lesson.

---

### 💡 Tip

```markdown
> **💡 Tip:** [Practical advice or shortcut that improves understanding or workflow.]
```

**Rule:** Tips are positive — they point toward a better way. Do not use Tips to warn about dangers.

---

### ⚠️ Warning

```markdown
> **⚠️ Warning:** [Description of a common mistake, and how to avoid it.]
```

**Rule:** Warnings appear near the concept they protect against. Never cluster them at the end.

---

### 🚨 Alert (Critical / Breaking)

```markdown
> **🚨 Alert:** [Critical information. Non-negotiable or carries serious risk.]
```

**Rule:** Use fewer than one Alert per lesson on average.

---

### 🏆 Challenge

```markdown
## Challenge: [Challenge Title]

**Goal:** What the learner should produce or demonstrate.

**Requirements:**
- Requirement 1
- Requirement 2

**Starter (optional):**
```language
// scaffolding code or template
```

**Success Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

> **💡 Hint:** A nudge without giving away the solution.
```

**Rule:** Every Unit `index.md` should end with at least one Challenge that synthesizes the unit's objectives.

---

## 11. Writing Style Guide

| Principle | Rule |
| :--- | :--- |
| **Voice** | Direct and professional. Write to the learner: use "you." |
| **Jargon** | Define every technical term on first use. Bold the term. |
| **Sentence Length** | Prefer short sentences. Max ~25 words before breaking. |
| **Analogies** | Required for any concept that cannot be directly observed. |
| **Passive Voice** | Avoid. Prefer "The server sends a response" over "A response is sent." |
| **Placeholders** | Forbidden. Never write "content goes here" or "TBD." |
| **Scope Creep** | Each lesson teaches ONE concept. Split if necessary. |
| **ASCII Art** | **Forbidden.** Never use ASCII diagrams. |
| **Diagrams** | Use **Mermaid** (flow/sequence/graph) or **SVG** (spatial/architectural). Every lesson that explains a flow, structure, or anatomy **must** include at least one diagram. |

### Visual Content Standards

**Always diagram:**
- Any multi-step process or flow (request-response, DNS resolution, page load)
- Any architecture with multiple named components (client-server, load balancer, CDN)
- Any structure with labeled parts (URL anatomy, HTTP message structure)
- Any layered model (Internet vs Web, HTML/CSS/JS layers)

| Use Case | Preferred Format |
| :--- | :--- |
| Flow (A → B → C) | SVG or Mermaid `graph TD` |
| Sequence (time-ordered back-and-forth) | Mermaid `sequenceDiagram` |
| Architecture (components and relationships) | SVG |
| Anatomy (labeled parts of a thing) | SVG |
| Concept illustration | AI-generated image |
| Comparison / taxonomy | Markdown table |

**SVG style conventions:**
- Use `viewBox` and no fixed `width`/`height` (responsive scaling)
- Font: `system-ui, -apple-system, sans-serif`
- Arrow color: `#6b7280` (neutral gray)
- Blue = client, amber = gateway/proxy, green = server/backend

---

## 12. Difficulty Labeling

| Label | Assumes | Example Content |
| :--- | :--- | :--- |
| **Beginner** | No prior IT knowledge | What is a URL? What is an IP address? |
| **Intermediate** | Comfort with Beginner concepts | How does DNS resolution work? |
| **Advanced** | Hands-on experience | Designing a load-balanced architecture |

---

## 13. Quick Checklist Before Saving Any File

### Frontmatter
- [ ] `type` field present and matches one of: `pathway`, `course`, `unit`, `lesson`, `project`, `article`
- [ ] `title` is unique, descriptive, and ≤60 characters
- [ ] `description` is present and ≤160 characters
- [ ] `difficulty` is set (`Beginner` | `Intermediate` | `Advanced`)
- [ ] `estimated_hours` or `duration_minutes` is set
- [ ] `tags` array contains ≥2 relevant tags
- [ ] `references:` field lists all direct child entities (for Units and Courses)

### Content Quality
- [ ] All technical terms are **bolded** on first use and defined
- [ ] Every abstract concept has at least one **Example** block
- [ ] At least one **💡 Tip** or **⚠️ Warning** is present where relevant
- [ ] Lesson opens with a clear learning objective ("By the end of this lesson, you will be able to…")
- [ ] Every concept is paired with a code example, exercise, or real-world application
- [ ] Code blocks have language specifiers (` ```html `, ` ```js `, etc.)
- [ ] No broken internal relative links
- [ ] No spelling errors, no placeholder text

### Structure & Naming
- [ ] File is named `00_lowercase_underscores` with correct numeric prefix and domain prefix
- [ ] The lesson is scoped to ONE concept
- [ ] Heading hierarchy is logical (H1 → H2 → H3, never skipped)
- [ ] Tables have a header row

### Catalog
- [ ] `catalog.json` has been regenerated after adding/modifying files

*Full pre-publish checklist: [[.plan/operations/checklists/checklist_content_review.md]]*

---

## 14. Pedagogical Philosophy

### Core Principle: Progressive Complexity

Start with a simplified, working mental model. Then incrementally add real complexity, edge cases, and "under the hood" detail. Never lead with the enterprise-level or fully-optimized version of a concept.

### Depth Layers

| Layer | Goal | Tone |
| :--- | :--- | :--- |
| **1 — High Level** | Build the mental model. Analogies, big picture. | Accessible, no jargon |
| **2 — How It Works** | Explain the mechanism. What actually happens. | Precise, still friendly |
| **3 — Under the Hood** | Expose the internals. Data structures, protocols, specs. | Technical, rigorous |

### Cognitive Load Rules

| Practice Area | Mandatory | Prohibited |
| :--- | :--- | :--- |
| **Content Formatting** | Strict hierarchies, bullet points, semantic code blocks. | Decorative images, tangential anecdotes. |
| **Pacing & Flow** | If a learner is blocked, offer a parallel unblocked task. | Forcing strict linear progression when it creates a bottleneck. |
| **Feedback Design** | Explain *why* an error occurs. | Generic "incorrect" messages; giving the answer immediately. |
| **Complex Systems** | Start with a simplified functioning model. | Introducing the enterprise solution before the basic mechanism is understood. |

### Analogy Policy

- Every concept that cannot be directly observed **requires** an analogy.
- Analogies must be retired once the technical vocabulary is established.
- When the real mechanism differs from the analogy, **say so explicitly**.

---

## 15. AI Authoring Workflow

**Never skip ahead without explicit user approval.**

### Step 0 — Research (Required Before Any New Content)

Before generating any lesson, unit, or course:

1. Read `.research/map.json` — identify the relevant domain node(s).
2. Read the domain `manifest.json` — review `terminal_objective` and existing `educational_assets`.
3. Read the target `.research/<domain>/<topic>.md` — use `terminal_objective.concept` as the lesson's core definition.
4. Check `.research/validation/gap-analysis.md` — confirm the topic is not a CRITICAL gap that requires a new research document first.
5. Check `.plan/operations/tasks.md` — confirm the topic is in-scope and assigned.

> Use `terminal_objective.prerequisite` → lesson prerequisites; `terminal_objective.concept` → "Concept Explanation" section; `terminal_objective.practical_application` → lab/challenge deliverable; `terminal_objective.market_value` → "Why This Matters" framing.

### Step 1 — Plan (Structural Outline)

Present the full directory/file tree with names, numbering, and a one-line description of each file. Wait for approval.

### Step 2 — Stub (Frontmatter + Skeleton)

Create files with valid frontmatter and section headings only. No prose content yet. Wait for approval.

### Step 3 — Expand (One File at a Time)

Write full content for one file at a time. Use progressive expansion: introduce Layer 1 content first, seek approval before adding Layer 2/3 depth.

### Rules

- **Never output multiple fully-written files in a single response.**
- **Always present a plan and wait for approval before creating files.**
- When in doubt about scope, ask — don't assume.
- Stubs are always preferable to placeholders.
- Validate generated content targets Bloom Level ≥ 3. If not, revise.

### Research Protocols Quick Reference

| Protocol | When to Use | Entry Point |
| :--- | :--- | :--- |
| **A — Generate Lesson/Unit** | New content creation | `.research/map.json` → domain manifest → research `.md` |
| **B — Assess Learner Readiness** | Prerequisite chain analysis | `terminal_objective.prerequisite` → recursive graph traversal |
| **C — Prioritize Backlog** | Sprint/quarter planning | `gap-analysis.md` → severity filter → `map.json` cross-reference |
| **D — Create Research Document** | Gap identified; no node exists | Verify in `gap-analysis.md` → create `.md` → update `map.json` + manifest + `master-index.md` |
| **E — Generate Educational Assets** | Lab/quiz/project from existing node | Domain manifest `educational_assets` array → deliverable as acceptance criteria |

*Full protocol definitions: [[.research/README_AGENT.md]]*

### 2026 Priority Signal

When generating new content, prioritize these high-demand skill areas:

| Priority | Skill Area | Gap ID | Target Document |
| :--- | :--- | :--- | :--- |
| ★★★★★ | Automated Testing (unit/integration/e2e) | GAP-004 | `programming/automated-testing.md` |
| ★★★★★ | LLM API Integration | GAP-001 | `programming/llm-api-integration.md` |
| ★★★★★ | Model Context Protocol (MCP) | GAP-003 | `programming/mcp-model-context-protocol.md` |
| ★★★★★ | AI Agent Orchestration | GAP-002 | `programming/agent-orchestration.md` |
| ★★★★☆ | Web Security (OWASP Top 10) | GAP-011 | `web-dev/web-security.md` |
| ★★★★☆ | Observability + OpenTelemetry | GAP-006 | `web-dev/observability.md` |
| ★★★★☆ | Vector Databases + Embeddings | GAP-008 | `programming/vector-databases-embeddings.md` |

*Full gap register: [[.research/validation/gap-analysis.md]]*

---

## 16. Knowledge Engine & Operations Reference

---

### `.research/` — Instructional Knowledge Engine

The `.research/` directory is a machine-optimized research graph backing all curriculum tasks. It is **not** public-facing content.

```
.research/
├── README_AGENT.md         ← Agent system prompt extension (read first)
├── map.json                ← Full node graph and edge relationships (always read before authoring)
├── manifest.json           ← Root manifest listing all domains and document counts
├── manifest.schema.json    ← JSON schema for manifests
├── pedagogy/               ← 5 nodes: PBL, scaffolding, CLT, Bloom's, IT strategies
├── programming/            ← 5 nodes: language fundamentals, paradigms, SE principles, pedagogy, competency map
├── web-dev/                ← 4 nodes: frontend stack, backend stack, web standards, infrastructure
├── indexes/                ← 2 nodes: master-index, cross-reference-map
└── validation/             ← 1 node: gap-analysis (curriculum currency audit)
```

**Every research `.md` file contains a `terminal_objective` YAML block with four authoritative fields:**

```yaml
terminal_objective:
  prerequisite: "What must be known before this content"
  concept: "The machine-readable concept definition for this node"
  practical_application: "What the learner actually does with this knowledge"
  market_value: "Industry demand signal and employment relevance"
```

Do not re-derive these from prose — the YAML is authoritative.

#### How to Read `.research/`

| Goal | What to Read |
| :--- | :--- |
| Get the full picture before authoring | `map.json` (node graph) → domain `manifest.json` → target `.md` file |
| Find prerequisites for a topic | `terminal_objective.prerequisite` → traverse edges in `map.json` |
| Check what topics are missing | `validation/gap-analysis.md` |
| Navigate all nodes at once | `indexes/master-index.md` |
| Find relationships between nodes | `indexes/cross-reference-map.md` |

#### How to Update `.research/`

**Updating an existing research document:**

1. Edit the `.md` file — update prose, examples, or technology references.
2. Update the `last_updated` YAML field to the current ISO date (`YYYY-MM-DD`).
3. If `terminal_objective` fields change, update the matching entry in the domain `manifest.json`.
4. If `related_topics` (Wikilinks) change, update `map.json` edges and `indexes/cross-reference-map.md`.
5. Increment `map.json` → `meta.version`: **PATCH** for content edits.

**Adding a new research document (Protocol D):**

1. Verify the topic has an entry in `validation/gap-analysis.md` — do not create undocumented additions.
2. Read an existing `.md` in the target domain for format reference.
3. Create the new file at `.research/<domain>/<slug>.md` with:
   - YAML frontmatter: `tags`, `related_topics` (Wikilinks), `last_updated`, and `terminal_objective` (all 4 fields)
   - `## Summary for AI Agents` section immediately after frontmatter
   - Content structured for RAG chunking: short, self-contained sections with clear headings
   - No placeholder prose
4. Add the new node to `map.json` under `nodes[]` with at least **two edges** in `edges[]`.
5. Add the document entry to the domain `manifest.json` (`documents[]` array) with `terminal_objective` and `educational_assets`.
6. Add the node to `indexes/master-index.md` in the appropriate domain table.
7. Add the node to `indexes/cross-reference-map.md`.
8. Update `manifest.json` (root) `total_documents` count.
9. Increment `map.json` → `meta.version`: **MINOR** for new nodes.

**Removing or deprecating a research document:**

1. Add a Deprecation Notice to `validation/gap-analysis.md` explaining what replaced it.
2. Remove the node from `map.json` and all orphaned edges.
3. Remove from domain `manifest.json`, `indexes/master-index.md`, and `indexes/cross-reference-map.md`.
4. Increment `map.json` → `meta.version`: **MINOR**.

> **Schema changes** (new YAML fields, new edge relationship types) require a **MAJOR** version bump in `map.json`.

---

### `.plan/` — Operations Directory

The `.plan/` directory contains all project management and planning artefacts.

```
.plan/
├── vision/vision.md                        ← North Star, product strategy, guiding principles
├── roadmap/milestones.md                   ← Milestone definitions and quarterly objectives
├── operations/tasks.md                     ← Kanban board (BACKLOG / IN_PROGRESS / REVIEW / DONE)
├── operations/checklists/
│   ├── checklist_content_review.md         ← Pre-publish gate for all content nodes
│   └── checklist_prd_review.md             ← Pre-development gate for PRDs
├── specs/PRD_TEMPLATE.md                   ← PRD template (required for P0/P1 features)
└── ux/README.md                            ← Site-level user flows and wireframe conventions
```

#### How to Read `.plan/`

| Goal | What to Read |
| :--- | :--- |
| Understand the product direction | `vision/vision.md` |
| See what's being built and when | `roadmap/milestones.md` |
| Find the current active work items | `operations/tasks.md` — look at `[BACKLOG]` and `[IN_PROGRESS]` tables |
| Check requirements for a feature | `specs/PRD_<feature_slug>.md` |
| Understand the site user flows | `ux/README.md` |
| Gate content before publishing | `operations/checklists/checklist_content_review.md` |
| Gate a PRD before development | `operations/checklists/checklist_prd_review.md` |

#### How to Update `.plan/`

**Adding a new task:**

1. Open `operations/tasks.md`.
2. Assign the next sequential `TASK-NNN` ID (never reuse an ID).
3. Add a row to the `[BACKLOG]` table with: ID, Title, Priority (`P0`/`P1`/`P2`), Assignee, and a PRD link if applicable.
4. For P0/P1 tasks, create the PRD before moving to IN_PROGRESS (see below).

**Moving a task through the Kanban:**

| Transition | Action |
| :--- | :--- |
| BACKLOG → IN_PROGRESS | PRD must be `APPROVED`; run `checklist_prd_review.md`; record `Started` date |
| IN_PROGRESS → REVIEW | Work complete; link review artefact (PR, draft, etc.) |
| REVIEW → DONE | All checklist items cleared; record `Completed` date and notes |

**Creating a PRD:**

1. Copy `specs/PRD_TEMPLATE.md` → `specs/PRD_<feature_slug>.md`.
2. Fill in every section — no `_TODO_` placeholders.
3. Link the PRD in `operations/tasks.md` for its corresponding task.
4. Run `operations/checklists/checklist_prd_review.md` and set status to `APPROVED` before development begins.

**Updating the roadmap:**

1. Edit `roadmap/milestones.md` — update the Gantt chart and milestone definition tables.
2. Update the "Quarterly Objectives" table to reflect the new state.
3. Update the `Last updated` footer line.

**Updating the vision:**

Only edit `vision/vision.md` when the product direction changes at a strategic level. Update the "Current State" table whenever a major milestone ships.

**Adding a UX wireframe:**

1. Create `ux/<feature_slug>_wireframe.md`.
2. Use Mermaid.js or SVG only — no image files.
3. Link to the new file from the relevant PRD's UX section.

**Updating checklists:**

Edit `operations/checklists/checklist_content_review.md` or `checklist_prd_review.md` when authoring or review standards change. Bump the checklist version comment at the bottom of the file.
