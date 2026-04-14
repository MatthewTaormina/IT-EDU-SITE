# Checklist: Content Review (Pre-Publish)

> Run this checklist on every content node before moving it to `[DONE]` in [[.plan/operations/tasks.md]].
> Standards source: [[.skills/edu_content_authoring.md]]

---

## Frontmatter

- [ ] `type` field present and matches one of: `pathway`, `course`, `unit`, `lesson`, `project`, `article`
- [ ] `title` is unique, descriptive, and ≤60 characters
- [ ] `description` is present and ≤160 characters
- [ ] `difficulty` is set (`Beginner` | `Intermediate` | `Advanced`)
- [ ] `estimated_hours` or `estimated_minutes` is set
- [ ] `tags` array contains ≥2 relevant tags
- [ ] `references` array links to parent/related content nodes where applicable

## Content Quality

- [ ] Lesson opens with a clear learning objective ("By the end of this lesson, you will be able to…")
- [ ] Every concept is paired with a code example, exercise, or real-world application
- [ ] No broken internal links (verify relative paths resolve)
- [ ] No broken external links
- [ ] Spelling and grammar checked
- [ ] Code blocks have language specifiers (` ```html `, ` ```js `, etc.)
- [ ] Images have alt text (if any)

## Accessibility

- [ ] Heading hierarchy is logical (H1 → H2 → H3, never skipped)
- [ ] Tables have a header row
- [ ] No colour-only information (for future rendered output)

## Pathway / Unit Alignment

- [ ] Content fits within its declared parent unit/course
- [ ] Skills taught align with the pathway goal in [[Content/Pathways/]]
- [ ] Capstone projects have a clear deliverable the learner can share with employers

---

*Checklist version: 1.0 | Source: [[.plan/operations/checklists/checklist_content_review.md]]*
