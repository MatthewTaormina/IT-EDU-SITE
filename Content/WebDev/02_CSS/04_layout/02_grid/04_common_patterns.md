---
title: "Common Grid Patterns"
lesson_plan: "CSS — Grid"
order: 4
duration_minutes: 20
sidebar_position: 4
tags:
  - css
  - grid
  - patterns
  - page-layout
  - card-grid
  - holy-grail
---

# Common Grid Patterns

> **Lesson Summary:** Grid patterns are the bedrock of modern web layout. This lesson covers the most important real-world Grid applications — responsive card grids, the classic page layout, and the holy grail — all complete, production-ready code.

## Pattern 1 — Responsive Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

```html
<div class="card-grid">
  <article class="card">…</article>
  <article class="card">…</article>
  <article class="card">…</article>
  <!-- as many cards as needed -->
</div>
```

**Why this works:** `auto-fill` creates as many columns as fit. `minmax(280px, 1fr)` means each column is at least 280px and can grow. No media queries — columns naturally reflow as the viewport narrows.

---

## Pattern 2 — Page Layout (Named Areas)

```css
.page {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
}

header { grid-area: header; }
aside  { grid-area: sidebar; }
main   { grid-area: main; }
footer { grid-area: footer; }

@media (max-width: 768px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
```

---

## Pattern 3 — Holy Grail Layout

The holy grail: header, footer, left sidebar, right sidebar, main content. Notoriously difficult before Grid:

```css
.holy-grail {
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header  header"
    "nav     main    aside"
    "footer  footer  footer";
  min-height: 100vh;
}

.header { grid-area: header; }
.nav    { grid-area: nav; }
.main   { grid-area: main; }
.aside  { grid-area: aside; }
.footer { grid-area: footer; }
```

---

## Pattern 4 — Magazine / Editorial Grid

A variable-density article grid where the lead story spans multiple columns and rows:

```css
.magazine {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.lead-story {
  grid-column: 1 / 3;
  grid-row: 1 / 3;   /* A large feature block */
}
```

---

## Pattern 5 — Image Gallery with `auto-fit`

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
}

.gallery img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}
```

**`auto-fit` vs `auto-fill`:** In a gallery with only a few images, `auto-fit` collapses empty tracks so the images grow to fill the container. `auto-fill` leaves gaps. For galleries, `auto-fit` is usually better.

---

## Pattern 6 — Centred Content with Max Width

```css
.content-wrapper {
  display: grid;
  grid-template-columns:
    1fr
    min(65ch, 100%)   /* Content column: max 65 characters wide */
    1fr;
}

.content-wrapper > * {
  grid-column: 2;     /* All children go in the centre column */
}

.full-bleed {
  grid-column: 1 / -1; /* Full-width elements break out of the centre */
}
```

This pattern (popularised by Josh Comeau) creates a centred content area with easy full-bleed breakouts — useful for article layouts with edge-to-edge images.

---

## Key Takeaways

- `repeat(auto-fill, minmax(280px, 1fr))` = responsive card grid with zero media queries.
- Named template areas are the cleanest way to build page-level layout.
- The Holy Grail layout is solved in ~15 lines with Grid.
- `auto-fit` collapses empty tracks; `auto-fill` preserves them.
- The `min()` function inside `grid-template-columns` enables readable content width control.

## Research Questions

> **🔬 Research Question:** MDN lists both `grid-template` (shorthand) and the `grid` shorthand (which is even more compact). What does the `grid` shorthand include that `grid-template` does not? When would each be appropriate?
>
> *Hint: Search "CSS grid shorthand vs grid-template MDN".*

> **🔬 Research Question:** CSS Grid and CSS container queries are often used together. What is a container query and how does it differ from a media query? How does it improve the Card Grid pattern?
>
> *Hint: Search "CSS container queries @container MDN 2024".*
