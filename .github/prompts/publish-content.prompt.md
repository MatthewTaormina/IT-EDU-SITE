---
description: "Publish gate: run checklist_publish.md against a content file → verify catalog + sidebars → output PASS or FAIL with blockers"
---

# Publish Content

Run the publish gate for: **$content_slug** (`$content_type` at `$file_path`).

## Steps

1. **Locate the file** — Confirm the file at `$file_path` exists. Read its frontmatter.

2. **Run publish checklist** — Read `.standards/checklist_publish.md`. Step through every item explicitly:

   **File naming:**
   - [ ] Follows the naming convention for its type (see `.github/copilot-instructions.md` Section 4)
   - [ ] No spaces, uppercase letters, or special characters in filename

   **Frontmatter completeness:**
   - [ ] All required fields present for this `type`
   - [ ] `title` within character limits
   - [ ] `description` within character limits
   - [ ] `difficulty` is a valid enum value (if required)
   - [ ] `duration_minutes` is a positive integer (lessons)
   - [ ] `tags` is a non-empty array

   **Catalog.json:**
   - [ ] Entry exists for this slug in `Content/catalog.json`
   - [ ] Catalog `path` matches the actual file location
   - [ ] Catalog `type` matches frontmatter `type`
   - [ ] Catalog `slug` matches the file stem

   **Cross-links and references:**
   - [ ] All `references` slugs resolve to existing catalog entries
   - [ ] All referenced files exist on disk
   - [ ] For courses/pathways: `skills_required` skills are granted by another course

   **Content quality:**
   - [ ] No MDX components outside the approved whitelist
   - [ ] No dead links in body text (spot-check)
   - [ ] Callout types are valid (`tip`, `warning`, `danger`)

   **Lifecycle state:**
   - [ ] Task in `.tasks/sprint-backlog.json` shows `APPROVED` status before PUBLISHED
   - [ ] If this is a new item, lifecycle has progressed through all required states

3. **Output gate result** — Print either:

   ✅ **PASS** — File is ready to publish. Confirm final steps:
   - If the page needs a sidebar entry, update `site/sidebars.ts`
   - Mark the task `DONE` in `.tasks/sprint-backlog.json`
   - Update lifecycle state to `PUBLISHED` in the backlog entry

   ❌ **FAIL** — List every failed checklist item with:
   - The specific file and field that is wrong
   - The required fix
   - Priority: BLOCKER (must fix before publishing) or ADVISORY (should fix)

## Output

- PASS/FAIL verdict with detailed checklist results printed to chat
- If PASS: updates to `.tasks/sprint-backlog.json` and confirmation of `site/sidebars.ts` needs
