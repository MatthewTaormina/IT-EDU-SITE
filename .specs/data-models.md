# Data Models

> Machine-readable schemas for all structured data files in the project.
> These are the authoritative contracts. Agents must not deviate from these shapes.

---

## 1. catalog.json — Content Registry Entry

**File:** `Content/catalog.json`
**Format:** JSON array of entries

```json
{
  "slug": "string — unique across ALL content types",
  "type": "pathway | course | unit | lesson | project | article",
  "title": "string — ≤60 chars",
  "description": "string — ≤160 chars",
  "path": "string — workspace-relative path to the file",
  "tags": ["string"],
  "difficulty": "Beginner | Intermediate | Advanced",
  "domain": "string — e.g. WebDev, Networking, Security, Python",
  "estimated_hours": "number",
  "author": "string — default: IT EDU SITE",
  "published_date": "YYYY-MM-DD"
}
```

**Rules:**
- `slug` is the primary key — never reuse a slug, even after deletion
- `path` is workspace-relative (e.g., `Content/Lessons/webdev_01_html_01_document_structure.md`)
- `type` must match the `type` field in the file's YAML frontmatter exactly

---

## 2. Course Schema — `{domain}_{course_slug}.schema.json`

**File:** `Content/Courses/{domain}/{course_slug}.schema.json`

```json
{
  "course_id": "string",
  "title": "string",
  "description": "string — ≤160 chars",
  "domain": "string",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimated_hours": "number",
  "skills_required": ["domain:skill_id"],
  "skills_granted": ["domain:skill_id"],
  "units": [
    { "unit_id": "string", "title": "string" }
  ]
}
```

---

## 3. sprint-current.json

**File:** `.tasks/sprint-current.json`

```json
{
  "sprint_id": "SPR-NNN",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "goal": "string — one sentence sprint goal",
  "velocity_target": "number — story points or task count",
  "tasks": [
    {
      "task_id": "TASK-NNN",
      "title": "string",
      "status": "PLANNED | IN_PROGRESS | IN_REVIEW | DONE",
      "assigned_agent": "agent-name | null",
      "content_items": ["array of file paths affected"],
      "blockers": ["string descriptions of blockers"]
    }
  ],
  "notes": "string — optional sprint notes"
}
```

---

## 4. sprint-backlog.json — Backlog Item

**File:** `.tasks/sprint-backlog.json`

```json
{
  "task_id": "TASK-NNN",
  "title": "string",
  "type": "content | platform | research | maintenance",
  "priority": "P0 | P1 | P2",
  "status": "PLANNED | KNOWLEDGE_READY | OUTLINED | DRAFTED | IN_REVIEW | APPROVED | PUBLISHED | IN_PROGRESS | DONE",
  "assigned_agent": "agent-name | null",
  "estimated_hours": "number",
  "dependencies": ["TASK-NNN"],
  "knowledge_nodes": ["array of .knowledge/ paths relevant to this task"],
  "prd_id": "PRD-slug | null",
  "milestone": "M-NN | P-NN | null"
}
```

---

## 5. Skills Taxonomy Entry

**Used in:** `Course schema skills_required` / `skills_granted` arrays

```
format: "domain:skill_id"
examples:
  - "webdev:async_js"
  - "git:branch_merge"
  - "networking:tcp_ip"
```

**Rules:**
- `domain` uses the primary domain prefix (webdev, git, networking, security, python)
- `skill_id` uses snake_case
- Every skill in `skills_required` must be `skills_granted` by at least one earlier course
- Owned by the `curriculum-architect` agent

---

## 6. Knowledge Base Node (`.knowledge/{domain}/{topic}.md`) — YAML Frontmatter

```yaml
---
title: "Topic Title"
domain: "domain-id"
tags: [tag1, tag2]
terminal_objective:
  prerequisite: "string — what must be known before this"
  concept: "string — machine-readable concept definition"
  practical_application: "string — what the learner actually does"
  market_value: "string — industry demand and employment relevance"
---
```

---

*Spec version: 1.0 | Last updated: 2026-04-14*
