# IT EDU SITE — Workspace Instructions

These instructions are automatically loaded into every agent session. Read this before acting on any task.

---

## 1. Project Overview

**IT EDU SITE** is a free, open-source IT education platform. Learners follow structured learning pathways from zero knowledge to job-ready skills. The platform is built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and MDX, deployed to Netlify.

**Stack:**
- Content layer: `/Content/` — Markdown + YAML frontmatter files (the source of truth)
- Site layer: `/web/` — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4; content consumed at build time via `web/lib/content.ts`
- Knowledge base: `/.knowledge/` — machine-optimized research graph backing curriculum generation
- Build/deploy: `netlify.toml` → builds `web/`, uses `@netlify/plugin-nextjs`

**Do not confuse the content layer with the site layer.** Content authors never touch `/web/`. Platform engineers never touch `/Content/`.

**`/site/` (Docusaurus — DEPRECATED).** This folder is the old Docusaurus 3.10 site. It is kept as a reference only and will be deleted once the Next.js site is verified in production. Do not add anything to `/site/`.

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
| `curriculum-architect` | `/Content` (schemas, indexes) | `.knowledge/`, `.objectives/` | `/web/`, `/site/` |
| `lesson-planner` | `/Content` (lesson plan JSON) | `.knowledge/`, `/Content` | `/web/`, `/site/` |
| `lesson-author` | `/Content/Lessons/`, `/Content/Units/` | `.knowledge/`, `/Content` | `/web/`, `/site/` |
| `article-writer` | `/Content/Articles/` | `.knowledge/` | `/web/`, `/site/`, `/Content/Lessons/` |
| `project-designer` | `/Content/Projects/` | `/Content/Courses/`, `/Assets/Starter/` | `/web/`, `/site/` |
| `content-editor` | `/Content/` | `/Content/` | `/web/`, `/site/` |
| `research-analyst` | `.knowledge/` | `/Content/` | `/web/`, `/site/` |
| `learning-experience-designer` | `.objectives/`, `.designs/` | `/Content/`, `.knowledge/` | `/web/`, `/site/`, `/Content/` (edit) |
| `ui-component-engineer` | `/web/components/`, `/web/app/globals.css` | `/Content/` | `/Content/` (edit), `/site/` |
| `platform-engineer` | `/web/`, `netlify.toml` | `/Content/` | `/Content/` (edit) |

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

---

## 12. Accessibility Standards — AODA Compliance

### Legal Basis

**IT EDU SITE must comply with the Accessibility for Ontarians with Disabilities Act (AODA), S.O. 2005, c. 11.** The AODA is Ontario legislation that establishes enforceable standards to achieve a barrier-free Ontario for persons with disabilities by January 1, 2025. Non-compliance can result in administrative penalties of up to $100,000/day for corporations.

The web-content obligation flows from the **Integrated Accessibility Standards Regulation (IASR), Ontario Reg. 191/11**: 
- **Section 14** — Information and Communications Standard: all internet and intranet websites and web content must conform to **WCAG 2.0 Level AA** (with limited exceptions for live captions and pre-recorded audio descriptions).
- **Section 12** — Training: all staff and volunteers involved in web content must receive accessibility training.

We target **WCAG 2.1 Level AA** as our implementation standard — a superset of WCAG 2.0 AA that satisfies the legal requirement while covering modern device and interaction patterns.

**Compliance timeline reference (private-sector organizations, Ontario):**
| Organization size | New web content | All web content |
|--|--|--|
| Large (50+ employees) | January 1, 2014 | January 1, 2021 |
| Small (1–49 employees) | January 1, 2014 | January 1, 2021 |

IT EDU SITE is a public-facing platform and must meet the full standard for all content.

---

### WCAG 2.1 AA — The Four Principles (POUR)

All web content must be **Perceivable**, **Operable**, **Understandable**, and **Robust**.

#### Principle 1 — Perceivable
Information and UI components must be presentable to users in ways they can perceive.

| SC | Level | Requirement | Platform impact |
|--|--|--|--|
| 1.1.1 Non-text Content | A | All non-text content has a text alternative | `alt` on `<img>`, `<title>`+`<desc>` on SVGs, `aria-label` on icon buttons |
| 1.2.1 Audio/Video only | A | Provide transcript or audio track equivalent | Any future video content |
| 1.2.2 Captions (prerecorded) | A | Captions for all prerecorded audio in synced media | Any future video content |
| 1.2.4 Captions (live) | AA | Captions for live audio | Exception in AODA s.14 — not required until technically feasible |
| 1.2.5 Audio Description | AA | Audio descriptions for prerecorded video | Exception in AODA s.14 — not required until technically feasible |
| 1.3.1 Info and Relationships | A | Structure conveyed through markup, not appearance alone | Semantic HTML; correct heading hierarchy; use `<table>` not CSS grids for data |
| 1.3.2 Meaningful Sequence | A | Reading order is correct in DOM order | No CSS-only layout reordering that contradicts visual order |
| 1.3.3 Sensory Characteristics | A | Instructions don't rely solely on shape, color, size, or position | "Click the red button" ✗ → "Click the Submit button" ✓ |
| 1.3.4 Orientation | AA | Content not locked to one display orientation | Do not restrict portrait/landscape via CSS or meta |
| 1.3.5 Identify Input Purpose | AA | Input fields identify their purpose | Use correct `autocomplete` attribute values on all form inputs |
| 1.4.1 Use of Color | A | Color is not the only visual means of conveying info | Always pair color with a label, icon, or pattern |
| 1.4.3 Contrast (Minimum) | AA | Normal text ≥ 4.5:1; Large text ≥ 3:1 | See Design Token Constraints below |
| 1.4.4 Resize Text | AA | Text can be resized to 200% without loss of content/functionality | Use `rem`/`em` units; never `px` for font sizes |
| 1.4.5 Images of Text | AA | Use actual text rather than images of text | Render all text as DOM text; logos are the only exception |
| 1.4.10 Reflow | AA | No horizontal scrolling at 320px width (400% zoom) | All layouts must be single-column responsive at 320px |
| 1.4.11 Non-text Contrast | AA | UI components and graphical objects ≥ 3:1 against adjacent colors | Borders on inputs, SVG diagram elements, chart lines |
| 1.4.12 Text Spacing | AA | No loss of content when line-height, letter-spacing, word-spacing are overridden | Do not use `overflow: hidden` on fixed-height text containers |
| 1.4.13 Content on Hover/Focus | AA | Tooltip/popover content is hoverable, dismissible (Esc), and persistent | Any custom tooltips built for lessons |

#### Principle 2 — Operable
UI components and navigation must be operable by all users.

| SC | Level | Requirement | Platform impact |
|--|--|--|--|
| 2.1.1 Keyboard | A | All functionality available via keyboard alone | No mouse-only interactions; custom components need keyboard handlers |
| 2.1.2 No Keyboard Trap | A | Keyboard focus is never trapped (except intentional dialogs) | Modal dialogs must implement focus trap + Esc to close |
| 2.2.1 Timing Adjustable | A | Users can extend or disable time limits | No timed quiz auto-submit without warning and extension option |
| 2.2.2 Pause, Stop, Hide | A | Users can pause/stop/hide moving or auto-updating content | Any animated lesson diagrams must have a pause control |
| 2.3.1 Three Flashes | A | No content flashes more than 3 times per second | Never add rapidly flashing animations |
| 2.4.1 Bypass Blocks | A | A mechanism to skip repeated navigation blocks | `<a href="#main-content" className="sr-only focus:not-sr-only">` skip link at top |
| 2.4.2 Page Titled | A | Pages have descriptive titles | `<title>` must uniquely identify the page: `"Lesson Title — IT EDU SITE"` |
| 2.4.3 Focus Order | A | Focus order preserves meaning and operability | DOM order must match logical reading order |
| 2.4.4 Link Purpose | A | Purpose of each link is clear from link text or context | No bare "click here" or "read more" links |
| 2.4.5 Multiple Ways | AA | Multiple ways to find content (search, site map, or navigation) | Search bar and breadcrumb navigation required |
| 2.4.6 Headings and Labels | AA | Headings and labels describe topic or purpose | Every page section needs a descriptive heading; no skipped heading levels |
| 2.4.7 Focus Visible | AA | Keyboard focus indicator is always visible | `outline` must never be `none` without a visible replacement |
| 2.5.3 Label in Name | A | Accessible name contains the visible label text | No icon buttons where `aria-label` is unrelated to visible text |

#### Principle 3 — Understandable
Content and UI operation must be understandable.

| SC | Level | Requirement | Platform impact |
|--|--|--|--|
| 3.1.1 Language of Page | A | Default human language of page declared | `<html lang="en">` on every page |
| 3.1.2 Language of Parts | AA | Language of passages or phrases that differ declared | Wrap non-English content in `<span lang="fr">` etc. |
| 3.2.1 On Focus | A | Receiving focus does not trigger unexpected context change | No auto-navigation or form submission on focus |
| 3.2.2 On Input | A | Changing a setting does not automatically change context | Form controls require explicit Submit; no auto-submit on select change |
| 3.2.3 Consistent Navigation | AA | Navigation repeated across pages appears in same order | Nav component must never change element order between pages |
| 3.2.4 Consistent Identification | AA | Components with same function are identified consistently | E.g., search icon must always have same `aria-label` |
| 3.3.1 Error Identification | A | Input errors are described in text | Never use color alone; always include text error message |
| 3.3.2 Labels or Instructions | A | Labels or instructions for user input | All form inputs have a visible `<label>` or `aria-label` |
| 3.3.3 Error Suggestion | AA | Suggestions provided for detected input errors where possible | Tell the user what to fix, not just that something is wrong |
| 3.3.4 Error Prevention | AA | Legal/financial/data-deleting actions are reversible or confirmed | Any account deletion requires confirmation step |

#### Principle 4 — Robust
Content must be robust enough for current and future assistive technologies.

| SC | Level | Requirement | Platform impact |
|--|--|--|--|
| 4.1.1 Parsing | A | No duplicate IDs; no unclosed elements | Validate HTML at build time; React enforces this |
| 4.1.2 Name, Role, Value | A | All UI components have correct name, role, state | Custom components must use ARIA roles/properties |
| 4.1.3 Status Messages | AA | Status messages conveyed without receiving focus | Toast notifications must use `role="status"` or `aria-live` |

---

### SVG-Specific AODA Requirements

SVG is a first-class content format on this platform. It has unique accessibility obligations:

| Requirement | Rule |
|--|--|
| **Always opaque background** | Every SVG must contain a `<rect>` as its first shape element covering the full `viewBox`. Never rely on the page background bleeding through — SVGs may be rendered in contexts (print, dark mode, screenshots) where transparency is lost. |
| **Text alternative** | Informational SVGs require `role="img"`, `<title id>`, `<desc id>`, and `aria-labelledby` on root. Decorative SVGs (used purely for visual flourish) must have `aria-hidden="true"` and no `<title>`. |
| **Non-text contrast** | All graphical elements (lines, arrows, borders, filled shapes) must achieve ≥ **3:1** against the SVG background (WCAG 1.4.11). |
| **Text contrast** | All text rendered inside SVG must achieve ≥ **4.5:1** against its immediate background (WCAG 1.4.3). |
| **No color-only meaning** | Labels, patterns, or shape differences must accompany any color-coded data. |
| **Dark-mode support** | Embed `prefers-color-scheme` media query in `<style>` — SVGs must be legible in both light and dark OS themes. |
| **Padding/safe zone** | All content must sit inside an **inset of ≥ 16px** from the `viewBox` edge to prevent clipping in browsers with sub-pixel rendering. |

---

### Contrast Minimums Quick Reference

| Text / Element type | Min ratio | WCAG SC |
|--|--|--|
| Normal text (< 18 pt regular / < 14 pt bold) | **4.5 : 1** | 1.4.3 AA |
| Large text (≥ 18 pt regular or ≥ 14 pt bold) | **3 : 1** | 1.4.3 AA |
| UI components (borders, icons, focus rings) | **3 : 1** | 1.4.11 AA |
| SVG graphical objects (lines, arrows, fills) | **3 : 1** | 1.4.11 AA |
| Inactive / disabled UI (exempt) | no minimum | — |
| Logotypes (exempt) | no minimum | — |

**WCAG contrast formula:** $\text{ratio} = \dfrac{L_1 + 0.05}{L_2 + 0.05}$ where $L_1 > L_2$ and $L$ is relative luminance computed from linearized sRGB.

---

### Design Token Constraints

All colour tokens in `web/app/globals.css` **must** pass the ratios above against every background they appear on. Current verified values:

| Token | Light value | Dark value | Notes |
|--|--|--|--|
| `--color-foreground` | `#0f172a` | `#f1f5f9` | ✓ passes on all backgrounds |
| `--color-muted` | `#475569` | `#94a3b8` | ✓ 7.2:1 on `#f8fafc`; do **not** revert to `#64748b` (was 4.1:1 — fails) |
| `--color-primary` | `#2563eb` | `#60a5fa` | ✓ passes on surface backgrounds |

---

### Rules for Platform and UI Engineers
- **Never** change a design token without verifying the new contrast ratio.
- Use the WCAG contrast formula above; recommended tools: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), [Colorable](https://colorable.jxnblk.com/).
- All new components in `/web/components/` must meet WCAG 2.1 AA before merging.
- Focus indicators must be visible — `outline: none` is forbidden without a replacement (e.g., `box-shadow` or `ring` utility).
- Interactive elements must be keyboard-navigable with correct ARIA roles, states, and properties.
- Every page must include a skip-link as the first focusable element: `<a href="#main-content">Skip to main content</a>` styled with `sr-only focus:not-sr-only`.
- Font sizes must use `rem` units so OS-level text zoom is preserved.
- Validate heading hierarchy per page — no skipped levels (h1 → h3 with no h2 is a violation).
