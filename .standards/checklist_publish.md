# Checklist: Publish Gate (Final Release)

> Run immediately before marking a content item as PUBLISHED.
> This is the final quality gate — after this, the item goes live.
> Must follow completion of [[.standards/checklist_content_review.md]].

---

## File & Frontmatter

- [ ] File path matches naming convention exactly (`{domain}_{unit:02d}_{unit_slug}_{lesson:02d}_{lesson_slug}.md`)
- [ ] All required frontmatter fields present and valid for the content type
- [ ] `type` field matches the actual content (lesson / unit / course / pathway / article / project)
- [ ] No `_TODO_`, placeholder text, or commented-out sections remaining

## catalog.json

- [ ] Entry exists in `Content/catalog.json` for this content item
- [ ] `slug` is unique — no other item shares it
- [ ] `path` in catalog entry resolves to the actual file location
- [ ] `type`, `title`, `description`, `tags`, `difficulty`, `domain`, `estimated_hours` all match the frontmatter

## Site Navigation

- [ ] If this is a lesson or unit: entry exists in the correct sidebar in `site/sidebars.ts`
- [ ] Sidebar position follows the content's sequence in its parent unit
- [ ] If this is a new course or pathway: top-level sidebar and course index page updated

## Cross-Link Integrity

- [ ] All `references` slugs in frontmatter resolve to real content files
- [ ] All internal markdown links (`[text](path)`) resolve correctly
- [ ] No broken links to renamed or deleted files

## Content Quality (final check)

- [ ] Content passes all items in [[.standards/checklist_content_review.md]]
- [ ] No spelling errors in headings or first paragraph
- [ ] Code examples tested — no syntax errors
- [ ] Images and assets referenced exist in `Assets/`

## Lifecycle State

- [ ] Task status updated to `PUBLISHED` in `.tasks/sprint-backlog.json`
- [ ] Task moved to `[DONE]` in `.tasks/tasks.md`

---

*Checklist version: 1.0 | Source: [[.standards/checklist_publish.md]]*
