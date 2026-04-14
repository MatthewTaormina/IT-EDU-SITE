# Skill: Educational Content Authoring for IT EDU SITE

## Project Context

This skill governs the creation of all educational content for the **IT EDU SITE** — an IT education platform currently authored in Markdown. Content will eventually be rendered by a purpose-built website. Until then, all structure, formatting, and metadata conventions defined here ensure a smooth future migration.

**Current Stack:** Plain Markdown files, organized in `Content/`
**Future Stack:** A website that renders this Markdown (framework TBD)
**Subject Domain:** Information Technology (Web Dev, Networking, OS, Algorithms, Hardware, etc.)

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

- [ ] Frontmatter is present, complete, and includes `type:`
- [ ] `references:` field lists all direct child entities (for Units and Courses)
- [ ] All technical terms are **bolded** on first use and defined
- [ ] Every abstract concept has at least one **Example** block
- [ ] At least one **💡 Tip** or **⚠️ Warning** is present where relevant
- [ ] No spelling errors, no placeholder text
- [ ] File is named `00_lowercase_underscores` with correct numeric prefix and domain prefix
- [ ] The lesson is scoped to ONE concept
- [ ] `catalog.json` has been regenerated after adding/modifying files

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
