---
title: "Grid Items"
lesson_plan: "CSS — Grid"
order: 2
duration_minutes: 20
sidebar_position: 2
tags:
  - css
  - grid
  - grid-items
  - grid-column
  - grid-row
  - span
  - placement
---

# Grid Items

> **Lesson Summary:** By default, grid items are placed automatically — the browser fills columns left to right, wrapping to new rows. But Grid also lets you place items *explicitly* by specifying exactly which column and row lines they should start and end at. This lesson covers auto-placement, explicit placement, and spanning.

## Auto-Placement

Without any item-level properties, items fill the grid sequentially — left to right, top to bottom:

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* No item properties — browser places them automatically */
```

The browser uses the **auto-placement algorithm** (controlled by `grid-auto-flow`):

```css
grid-auto-flow: row;    /* Default — fill rows, create new ones as needed */
grid-auto-flow: column; /* Fill columns instead */
grid-auto-flow: dense;  /* Fill holes left by spanning items */
```

---

## Explicit Placement with `grid-column` and `grid-row`

Place items on specific grid lines:

```css
.item {
  grid-column: 2;      /* Starts at column line 2, spans 1 track */
  grid-row: 1;         /* Starts at row line 1, spans 1 track */
}

/* Start and end lines */
.item {
  grid-column: 1 / 3;  /* Column line 1 to line 3 — spans 2 columns */
  grid-row: 2 / 4;     /* Row line 2 to line 4 — spans 2 rows */
}
```

Grid lines are numbered from **1** (not 0) starting at the top-left corner. Negative numbers count from the end:

```css
grid-column: 1 / -1;  /* Full width — from first to last line */
```

---

## `span` Keyword

Instead of specifying start and end lines, use `span` to say "how many tracks to cover":

```css
.wide-item {
  grid-column: span 2;     /* Start wherever placed, span 2 columns */
  grid-row: span 2;        /* Start wherever placed, span 2 rows */
}

.full-width {
  grid-column: 1 / -1;    /* Explicit: start to end */
  /* or: */
  grid-column: span 3;    /* Span all 3 columns (if you know the count) */
}
```

---

## Shorthand: `grid-area`

The `grid-area` shorthand sets row-start / column-start / row-end / column-end all at once:

```css
/* row-start / column-start / row-end / column-end */
.item {
  grid-area: 1 / 1 / 3 / 3;  /* Rows 1–3, Columns 1–3 */
}
```

`grid-area` is also used with named template areas (covered in the next lesson).

---

## `justify-self` and `align-self`

Unlike Flexbox, Grid supports `justify-self` — aligning a single item within its grid cell:

```css
.item {
  justify-self: center;  /* Horizontal alignment within cell */
  align-self: end;       /* Vertical alignment within cell */
}
```

To align all items at the container level:

```css
.container {
  justify-items: center;  /* All items: horizontal alignment within cells */
  align-items: start;     /* All items: vertical alignment within cells */
}
```

---

## `order` in Grid

Like Flexbox, `order` can change the visual rendering order of grid items:

```css
.item-a { order: 2; }
.item-b { order: 1; } /* Renders first */
```

Same caveat as Flexbox: `order` affects visual order only — tab/screen reader order follows the DOM.

---

## Practical Example — Magazine Layout

```css
.magazine {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
}

.feature { grid-column: 1 / 3; grid-row: 1 / 3; }  /* Big feature article */
.story-a { grid-column: 3; }
.story-b { grid-column: 4; }
.story-c { grid-column: 3 / 5; }                    /* Spans two columns */
```

---

## Key Takeaways

- Items auto-place left to right, top to bottom by default.
- `grid-column: 1 / 3` places an item from line 1 to line 3 (spanning 2 tracks).
- `span 2` means "cover 2 tracks from wherever I'm placed."
- `grid-column: 1 / -1` spans the full width (all columns).
- Grid supports `justify-self` and `align-self` per item — Flexbox does not have `justify-self`.

## Research Questions

> **🔬 Research Question:** What is `grid-auto-flow: dense`? When would you use it, and what visual effect does it create on a grid with items of varying sizes?
>
> *Hint: Search "CSS grid-auto-flow dense MDN" and "grid dense packing images".*

> **🔬 Research Question:** CSS Grid has a concept of "named lines". How do named lines work in `grid-template-columns`, and how can you reference them in `grid-column`?
>
> *Hint: Search "CSS grid named lines MDN" and "grid-template-columns named tracks".*
