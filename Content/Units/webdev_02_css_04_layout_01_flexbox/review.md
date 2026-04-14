---
title: "Sub-unit Review — Flexbox"
lesson_plan: "CSS — Flexbox"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Flexbox

> Work through this without looking back.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Flex container** | An element with `display: flex` or `display: inline-flex` |
| **Flex item** | A direct child of a flex container |
| **Main axis** | The direction items are laid out — set by `flex-direction` |
| **Cross axis** | Perpendicular to the main axis |
| **`flex-direction`** | `row` (default), `column`, `row-reverse`, `column-reverse` |
| **`flex-wrap`** | `nowrap` (default), `wrap`, `wrap-reverse` |
| **`gap`** | Space between flex items — does not add space at edges |
| **`flex-grow`** | How much an item claims of available spare space (ratio) |
| **`flex-shrink`** | How much an item gives up when space is tight (ratio) |
| **`flex-basis`** | Item's starting size before growing/shrinking |
| **`flex: 1`** | Shorthand: grow=1, shrink=1, basis=0 — equal sharing of all space |
| **`flex: none`** | grow=0, shrink=0, basis=auto — fully rigid |
| **`justify-content`** | Distributes items along the main axis |
| **`align-items`** | Aligns items on the cross axis (single line) |
| **`align-content`** | Distributes rows on the cross axis (multi-line only) |
| **`align-self`** | Overrides `align-items` for one individual item |
| **`min-width: 0`** | Allows a flex item to shrink below its content size |

---

## Quick Check

1. A container has `display: flex; flex-direction: column`. Which axis does `justify-content` now act on — horizontal or vertical?

2. Write the CSS to create a navbar with brand on the left and links on the right using only two properties on the container.

3. You have three flex items with `flex-grow: 1`, `flex-grow: 2`, `flex-grow: 1`. The container has 120px of spare space. How much does each item get?

4. What does `flex: 0 0 260px` mean? When would you use it?

5. A paragraph inside a flex item has text that should truncate with ellipsis at the flex item's edge, but it's overflowing instead. What property do you add to the flex item, and why?

6. What is the difference between `align-items` and `align-content`? Under what condition does `align-content` have no effect?

7. Sketch the CSS for a "sticky footer" layout — header, growing main, footer stuck at the bottom — using only Flexbox. What is the key property on `<main>`?
