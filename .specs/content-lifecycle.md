# Content Lifecycle Protocol

> Authoritative definition of the content item lifecycle.
> Every content item must move through these states in order.
> State is tracked in `.tasks/sprint-backlog.json` per task.

---

## States

```
PLANNED → KNOWLEDGE_READY → OUTLINED → DRAFTED → IN_REVIEW → APPROVED → PUBLISHED
```

| State | Entry Condition | Responsible Agent | Output |
|-------|----------------|-------------------|--------|
| `PLANNED` | Task created in sprint-backlog.json | Any | Task entry in backlog |
| `KNOWLEDGE_READY` | Relevant `.knowledge/` node exists or was created | `research-analyst` | `.knowledge/` doc registered in map.json |
| `OUTLINED` | Lesson plan JSON produced | `lesson-planner` | `{unit_id}_lesson_plan.json` in `/Content/` |
| `DRAFTED` | Full content file written | `lesson-author` / `article-writer` / `project-designer` | `.md` file in `/Content/` |
| `IN_REVIEW` | Draft submitted for quality check | `content-editor` | Edit pass; inline `<!-- EDITOR: -->` comments |
| `APPROVED` | Passes all items in `.standards/checklist_content_review.md` | `content-editor` | Checklist signed off |
| `PUBLISHED` | Passes `.standards/checklist_publish.md`; `catalog.json` updated; `sidebars.ts` updated | `content-editor` / `platform-engineer` | File live; task moved to DONE |

---

## Transition Rules

- A task may NOT skip states — every state must be completed in order
- `KNOWLEDGE_READY` may be skipped only if the knowledge node already existed before the task was created
- `OUTLINED` is required for lessons. It is optional for articles and projects (which have their own spec templates)
- A task in `IN_REVIEW` may move back to `DRAFTED` if the content-editor finds issues requiring the original author to revise
- `PUBLISHED` is a one-way gate — reverting a published item requires a new task

---

## State in sprint-backlog.json

The `status` field on each backlog item tracks lifecycle state:

```json
{ "task_id": "TASK-018", "status": "IN_PROGRESS" }
```

`IN_PROGRESS` is used during active work within any lifecycle state. The lifecycle state is the semantic meaning; IN_PROGRESS is the operational flag.

Working mapping:
- `PLANNED` → not yet started
- `IN_PROGRESS` → currently being worked (maps to OUTLINED, DRAFTED, or IN_REVIEW)
- `DONE` → task is PUBLISHED and closed

---

*Spec version: 1.0 | Last updated: 2026-04-14*
