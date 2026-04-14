---
description: "Full /Content audit: frontmatter validation, catalog.json alignment, broken cross-links → report saved to .reviews/reports/"
---

# Content Audit

Run a full quality audit of the `/Content/` directory.

## Steps

1. **Frontmatter audit** — Read every file in `Content/Lessons/`, `Content/Units/`, `Content/Courses/`, `Content/Pathways/`, `Content/Articles/`, and `Content/Projects/`. For each file, verify:
   - `type` field matches the expected value for its directory
   - All required fields per type are present (see `.github/copilot-instructions.md` Section 3)
   - `title` ≤ 60 chars (lessons/articles) or reasonable for other types
   - `description` ≤ 160 chars
   - `difficulty` is one of: `Beginner | Intermediate | Advanced`
   - `duration_minutes` is a positive integer (lessons only)
   - `tags` is a non-empty array

2. **Catalog alignment** — For every content file found, check:
   - Does a corresponding entry exist in `Content/catalog.json`?
   - Does the `slug` in catalog match the file stem?
   - Does the `path` in catalog match the actual file location?
   - Does the `type` in catalog match the frontmatter `type`?
   - List all orphaned catalog entries (in catalog but no matching file)
   - List all uncataloged files (file exists but no catalog entry)

3. **Reference integrity** — For each `references` array in course/pathway/unit files:
   - Verify every referenced `slug` exists in `catalog.json`
   - Verify the referenced file actually exists on disk
   - List broken references

4. **Skills taxonomy check** — For each course `skills_required` entry:
   - Verify the skill is granted (`skills_granted`) by at least one other course in the system
   - Flag any orphaned skills requirements

5. **MDX component check** — Scan all lesson and unit body files for any MDX component tags. Flag any tag NOT in the approved whitelist (see `.github/copilot-instructions.md` Section 6).

6. **Write report** — Use `@content-editor` to produce a structured report at `.reviews/reports/content-audit-{YYYY-MM-DD}.md` with:
   - Summary counts (files checked, issues found, critical issues)
   - Section per issue category with specific file paths and line references
   - Recommended fix priority (CRITICAL / HIGH / MEDIUM / LOW)

## Output

- `.reviews/reports/content-audit-{YYYY-MM-DD}.md`
