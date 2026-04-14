---
description: "Full course design pipeline: knowledge check → curriculum architect schema → LXD pacing review → output course schema JSON"
---

# New Course Design

Design a new course for: **$course_title** in domain **$domain**.

## Steps

1. **Read objectives** — Read `.objectives/pathways.md`. Confirm this course fits an approved pathway node. If it doesn't map to an existing node, flag this for the curriculum-architect to assess.

2. **Knowledge audit** — Read `.knowledge/map.json` and `.knowledge/validation/gap-analysis.md`. List all CRITICAL and HIGH gaps relevant to this course's topic area. These become blockers or research tasks.

3. **Design course schema** — Use `@curriculum-architect` to produce `Content/Courses/{domain}/{course_slug}.schema.json` with:
   - `course_id`, `title`, `description`, `domain`, `difficulty`, `estimated_hours`
   - `skills_required` — must reference skills granted by prerequisite courses
   - `skills_granted` — new skills this course confers
   - `units` — ordered array of unit stubs with `unit_id` and `title`

4. **Pacing review** — Use `@learning-experience-designer` to review the unit sequence. Check for:
   - Difficulty curve (no sudden jumps)
   - Estimated hours distribution across units
   - Correct Bloom level progression
   - Entry/exit criteria clearly implied by the unit sequence

5. **Flag blockers** — List any knowledge gaps that must be filled before specific units can be authored. Create corresponding TASK entries in `.tasks/sprint-backlog.json`.

6. **Update catalog.json** — Add a course entry to `Content/catalog.json`.

## Output

- `Content/Courses/{domain}/{course_slug}.schema.json`
- Updated `Content/catalog.json`
- LXD pacing notes in `.designs/lxd_brief_{course_slug}.md`
- New research tasks added to `.tasks/sprint-backlog.json` if gaps found
