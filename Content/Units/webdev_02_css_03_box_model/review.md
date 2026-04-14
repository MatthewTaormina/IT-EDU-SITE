---
title: "Sub-unit Review — The Box Model"
lesson_plan: "CSS — The Box Model"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — The Box Model

> Work through this without looking back.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Box model** | The four-layer model (content → padding → border → margin) applied to every CSS element |
| **Content area** | The innermost layer — where text and children live; sized by `width`/`height` |
| **Padding** | Space inside the element between content and border; background extends into it; cannot be negative |
| **Border** | The visible edge around padding; shorthand: `width style color` |
| **Margin** | Transparent space outside the border between this element and its neighbours; can be negative |
| **Margin collapsing** | Adjacent vertical margins collapse to the larger value, not their sum |
| **`content-box`** | Default `box-sizing`: `width` sets content only; padding/border add to total |
| **`border-box`** | Modern `box-sizing`: `width` sets total; padding/border shrink content inward |
| **`outline`** | Visual ring outside the border — does not affect layout; used for focus styles |
| **`display: block`** | Element stacks vertically, fills width, respects all sizing |
| **`display: inline`** | Flows in text; ignores `width`/`height`; no vertical margin push |
| **`display: inline-block`** | Inline flow but respects sizing — largely superseded by Flexbox |
| **`display: none`** | Removes element from layout entirely (vs. `visibility: hidden` which preserves space) |
| **Normal flow** | Default layout: block elements stack vertically; inline elements wrap horizontally |
| **Block Formatting Context (BFC)** | Self-contained layout region preventing cross-boundary margin collapse and containing floats |
| **`display: flow-root`** | Modern way to create a BFC without side effects |

---

## Quick Check

1. Draw the four box model layers from inside to outside. Which layers does the `background-color` property extend into?

2. An element has `width: 200px; padding: 20px; border: 5px solid;` with `box-sizing: content-box`. What is its total rendered width? What would it be with `border-box`?

3. Write the universal reset that applies `border-box` to all elements including generated content. Why must `::before` and `::after` be included separately?

4. Two `<p>` elements are stacked. The first has `margin-bottom: 2rem`, the second has `margin-top: 3rem`. What is the gap between them, and why?

5. You set `width: 100px; height: 100px` on a `<span>`. Nothing changes. Why? What display value would make it work?

6. Your `<button>` focus ring disappears on click in Chrome. You want to keep it only for keyboard nav. Which pseudo-class do you use?

7. You need to contain a floated image inside a card so it doesn't overflow. Name one CSS property you'd add to the card and explain why it works.
