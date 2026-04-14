# IT EDU SITE — Workspace Instructions

These instructions are automatically loaded into every agent session. Read this before acting on any task.

---

## 1. Project Overview

**IT EDU SITE** is a free, open-source IT education platform. Learners follow structured learning pathways from zero knowledge to job-ready skills. The platform is built with Docusaurus 3.10, React 19, TypeScript, and MDX, deployed to Netlify.

**Stack:**
- Content layer: `/Content/` — Markdown + YAML frontmatter files (the source of truth)
- Site layer: `/site/` — Docusaurus 3.10, React 19, TypeScript; content consumed at build time
- Knowledge base: `/.knowledge/` — machine-optimized research graph backing curriculum generation
- Build/deploy: `netlify.toml`, Docusaurus static output

**Do not confuse the content layer with the site layer.** Content authors never touch `/site/`. Platform engineers never touch `/Content/`.

---

## 2. Content Directory Map

```
Content/
  Articles/       type: article    — standalone editorial/explainer content
  Courses/        type: course     — discipline curricula (has units)
  Lessons/        type: lesson     — individual lessons (flat, named by ID)
  Units/          type: unit       — topic cluster containing lessons; may have sub-units
  Pathways/       type: pathway    — ordered sequence of courses
  Projects/       type: project    — capstone deliverables
  catalog.json                     — indexed registry of ALL content items
```

**Content graph hierarchy:**
```
Pathway → Course → Unit → (Sub-Unit) → Lesson
                                      ↘ Project (capstone)
Article (standalone)
```

---

## 3. Frontmatter Schema Per Content Type

Every content file MUST include valid YAML frontmatter. Required fields per type:

### lesson
```yaml
type: lesson
title: "Title ≤60 chars"
description: "Elevator pitch ≤160 chars"
duration_minutes: 15
difficulty: Beginner | Intermediate | Advanced
tags: [tag1, tag2]
```

### unit
```yaml
type: unit
title: "Title"
description: "Description ≤160 chars"
domain: "WebDev"
difficulty: Beginner | Intermediate | Advanced
prerequisites: ["None" | "unit_slug"]
learning_objectives:
  - "By the end of this unit, learners will be able to..."
references:
  - type: lesson
    slug: lesson_slug
```

### course
```yaml
type: course
title: "Course Title"
description: "Description ≤160 chars"
domain: "WebDev"
difficulty: Beginner | Intermediate | Advanced
tags: [tag1, tag2]
estimated_hours: 60
references:
  - type: unit
    slug: unit_slug
```

### pathway
```yaml
type: pathway
title: "Pathway Title"
description: "Description ≤160 chars"
difficulty: Beginner | Intermediate | Advanced
estimated_hours: 105
tags: [tag1, tag2]
references:
  - type: course
    slug: course_slug
```

### article
```yaml
type: article
title: "Title ≤60 chars"
description: "Description ≤160 chars"
tags: [tag1, tag2]
author: "Author Name"
published_date: "YYYY-MM-DD"
```

### project
```yaml
type: project
format: build | ticket   # build = client brief/full build; ticket = sprint ticket assignment
title: "Project Title"
description: "Description ≤160 chars"
difficulty: Beginner | Intermediate | Advanced
estimated_hours: 10
tags: [tag1, tag2]
references:
  - type: course
    slug: course_slug
```

**Projects simulate a real job environment.** They are written in the voice of a fictional company — emails, tickets, conversation threads, and attached assets. The learner is a new employee or contractor, not a student completing an exercise. See `.github/agents/project-designer.agent.md` for full format rules.

**Project folder structure:**
```
Content/Projects/{slug}/
  index.md        ← frontmatter + company background + file navigation
  brief.md        ← (build) email/letter from fictional client or manager
  TICKET-NNN.md   ← (ticket) one file per ticket in Jira/GitHub Issues format
  checklist.md    ← acceptance criteria / definition of done
  rubric.md       ← scoring rubric
  assets/         ← provided files: mockups, data, copy, screenshots
  starter/        ← starter code the learner works within
```

---

## 4. File Naming Convention

### Lessons (flat files in `Content/Lessons/`)
Pattern: `{domain}_{unit_number:02d}_{unit_slug}_{lesson_number:02d}_{lesson_slug}.md`
Example: `webdev_01_html_03_text_elements.md`

### Units (folders in `Content/Units/`)
Pattern: `{domain}_{unit_number:02d}_{unit_slug}/`
Example: `webdev_01_html/`

### Articles (files in `Content/Articles/`)
Pattern: `{topic_slug}.md`
Example: `internet_vs_web.md`

### Projects (folders in `Content/Projects/`)
Pattern: `{domain}_{course_slug}_capstone/`
Example: `webdev_capstone_portfolio/`

---

## 5. catalog.json — Update Protocol

`Content/catalog.json` is the indexed registry of all content items. Every time a content file is created or meaningfully updated, its entry in `catalog.json` must be updated (or added).

**Entry schema:**
```json
{
  "slug": "webdev_01_html_03_text_elements",
  "type": "lesson",
  "title": "Text Elements",
  "description": "Short description ≤160 chars",
  "path": "Content/Lessons/webdev_01_html_03_text_elements.md",
  "tags": ["html", "text"],
  "difficulty": "Beginner",
  "domain": "WebDev",
  "estimated_hours": 0.25,
  "author": "IT EDU SITE",
  "published_date": "YYYY-MM-DD"
}
```

**Rules:**
- `slug` must be unique across ALL types
- `path` is workspace-relative
- `type` must match the frontmatter `type` of the referenced file
- Do not remove entries without checking `sidebars.ts` and any `references` arrays pointing to the slug

---

## 6. MDX Component Whitelist

Lesson and unit body files may use ONLY the following MDX component tags. Do not invent new components or write raw HTML beyond basic Markdown:

| Component | Purpose |
|--|--|
| `<QuizBox />` | Inline knowledge check |
| `<TerminalEmulator />` | Simulated terminal interaction |
| `<CodeSandbox />` | Embedded code playground |
| `<Callout type="tip" />` | Styled tip/note box |
| `<Callout type="warning" />` | Styled warning box |
| `<Callout type="danger" />` | Styled danger/error box |
| `<ProgressCheck />` | Unit completion self-assessment |
| `<ResourceList />` | Curated further reading list |

New components must be approved and built by the `ui-component-engineer` agent before any content agent can reference them.

---

## 7. Skills Taxonomy Format

Courses use `skills_required` (prerequisites) and `skills_granted` (outcomes) arrays. Format: `domain:skill_id`

```json
{
  "skills_required": [],
  "skills_granted": [
    "git:init_repo",
    "git:add_commit",
    "webdev:async_js"
  ]
}
```

**Rules:**
- Every skill in `skills_required` must be granted by at least one other course in the system
- No orphaned skills — the `curriculum-architect` agent owns the taxonomy
- Skill IDs use snake_case; domain prefix uses the primary domain identifier (e.g., `webdev`, `git`, `networking`)

---

## 8. Knowledge Base Entry Points

The `.knowledge/` folder is the Instructional Knowledge Engine — curated domain research backing curriculum generation.

**Entry points (in order of priority):**
1. `.knowledge/map.json` — Always read first. Full node graph and edge relationships.
2. `.knowledge/validation/gap-analysis.md` — Read before creating any new content. Check for CRITICAL gaps.
3. `.knowledge/{domain}/manifest.json` — Terminal objectives and educational asset templates for a domain.
4. Individual `.knowledge/{domain}/*.md` files — Deep knowledge on a specific topic.

**The `terminal_objective` YAML block in every research doc is authoritative:**
```yaml
terminal_objective:
  prerequisite: "What must be known first"
  concept: "Machine-readable concept definition"
  practical_application: "What the learner actually does"
  market_value: "Industry demand and employment relevance"
```

Use these fields directly as inputs when generating lesson content. Do not re-derive from prose.

---

## 9. Scope Rules Per Agent Role

| Agent | Can Write | Read-Only | Never Touches |
|--|--|--|--|
| `curriculum-architect` | `/Content` (schemas, indexes) | `.knowledge/`, `.objectives/` | `/site/` |
| `lesson-planner` | `/Content` (lesson plan JSON) | `.knowledge/`, `/Content` | `/site/` |
| `lesson-author` | `/Content/Lessons/`, `/Content/Units/` | `.knowledge/`, `/Content` | `/site/` |
| `article-writer` | `/Content/Articles/` | `.knowledge/` | `/site/`, `/Content/Lessons/` |
| `project-designer` | `/Content/Projects/` | `/Content/Courses/`, `/Assets/Starter/` | `/site/` |
| `content-editor` | `/Content/` | `/Content/` | `/site/` |
| `research-analyst` | `.knowledge/` | `/Content/` | `/site/` |
| `learning-experience-designer` | `.objectives/`, `.designs/` | `/Content/`, `.knowledge/` | `/site/`, `/Content/` (edit) |
| `ui-component-engineer` | `/site/src/components/`, `/site/src/css/` | `/Content/` | `/Content/` (edit) |
| `platform-engineer` | `/site/`, `netlify.toml` | `/Content/` | `/Content/` (edit) |

---

## 10. Content Item Lifecycle

Every content item moves through these states (tracked in `.tasks/sprint-backlog.json`):

```
PLANNED → KNOWLEDGE_READY → OUTLINED → DRAFTED → IN_REVIEW → APPROVED → PUBLISHED
```

| State | Meaning |
|--|--|
| PLANNED | Task exists in backlog, not yet started |
| KNOWLEDGE_READY | Relevant `.knowledge/` node exists or has been created |
| OUTLINED | Lesson plan JSON produced by `lesson-planner` |
| DRAFTED | Full content file written by `lesson-author` or `article-writer` |
| IN_REVIEW | Content editor reviewing; `content-audit` checklist running |
| APPROVED | Passes all review checklists |
| PUBLISHED | File live, `catalog.json` updated, `sidebars.ts` updated if needed |

---

## 11. Agile Workflow Files

| File | Purpose |
|--|--|
| `.tasks/sprint-current.json` | Active 2-week sprint definition |
| `.tasks/sprint-backlog.json` | Full machine-readable task backlog |
| `.tasks/tasks.md` | Human-readable kanban board |
| `.reviews/reports/` | Agent-generated audit and status reports |
| `.objectives/milestones.md` | Quarterly milestone definitions |
| `.objectives/pathways.md` | 7-node WebDev competency roadmap |

Use `/sprint-planning` prompt to start a sprint. Use `/sprint-review` prompt to close one.
