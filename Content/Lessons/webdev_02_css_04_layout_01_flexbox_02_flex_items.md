---
type: lesson
title: "Flex Items"
description: "Flex items are the direct children of a flex container. They have their own set of properties that control how they grow to fill available space, how they shrink when space is tight, what their bas..."
duration_minutes: 20
tags:
  - css
  - flexbox
  - flex-grow
  - flex-shrink
  - flex-basis
  - flex
---

# Flex Items

> **Lesson Summary:** Flex items are the direct children of a flex container. They have their own set of properties that control how they grow to fill available space, how they shrink when space is tight, what their base size is before growing/shrinking, and how an individual item can override the container's alignment.



## The Three Core Item Properties

Every flex item has three fundamental sizing behaviours:

| Property | Default | Controls |
| :--- | :--- | :--- |
| `flex-grow` | `0` | How much an item grows relative to siblings |
| `flex-shrink` | `1` | How much an item shrinks relative to siblings |
| `flex-basis` | `auto` | The item's starting size before growing/shrinking |

---

## `flex-grow`

When the container has **leftover space**, `flex-grow` determines how items claim it. The value is a **ratio** — not pixels or percent.

```css
/* All items grow equally — each claims 1/3 of available space */
.item { flex-grow: 1; }

/* Item B claims twice as much spare space as A or C */
.item-a { flex-grow: 1; }
.item-b { flex-grow: 2; }
.item-c { flex-grow: 1; }
```

`flex-grow: 0` (default) means the item does not grow — it stays at its natural size.

---

## `flex-shrink`

When the container **doesn't have enough space**, `flex-shrink` determines how items give up space. Again, a ratio.

```css
/* Item A shrinks twice as fast as item B when space is tight */
.item-a { flex-shrink: 2; }
.item-b { flex-shrink: 1; }

/* This item will never shrink below its flex-basis */
.item-fixed { flex-shrink: 0; }
```

`flex-shrink: 0` is very useful for items that must never compress — sidebar icons, logo images, fixed-width UI elements.

---

## `flex-basis`

`flex-basis` sets the item's **initial size** along the main axis, before any growing or shrinking happens:

```css
flex-basis: auto;     /* Default — use the item's natural content size */
flex-basis: 200px;    /* Start at exactly 200px, then grow/shrink from there */
flex-basis: 25%;      /* Start at 25% of the container */
flex-basis: 0;        /* Start with zero base size — all space is "spare" (shared by flex-grow) */
```

The difference between `flex-basis: auto` and `flex-basis: 0` matters when items have `flex-grow`:
- `auto`: items grow *beyond* their natural content size
- `0`: items each get an equal share of the *entire* container width

---

## The `flex` Shorthand

Always use the shorthand — it sets all three at once and avoids ambiguous defaults:

```css
flex: <grow> <shrink> <basis>;

/* Common patterns */
flex: 1;          /* grow:1 shrink:1 basis:0 — equal sharing, ignoring content size */
flex: 1 1 auto;   /* grow:1 shrink:1 basis:auto — equal sharing, respecting content size */
flex: 0 0 200px;  /* grow:0 shrink:0 basis:200px — fixed size, never grows or shrinks */
flex: none;       /* grow:0 shrink:0 basis:auto — fully rigid */
flex: auto;       /* grow:1 shrink:1 basis:auto — fully flexible */
```

```css
/* Responsive cards: at least 280px wide, grow to fill available space */
.card {
  flex: 1 1 280px;
}
```

---

## `order`

By default, flex items display in DOM order. `order` changes the visual rendering order without modifying the HTML:

```css
.item-a { order: 2; }
.item-b { order: 1; }  /* Renders first */
.item-c { order: 3; }
```

> **⚠️ Warning:** `order` affects only *visual* rendering — not tab order or screen reader reading order. Using `order` to reorder content from its DOM order creates a disconnect between what sighted users see and what keyboard/screen reader users experience. Use with caution.

---

## `align-self`

Overrides the container's `align-items` for a single item:

```css
.container { align-items: center; }

.special-item {
  align-self: flex-end;   /* This item aligns to the end of the cross axis */
}
```

---

## `min-width: 0` — The Flex Overflow Fix

A common gotcha: flex items have an implicit `min-width: auto` by default, which prevents them from shrinking below their content size. This breaks text truncation and can cause overflow:

```css
/* ❌ Long text overflows the flex item */
.item { flex: 1; }

/* ✅ Allows the item to shrink below content size */
.item { flex: 1; min-width: 0; }
```

Then you can apply `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` to the text inside.

---

## Key Takeaways

- `flex-grow` — how items claim spare space (ratio). `0` = don't grow.
- `flex-shrink` — how items give up space when tight (ratio). `0` = never shrink.
- `flex-basis` — starting size before growing/shrinking. `auto` = content size. `0` = zero base.
- Use the **`flex` shorthand** always. Common values: `flex: 1`, `flex: none`, `flex: 1 1 280px`.
- `order` changes visual order only — tab order is unaffected.
- Add `min-width: 0` to flex items containing long text to allow proper shrinking.

## Research Questions

> **🔬 Research Question:** What is the difference between `flex: 1` and `flex: 1 1 auto`? Write a concrete example where they produce different results.
>
> *Hint: Search "CSS flex 1 vs flex 1 1 auto difference" and "flex-basis 0 auto comparison".*

> **🔬 Research Question:** What is a flex "intrinsic size" and how does the browser use it when `flex-basis: auto` is set? what does "auto" actually look up?
>
> *Hint: Search "CSS flex-basis auto intrinsic size" and "CSS width auto vs fit-content".*
