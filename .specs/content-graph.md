# Content Graph Model

> This is the authoritative structural model for IT EDU SITE content.
> Agents must not invent relationships outside this hierarchy.

---

## Hierarchy

```
Pathway
  └── Course (ordered)
        └── Unit (ordered)
              └── Sub-Unit (optional, ordered)
                    └── Lesson (ordered)
              └── Lesson (ordered)
        └── Project (capstone, terminal)
Article (standalone — no parent)
```

### Rules

- A **Pathway** contains an ordered list of Courses. Each course has explicit prerequisites.
- A **Course** contains an ordered list of Units. Units within a course build on each other.
- A **Unit** contains an ordered list of Lessons, and optionally nested Sub-Units.
- A **Sub-Unit** is a Unit that lives inside another Unit. Used when a topic (e.g., CSS Layout) has distinct, sizeable sub-topics (e.g., Flexbox, Grid) that each warrant their own lesson group.
- A **Lesson** is atomic — it covers exactly one concept at one Bloom level.
- A **Project** is the terminal capstone of a Course. It synthesises skills from the whole course.
- An **Article** is standalone editorial content. It may cross-link to Lessons or Courses but is not part of any hierarchy.

---

## Node Relationships (machine-readable)

```
Pathway  --references-->  Course  (type: course, slug: course_slug)
Course   --references-->  Unit    (type: unit,   slug: unit_slug)
Unit     --references-->  Lesson  (type: lesson, slug: lesson_slug)
Unit     --references-->  Unit    (type: unit,   slug: sub_unit_slug)   # sub-unit
Course   --references-->  Project (type: project, slug: project_slug)
Article  --references-->  Lesson  (optional cross-links)
Article  --references-->  Course  (optional cross-links)
```

All relationships are expressed via the `references` array in frontmatter. They are directional (parent → child). Reverse traversal (child → parent) is resolved via `catalog.json`.

---

## Frontmatter `references` Format

```yaml
references:
  - type: unit | lesson | course | pathway | project | article
    slug: exact_slug_string
```

The `slug` must exactly match a `slug` value in `Content/catalog.json`.

---

## Content Type Summary

| Type | File Location | Naming Pattern | Has Children |
|------|--------------|----------------|--------------|
| `pathway` | `Content/Pathways/{slug}/index.md` | `{domain}_{level}/` | Yes — courses |
| `course` | `Content/Courses/{domain}/index.md` | `{domain}/` | Yes — units, projects |
| `unit` | `Content/Units/{slug}/index.md` | `{domain}_{NN}_{slug}/` | Yes — lessons, sub-units |
| `lesson` | `Content/Lessons/{slug}.md` | `{domain}_{NN}_{unit}_{NN}_{slug}.md` | No |
| `project` | `Content/Projects/{slug}/index.md` | `{domain}_{course}_capstone/` | No (has assets/) |
| `article` | `Content/Articles/{slug}.md` | `{topic_slug}.md` | No |

---

*Spec version: 1.0 | Last updated: 2026-04-14*
