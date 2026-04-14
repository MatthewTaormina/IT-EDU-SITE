---
title: "Unit Capstone Review — CSS"
lesson_plan: "CSS"
type: "capstone-review"
sidebar_position: 999
sidebar_label: "Unit Review"
---

# Unit Capstone Review — CSS

> This review covers all six sub-units. Work through it from memory first.

---

## The Big Picture

CSS has three jobs:
1. **Select** the right elements (Selectors & Specificity)
2. **Size and space** them correctly (The Box Model)
3. **Place** them on the page (Layout)

Everything else — typography, colour, responsiveness — is refinement.

---

## Cross-Sub-unit Questions

### Selectors & Cascade

1. Why is `#hero p.intro { color: gold; }` hard to maintain, even if it gives you the colour you want right now?

2. A teammate wrote `color: red !important` to fix a bug. What is the underlying problem they should have fixed instead?

3. What is the difference between `:nth-child(2n+1)` and `:nth-of-type(2n+1)`? Give an example where they produce different results.

### Box Model

4. You set `width: 100%; padding: 2rem; border: 2px solid;` on an element. It overflows its parent. Why? What is the fix?

5. Two sections are stacked. Section A has `margin-bottom: 4rem`, Section B has `margin-top: 2rem`. What is the space between them?

### Layout

6. You need a three-column layout where the left column is 200px, the right is 200px, and the middle gets everything else. Write it once in Flexbox and once in Grid.

7. When should you use Flexbox vs Grid? Give a practical rule of thumb.

8. The `repeat(auto-fill, minmax(250px, 1fr))` pattern creates a responsive grid. What does each function and value do?

### Typography & Colour

9. Write `hsl(200, 80%, 50%)` — then make it: (a) 30% darker, (b) half-transparent, (c) the same hue but fully desaturated.

10. You're building a dark mode. Describe the custom properties approach using `:root` and `@media (prefers-color-scheme: dark)` in six lines.

### Responsive Design

11. A `clamp(1rem, 4vw, 3rem)` font size is on a heading. What is the computed size at: (a) 300px viewport, (b) 800px viewport, (c) 1200px viewport?

12. Write the mobile-first responsive version of a `.layout` that stacks on mobile, shows a sidebar at 768px, and adds a second aside at 1200px.

---

## Synthesis — The Starter Stylesheet

Write the first 20 or so lines of a production CSS stylesheet from memory. It should include:
- The `box-sizing` reset
- Root custom properties (colours, spacing, type scale)
- Dark mode variable override
- Body font, colour, and line-height
- A prose max-width

If you can write that from memory, you have mastered the core of this unit.
