---
description: "Full lesson creation pipeline: research check → lesson plan → write lesson → validate → update catalog"
---

# New Lesson

Create a complete lesson file for: **$lesson_topic** in unit **$unit_slug**.

## Steps

1. **Knowledge check** — Read `.knowledge/map.json`. Find the node for this topic. If no node exists, STOP and run `/new-research-node` first.

2. **Gap check** — Read `.knowledge/validation/gap-analysis.md`. If this topic is a CRITICAL gap without a research doc, STOP and run `/new-research-node` first.

3. **Read knowledge doc** — Read the relevant `.knowledge/{domain}/{topic}.md`. Extract the `terminal_objective` YAML block. These four fields are your lesson brief:
   - `prerequisite` → lesson prerequisites section
   - `concept` → core explanation section
   - `practical_application` → exercise/lab section
   - `market_value` → "why this matters" opening

4. **Check for lesson plan** — Look for `{unit_slug}_lesson_plan.json` in `/Content/`. If it exists, read the entry for this lesson and use it. If not, produce the lesson plan entry inline (title, slug, duration_minutes, bloom_level, learning_objective, mdx_components).

5. **Confirm file name** — Derive the file name: `{domain}_{unit_number:02d}_{unit_slug}_{lesson_number:02d}_{lesson_slug}.md`. Verify no file with this name already exists.

6. **Write the lesson** — Use `@lesson-author` to write the full lesson file at `Content/Lessons/{filename}`. Follow the lesson structure in `.github/copilot-instructions.md`.

7. **Validate frontmatter** — Run through `.standards/checklist_content_review.md`. Fix any issues.

8. **Update catalog.json** — Add the entry to `Content/catalog.json` with all required fields.

## Output

- New lesson file at `Content/Lessons/{slug}.md`
- Updated `Content/catalog.json`
