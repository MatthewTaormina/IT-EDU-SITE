# Skill: Educational Content Authoring for IT EDU SITE

## Project Context

This skill governs the creation of all educational content for the **IT EDU SITE** — an IT education platform currently authored in Markdown. Content will eventually be rendered by a purpose-built website. Until then, all structure, formatting, and metadata conventions defined here ensure a smooth future migration.

**Current Stack:** Plain Markdown files, organized in `Content/`
**Future Stack:** A website that renders this Markdown (framework TBD)
**Subject Domain:** Information Technology (Web Dev, Networking, OS, Algorithms, Hardware, etc.)

---

## 1. Content Hierarchy

The platform uses a strict four-level instructional hierarchy **and** one parallel content type for practice.

```
Learning Pathway          Independent Project
└── Course                (standalone — not nested under any course)
    └── Lesson Plan
        └── Lesson
```

| Level | Also Called | File Pattern | Purpose |
| :--- | :--- | :--- | :--- |
| **Learning Pathway** | Track, Roadmap | `pathway.md` or top-level `README.md` | Groups related courses into a goal-oriented sequence |
| **Course** | Module, Domain | `course_name/index.md` | Groups lesson plans around a single discipline |
| **Lesson Plan** | Unit, Topic | `topic_name/index.md` | Organizes a cluster of related lessons with learning objectives |
| **Lesson** | Page, Article | `lesson_name.md` | Delivers a single, focused concept |
| **Independent Project** | Practice Project, Portfolio Project | `Projects/<slug>/index.md` | Standalone, real-world-style assignment not tied to any specific course |

### Navigation & Discovery

> **Important:** Courses and Pathways are **not** exposed as top-level navigation tabs. Because the catalog will eventually contain too many courses to list in a nav bar, content is discovered exclusively through a **central Course and Pathway Catalog** page that provides **search and filter** capabilities (by domain, difficulty, duration, skills, etc.). The top-level navigation links only to the Catalog, the Projects index, and site-level pages (About, Home). Individual course or pathway pages are never placed directly in the main navigation.

### Directory & File Naming Convention
- All **lowercase**, words separated by **underscores**.
- All directories and files **must** be prefixed with a two-digit number and underscore: `00_web_foundations/`, `01_the_internet.md`
- This prefix controls sort order so the curriculum sequence is always visible in the filesystem.
- No spaces, no hyphens, no uppercase in the name portion.
- **Every content folder must contain an `index.md`** — no folder should exist without one.

### index.md by Level

| Level | index.md Purpose |
| :--- | :--- |
| **Course folder** (e.g. `WebDev/`) | Course hub: summary, objectives, prerequisites, list of all units with one-line descriptions |
| **Lesson Plan folder** (e.g. `00_web_foundations/`) | Unit hub: learning objectives, prerequisites, lesson list, core terminology glossary |

### review.md Standard

Every lesson plan folder must also contain a `review.md` file. It is the **final file** in the unit and serves as a consolidation checkpoint before the learner moves on.

**Required sections:**

| Section | Purpose |
| :--- | :--- |
| **What You Covered** | One-sentence summary of every lesson in the unit |
| **Key Terms** | Glossary of every important term introduced, with concise definitions |
| **Quick Check** | 5–10 short-answer questions the learner should be able to answer without looking. No multiple choice — questions should require recall and synthesis |
| **Common Misconceptions** | 3–5 things learners frequently get wrong, corrected plainly |
| **What Comes Next** | One-paragraph bridge to the next unit, explaining what prior knowledge will be used |

### Cross-References

- Lessons **must** cross-reference related lessons within the same unit using relative markdown links: `[Lesson 06: HTTP](./06_http.md)`
- Lessons **may** cross-reference lessons in other units where genuinely relevant
- Cross-references should be inline (at the point of relevance) not collected at the bottom

### Optional Resources

Every lesson ends with an **## Optional Resources** section — the final section before the file ends. Third-party links are allowed and encouraged here.

**Lesson-level resources** (in each `.md` lesson file):
```markdown
## Optional Resources

- [Title](https://url) — one-sentence description of what it covers and why it's worth reading
```

**Unit-level resources** (collected in `review.md` under a `## Further Reading` section):
- Aggregated list of the best resources across the whole unit
- Include authoritative references: MDN, web.dev, RFCs, official docs

---

## 2. Frontmatter (Metadata)

Every `.md` file **must** begin with a YAML frontmatter block.

### Lesson Plan (`index.md`) Frontmatter
```yaml
---
title: "Topic Display Name"
description: "One sentence summary for SEO and navigation."
domain: "WebDev | Networking | OS | Hardware | Algorithms | ..."
difficulty: "Beginner | Intermediate | Advanced"
prerequisites:
  - "Prerequisite topic or concept"
learning_objectives:
  - "By the end of this unit, the learner will be able to ..."
---
```

### Lesson Frontmatter
```yaml
---
title: "Lesson Display Name"
lesson_plan: "Parent Lesson Plan Title"
order: 1
duration_minutes: 15
tags:
  - keyword1
  - keyword2
---
```

---

## 3. Lesson Plan Structure (`index.md`)

A Lesson Plan is the landing page for a topic. It should read like a course syllabus.

```markdown
# [Topic Title]

> **Unit Summary:** One or two sentences describing what this unit covers and why it matters.

## Learning Objectives
By the end of this unit, you will be able to:
- Objective 1 (use action verbs: *identify, explain, compare, build, debug*)
- Objective 2

## Prerequisites
- Link or name of required prior knowledge

## Lessons in this Unit
1. [Lesson 1 Title](./lesson_1.md)
2. [Lesson 2 Title](./lesson_2.md)

## Core Terminology
A quick-reference glossary for the unit's key terms.

**Term**
Definition in one to two sentences.

---

## [Section 1: Concept Group]
...prose and sub-sections...

---

> **Unit Insight:** A closing thought or "big picture" takeaway connecting this unit to real-world IT work.
```

---

## 4. Lesson Structure (standalone `.md`)

A Lesson delivers a single, focused concept. It should be completable in one sitting.

```markdown
# [Lesson Title]

> **Lesson Summary:** What this lesson covers in one sentence.

## Concept Explanation
Clear, direct prose. No jargon without definition. Use analogies for abstract ideas.

## How It Works
Step-by-step breakdown, diagrams, or tables where appropriate.

## [EXAMPLES]
(See Section 5 for formatting conventions)

## [CHALLENGES]
(See Section 5 for formatting conventions)

## Key Takeaways
- Bullet summary of the 3–5 most important points.

## Further Reading / Research Questions
(See Section 5 for formatting conventions)
```

---

## 5. Educational Element Conventions

These are the standard "callout" blocks used throughout all content. Consistency is critical for future website rendering.

---

### ✅ Example

Use for concrete demonstrations, code samples, and real-world applications.

**Markdown:**
```markdown
> **Example — [Short Label]:**
> [Explanation or code demonstrating the concept.]
>
> ```language
> // code here
> ```
```

**Rule:** Every abstract concept must have at least one Example immediately following it. Never leave a definition floating without a concrete case.

---

### 🔬 Research Question

Use to prompt independent thinking and exploration beyond the lesson material.

**Markdown:**
```markdown
> **Research Question:** [Open-ended question that encourages the learner to explore further.]
>
> *Hint: Try searching for [keyword] or [related tool/technology].*
```

**Rule:** Include 1–3 Research Questions at the end of each lesson. They should not be answerable from the lesson content alone.

---

### 💡 Tip

Use for best practices, professional shortcuts, and "good to know" information.

**Markdown:**
```markdown
> **💡 Tip:** [Practical advice or shortcut that improves understanding or workflow.]
```

**Rule:** Tips are positive — they point toward a better way of doing something. Do not use Tips to warn about dangers.

---

### ⚠️ Warning

Use for common mistakes, gotchas, and misconceptions that learners frequently encounter.

**Markdown:**
```markdown
> **⚠️ Warning:** [Description of a common mistake, and how to avoid it.]
```

**Rule:** Warnings are reactive — they appear near the concept they protect against. Never cluster Warnings at the end of a section.

---

### 🚨 Alert (Critical / Breaking)

Use sparingly for security risks, data-loss scenarios, or concepts where getting it wrong has serious consequences.

**Markdown:**
```markdown
> **🚨 Alert:** [Critical information. This is non-negotiable or carries serious risk.]
```

**Rule:** Use fewer than one Alert per lesson on average. If everything is critical, nothing is.

---

### 🏆 Challenge

Use for hands-on exercises, projects, and activities that let learners apply the concept.

**Markdown:**
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

**Rule:** Every Lesson Plan (`index.md`) should end with at least one Challenge that synthesizes the unit's objectives.

---

## 6. Course Structure (`course_name/index.md`)

A Course is a navigational hub — it does not teach directly, it organizes.

```markdown
# [Course Title]

> **Course Summary:** What this course covers, who it is for, and what the learner will achieve.

## Course Objectives
By the end of this course, you will be able to:
- High-level objective 1
- High-level objective 2

## Prerequisites
- [Prior Course or Concept](../path/to/course)

## Curriculum
### Unit 1: [Lesson Plan Title]
Brief description of the unit. → [Start Unit](./unit_1_folder/index.md)

### Unit 2: [Lesson Plan Title]
...
```

---

## 7. Learning Pathway Structure

A Learning Pathway is a curated, goal-oriented sequence of courses.

```markdown
# Learning Pathway: [Pathway Name]

> **Who this is for:** [Target audience and assumed starting knowledge.]
> **Goal:** [What the learner will be able to do upon completion.]
> **Estimated Time:** [Total hours]

## Pathway Overview

| Step | Course | Duration | Skills Gained |
| :--- | :--- | :--- | :--- |
| 1 | [Course Name](./path) | ~X hrs | Skill A, Skill B |
| 2 | [Course Name](./path) | ~X hrs | Skill C |

## Milestones
Describe 2–3 concrete checkpoints that mark meaningful progress.

## Recommended Tools & Environment
List any software, accounts, or setup the learner needs before starting.
```

---

## 8. Independent Projects

Independent Projects are a **standalone content type** — they sit parallel to Courses and Pathways, not inside them. Their purpose is to give learners an opportunity to practice skills and build a portfolio without being attached to a specific course.

### Core Principle: Simulated Real-World Assignments

Every Independent Project **must** be framed as a realistic professional job assignment or an agile/Jira-style ticket. The learner should feel as though they have just been handed real work by a manager, stakeholder, or client. This means:

- Using first-person professional language (the project "speaks" to the learner as a colleague or manager would).
- Including authentic-feeling communications (emails, Slack/Teams messages, or meeting notes) that provide the brief and context.
- Avoiding any language that signals this is a tutorial exercise (e.g., do not write "In this lesson, you will learn…").

### Directory & File Structure

All Independent Projects live under `Content/Projects/`. Each project is a self-contained folder.

```
Content/
└── Projects/
    ├── index.md                          # Project catalog / listing page
    └── <slug>/                           # e.g., 01_portfolio_landing_page/
        ├── index.md                      # Project hub (overview + all links)
        ├── communications/
        │   └── 01_kickoff_email.md       # Simulated email, Slack message, or meeting note
        ├── prd.md                        # Product Requirements Document
        ├── assets/
        │   ├── design_mock.png           # Design mocks, wireframes, reference images
        │   └── ...
        ├── starter/
        │   └── ...                       # Starter files: initial codebase or templates
        └── content.md                    # The actual ticket / assignment description
```

**Naming rules:** Follow the same lowercase-underscore and numeric-prefix convention as the rest of the content hierarchy (e.g., `01_portfolio_landing_page/`).

### Required Components

Every Independent Project **must** include all five of the following components:

| Component | File(s) | Description |
| :--- | :--- | :--- |
| **Professional Communications** | `communications/*.md` | One or more simulated emails, chat messages, or meeting notes from a fictional manager, stakeholder, or client. Must read as authentic workplace communication. |
| **PRD (Product Requirements Document)** | `prd.md` | A concise document defining the problem, goals, success criteria, scope, and constraints — mirroring a real-world PRD or design brief. |
| **Assets** | `assets/` | Supporting files: wireframes, design mocks, reference screenshots, brand guidelines, or any image the learner should reference while working. |
| **Starter Files** | `starter/` | An initial codebase, boilerplate, template, or set of partial files the learner builds upon. May be an empty scaffold for open-ended projects. |
| **Content (Ticket / Assignment)** | `content.md` | The core assignment description, written as a Jira ticket, GitHub Issue, or work order. Includes acceptance criteria in checkbox format. |

### Frontmatter for Independent Projects

#### Project Hub (`index.md`)
```yaml
---
title: "Project Display Name"
description: "One-sentence summary of what the project builds or solves."
difficulty: "Beginner | Intermediate | Advanced"
skills:
  - "Skill or technology exercised"
estimated_hours: 4
domain: "WebDev | Networking | ..."
---
```

#### Ticket / Assignment (`content.md`)
```yaml
---
title: "Ticket Title (e.g., PROJ-42: Build Responsive Landing Page)"
type: "Independent Project"
status: "Open"
priority: "Medium | High | Critical"
estimated_hours: 4
---
```

### Project Hub Structure (`index.md`)

```markdown
# [Project Title]

> **Assignment Brief:** One or two sentences describing the fictional scenario and what you have been asked to deliver.

## Background
Context about the fictional company, team, or client. Makes the scenario feel real.

## Your Task
A plain-language summary of what the learner must build or deliver.

## What You'll Practice
- Skill or technology 1
- Skill or technology 2

## Project Files
- 📧 [Kickoff Communications](./communications/01_kickoff_email.md)
- 📄 [PRD](./prd.md)
- 🖼 [Assets](./assets/)
- 🗂 [Starter Files](./starter/)
- 🎫 [Assignment Ticket](./content.md)

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

### Content (Ticket) Structure (`content.md`)

Write this file as a Jira ticket or GitHub Issue. Do **not** write it as a lesson.

```markdown
# [PROJ-XX: Ticket Title]

**Priority:** Medium  
**Estimate:** 4 hours  
**Reporter:** [Fictional manager name], Engineering Manager  
**Assignee:** You

---

## Description
Brief, professional description of the task — written as a colleague would write it, not as a teacher.

## Acceptance Criteria
- [ ] The page renders correctly on mobile (≤ 375px) and desktop (≥ 1280px).
- [ ] All images include descriptive `alt` text.
- [ ] The HTML validates with zero errors on the W3C validator.

## Out of Scope
- Backend integration
- User authentication

## Notes / References
- See the attached PRD for full requirements.
- Design mocks are in `/assets/design_mock.png`.
```

### PRD Structure (`prd.md`)

```markdown
# Product Requirements Document: [Feature / Project Name]

**Version:** 1.0  
**Author:** [Fictional PM or stakeholder name]  
**Status:** Approved

---

## Problem Statement
What problem does this project solve, and for whom?

## Goals & Success Metrics
| Goal | Success Metric |
| :--- | :--- |
| Goal 1 | Measurable outcome |

## Scope
### In Scope
- Feature or deliverable 1

### Out of Scope
- Excluded work

## Requirements
### Functional Requirements
- FR-01: ...

### Non-Functional Requirements
- NFR-01: Performance, accessibility, or other constraints

## Constraints & Assumptions
- Any known limitations or assumptions

## Open Questions
- Questions that would realistically exist in a real project
```

### Professional Communications Guidelines

Simulated communications must feel genuine. Follow these rules:

- **Use realistic names** for fictional personas (manager, PM, client) — be consistent across a project.
- **Mimic real formats:** Emails have Subject, From, To, Date, and a professional sign-off. Slack messages are short, informal, and may use emoji sparingly.
- **Provide just enough context** — do not over-explain or insert tutorial language. The learner should have to read between the lines as a real professional would.
- **Do not spoil the solution** in the communications. They frame the problem; they do not solve it.

> **Example — Kickoff Email:**
>
> ```
> From: Sarah Chen <s.chen@pixelforge.io>
> To: dev-team@pixelforge.io
> Subject: 🚀 PROJ-42: Landing page refresh — kicking off this week
>
> Hey team,
>
> Quick note: marketing needs the new landing page live before the product launch on the 28th.
> I've attached the PRD and the Figma mocks. Let me know if you have questions — I'm available
> for a 15-min sync Thursday afternoon if needed.
>
> Key ask: mobile-first, and make sure it clears the accessibility audit we discussed last sprint.
>
> Thanks,
> Sarah
> ```

---

## 9. Writing Style Guide

| Principle | Rule |
| :--- | :--- |
| **Voice** | Direct and professional. Write to the learner: use "you." |
| **Jargon** | Define every technical term on first use. Bold the term. |
| **Sentence Length** | Prefer short sentences. Max ~25 words before breaking. |
| **Analogies** | Required for any concept that cannot be directly observed. |
| **Passive Voice** | Avoid. Prefer "The server sends a response" over "A response is sent." |
| **Placeholders** | Forbidden. Never write "content goes here" or "TBD." |
| **Scope Creep** | Each lesson teaches ONE concept. Split if necessary. |
| **ASCII Art** | **Forbidden.** Never use ASCII diagrams (`───`, `│`, `▼`, box-drawing characters). |
| **Diagrams** | Use **Mermaid** (for flow/sequence/graph logic) or **SVG** (for spatial/architectural layouts). SVG is preferred for anything that benefits from precise layout or styling. Save SVG files in the global `Assets/Images/<course>/<topic>/` folder and reference with a root-relative or relative path. Every lesson that explains a flow, structure, architecture, or anatomy **must** include at least one diagram. |

### Visual Content Standards

Every lesson should ask: *"Is there a concept here that a picture makes clearer than words alone?"* If yes, a diagram is required.

**Always diagram:**
- Any multi-step process or flow (request-response, DNS resolution, page load)
- Any architecture with multiple named components (client-server, load balancer, CDN)
- Any structure with labeled parts (URL anatomy, HTTP message structure)
- Any layered model (Internet vs Web, HTML/CSS/JS layers)

**Diagram types by use case:**

| Use Case | Preferred Format |
| :--- | :--- |
| Flow (A → B → C) | SVG or Mermaid `graph TD` |
| Sequence (time-ordered back-and-forth) | Mermaid `sequenceDiagram` |
| Architecture (components and relationships) | SVG |
| Anatomy (labeled parts of a thing) | SVG |
| Concept illustration (making abstract ideas tangible, human, engaging) | AI-generated image |
| Comparison / taxonomy | Markdown table (no diagram needed) |

**Two visual tracks:**

- **SVG** — use for technical diagrams that require precision, labels, and editability. Save to `Assets/Images/<course>/<topic>/`. Reference: `![alt](../path/to/diagram.svg)`
- **AI-generated image** — use for conceptual illustrations that make lessons feel human and engaging (e.g., a server room, a person debugging, an abstract network). Generate with the image tool, copy to `Assets/Images/<course>/<topic>/`, and reference in markdown. Use for section openers or to break up dense technical text.

**Rule of thumb:** If it needs labels and arrows → SVG. If it should *feel* like something → AI image.

**SVG style conventions:**
- Use `viewBox` and no fixed `width`/`height` so diagrams scale responsively
- Font: `system-ui, -apple-system, sans-serif`
- Arrow color: `#6b7280` (neutral gray)
- Use distinct fill colors per node type (blue = client, amber = gateway/proxy, green = server/backend)
- Always include a descriptive `alt` text in the markdown reference

---

## 10. Difficulty Labeling

Label every piece of content consistently.

| Label | Assumes | Example Content |
| :--- | :--- | :--- |
| **Beginner** | No prior IT knowledge | What is a URL? What is an IP address? |
| **Intermediate** | Comfort with Beginner concepts | How does DNS resolution work? |
| **Advanced** | Hands-on experience | Designing a load-balanced architecture |

---

## 11. Quick Checklist Before Saving Any File

- [ ] Frontmatter is present and complete
- [ ] All technical terms are **bolded** on first use and defined
- [ ] Every abstract concept has at least one **Example** block
- [ ] At least one **💡 Tip** or **⚠️ Warning** is present where relevant
- [ ] No spelling errors, no placeholder text
- [ ] File is named `00_lowercase_underscores` with correct numeric prefix
- [ ] The lesson is scoped to ONE concept
- [ ] Complexity is appropriate to depth layer (see §12)

---

## 12. Pedagogical Philosophy

This platform targets **deep understanding, not pattern copying.** Learners should be able to reason about systems, not just follow recipes.

### Core Principle: Progressive Complexity
Start with a simplified, working mental model. Then incrementally add real complexity, edge cases, and "under the hood" detail. Never lead with the enterprise-level or fully-optimized version of a concept.

> **Example:** Introduce an HTML document as "a file the browser reads" before explaining it as a tree of nested nodes (the DOM). Both are true — but the second requires the first to land.

### Depth Layers
Every concept passes through three layers, across separate lessons or sections:

| Layer | Goal | Tone |
| :--- | :--- | :--- |
| **1 — High Level** | Build the mental model. Analogies, big picture. | Accessible, no jargon |
| **2 — How It Works** | Explain the mechanism. What actually happens. | Precise, still friendly |
| **3 — Under the Hood** | Expose the internals. Data structures, protocols, specs. | Technical, rigorous |

Do not skip Layer 1 to get to Layer 3 faster. Learners who skip Layer 1 become pattern-copiers.

### Cognitive Load Rules

| Practice Area | Mandatory | Prohibited |
| :--- | :--- | :--- |
| **Content Formatting** | Strict hierarchies, bullet points, semantic code blocks. | Decorative images, tangential anecdotes, cluttered layouts. |
| **Pacing & Flow** | If a learner is blocked, offer a parallel unblocked task in the same domain. | Forcing strict linear progression when it creates a bottleneck. |
| **Feedback Design** | Explain *why* an error occurs based on the likely mistake. | Giving the final answer immediately on failure. Generic "incorrect" messages. |
| **Complex Systems** | Start with a simplified functioning model, then add complexity and edge cases. | Introducing the fully-optimized or enterprise solution before the basic mechanism is understood. |

### Analogy Policy
- Every concept that cannot be directly observed **requires** an analogy.
- Analogies must be retired once the technical vocabulary is established — don't let the analogy become a crutch.
- When the real mechanism differs from the analogy, **say so explicitly** and explain the difference.

---

## 13. AI Authoring Workflow

When creating or restructuring content, always follow this sequence. **Never skip ahead without explicit user approval.**

### Step 1 — Plan (Structural Outline)
Present the full directory/file tree with names, numbering, and a one-line description of each file. Wait for approval.

### Step 2 — Stub (Frontmatter + Skeleton)
Create files with valid frontmatter and section headings only. No prose content yet. Wait for approval or a signal to expand.

### Step 3 — Expand (One File at a Time)
Write full content for one file at a time. Use progressive expansion within each file: introduce the Layer 1 (high-level) content first, then seek approval before adding Layer 2/3 depth.

### Rules
- **Never output multiple fully-written files in a single response.**
- **Always present a plan and wait for approval before creating files.**
- When in doubt about scope, ask — don't assume.
- Stubs are always preferable to placeholders. A stub has real structure; a placeholder has fake content.
