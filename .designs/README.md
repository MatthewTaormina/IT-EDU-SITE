# UX — Wireframes & User Flows

> All wireframes and user flow diagrams for IT EDU SITE are stored in this directory.
> **Constraint:** Use Mermaid.js or SVG only — no image files, no Figma embeds.

---

## Site-Level User Flow

```mermaid
flowchart TD
    Home["🏠 Home"] --> Catalogue["📚 Course Catalogue"]
    Home --> Pathways["🗺️ Learning Pathways"]
    Pathways --> PathwayDetail["Pathway Detail Page"]
    PathwayDetail --> CourseDetail["Course Detail Page"]
    CourseDetail --> UnitDetail["Unit Page"]
    UnitDetail --> Lesson["📄 Lesson"]
    UnitDetail --> Project["🛠️ Project"]
    Catalogue --> CourseDetail
    Home --> Articles["📰 Articles"]
    Articles --> ArticleDetail["Article Detail Page"]
```

---

## Content Discovery Flow

```mermaid
flowchart LR
    Search["🔍 Search / Filter"] --> Results["Results List"]
    Results --> ContentNode["Content Node\n(Lesson / Course / Article)"]
    ContentNode --> Related["Related Content\n(via references frontmatter)"]
    Related --> ContentNode
```

---

## File Naming Convention

`<feature_slug>_wireframe.md` — e.g., `search_wireframe.md`, `pathway_detail_wireframe.md`

---

*Source of truth: [[.designs/]] | Vision: [[.objectives/vision.md]]*
