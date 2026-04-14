---
description: "Plan a new unit: produce a lesson plan JSON with objectives, sequence, and MDX flags for all lessons in the unit"
---

# New Unit Plan

Produce a lesson plan for unit: **$unit_slug** in course **$course_slug**.

## Steps

1. **Read course schema** — Read `Content/Courses/{domain}/{course_slug}.schema.json`. Find this unit in the `units` array. Confirm it exists.

2. **Read knowledge base** — Read `.knowledge/map.json` → find domain nodes relevant to this unit's topic. Read the relevant domain `manifest.json` for terminal objectives.

3. **Check gap-analysis** — Read `.knowledge/validation/gap-analysis.md`. Flag any CRITICAL gaps that affect this unit's topic. If gaps exist, note which lessons must wait for research docs.

4. **Produce lesson plan JSON** — Use `@lesson-planner` to produce `{unit_slug}_lesson_plan.json` in `Content/`. The JSON must include every lesson in the unit with:
   - `lesson_id`, `title`, `slug`
   - `duration_minutes` (target 10–20 min each)
   - `bloom_level` (≥3)
   - `learning_objective` ("By the end of this lesson, learners will be able to...")
   - `key_concepts`
   - `mdx_components` (from approved whitelist only)
   - `notes` (optional guidance for lesson-author)

5. **Validate sequence** — Check that each lesson builds on the previous. Flag any lesson that assumes knowledge not yet covered in this unit or its prerequisites.

## Output

- `Content/{unit_slug}_lesson_plan.json`
