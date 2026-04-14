---
title: "Sub-unit Review — Grid"
lesson_plan: "CSS — Grid"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Grid

> Work through this without looking back.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Grid container** | An element with `display: grid` |
| **Grid item** | A direct child of a grid container |
| **Grid track** | A row or column between two grid lines |
| **Grid line** | The dividing lines of the grid — numbered from 1 |
| **Grid cell** | The intersection of one row track and one column track |
| **Grid area** | One or more cells forming a rectangle |
| **`fr`** | Fraction unit — share of available space after fixed tracks are placed |
| **`repeat(N, size)`** | Shorthand for repeating track definitions |
| **`auto-fill`** | Generates as many tracks as fit; preserves empty tracks |
| **`auto-fit`** | Generates as many tracks as fit; collapses empty tracks |
| **`minmax(min, max)`** | Sets a track's minimum and maximum size |
| **`grid-column: 1 / 3`** | Place item from line 1 to line 3 (spans 2 columns) |
| **`span N`** | Cover N tracks from wherever the item starts auto-placing |
| **`1 / -1`** | From first line to last line — full width/height |
| **`grid-template-areas`** | Define named layout regions as a visual map |
| **`grid-area`** | Assign an item to a named region |
| **`justify-items`** | Horizontal alignment of all items within their cells |
| **`align-items`** | Vertical alignment of all items within their cells |
| **`grid-auto-flow: dense`** | Fill holes left by spanning items |

---

## Quick Check

1. Write the CSS for a three-column equal grid with a 1.5rem gap. Then write the same grid with the first column fixed at 300px and the other two sharing remaining space equally.

2. What is the difference between `auto-fill` and `auto-fit` when there are only 2 items in a 4-column grid?

3. Write the grid placement to make an item span from column 2 to the last column, on row 1.

4. Define a page layout with `grid-template-areas` that has a full-width header, a 260px left sidebar, a flexible main content, and a full-width footer. Include the column and row definitions.

5. You have a `.lead` article that should span 2 columns and 2 rows in an auto-placed grid. Write the item CSS. Will the items after it auto-place correctly?

6. What does `grid-auto-flow: dense` do and when would you use it?

7. What is the responsive card grid one-liner — the one pattern that eliminates media queries for card layouts? Explain what each part does.
