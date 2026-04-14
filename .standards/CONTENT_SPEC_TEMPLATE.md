# Content Spec Template

> Use this for scoping individual content items (lessons, units, articles, projects).
> For full platform features, use [[.prds/PRD_TEMPLATE.md]] instead.
> Copy this file to `.specs/` (if a data model is involved) or keep it in `.tasks/` as a planning artifact.

---

## Metadata

| Field | Value |
|-------|-------|
| **Spec ID** | SPEC-XXX |
| **Content Type** | lesson / unit / article / project |
| **Title** | |
| **Slug** | `domain_NN_unit_slug_NN_lesson_slug` |
| **Task ID** | TASK-XXX |
| **Assigned Agent** | lesson-author / article-writer / project-designer |
| **Status** | PLANNED → KNOWLEDGE_READY → OUTLINED → DRAFTED → IN_REVIEW → APPROVED → PUBLISHED |
| **Created** | YYYY-MM-DD |

---

## Parent Context

| Field | Value |
|-------|-------|
| **Parent Unit / Course** | |
| **Pathway** | |
| **Position in sequence** | Lesson N of M in unit |
| **Prerequisite content** | |

---

## Knowledge Base

| Field | Value |
|-------|-------|
| **Knowledge node(s)** | `.knowledge/{domain}/{file}.md` |
| **terminal_objective.concept** | Copy from knowledge doc |
| **terminal_objective.practical_application** | Copy from knowledge doc |
| **Gap status** | COVERED / CRITICAL GAP / HIGH GAP |

---

## Learning Design

| Field | Value |
|-------|-------|
| **Bloom level** | 3 (Apply) / 4 (Analyze) / 5 (Evaluate) / 6 (Create) |
| **Learning objective** | "By the end of this lesson, learners will be able to..." |
| **Duration target** | NN minutes |
| **MDX components needed** | QuizBox / TerminalEmulator / CodeSandbox / Callout / ProgressCheck / ResourceList |

---

## Acceptance Criteria

- [ ] Frontmatter complete and valid
- [ ] Learning objective measurable at declared Bloom level
- [ ] Every concept paired with a code example or exercise
- [ ] Passes [[.standards/checklist_content_review.md]]
- [ ] catalog.json entry added or updated

---

*Template version: 1.0 | Source: [[.standards/CONTENT_SPEC_TEMPLATE.md]]*
