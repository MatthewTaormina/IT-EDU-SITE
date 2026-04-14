---
title: "Sub-unit Review — Responsive Design"
lesson_plan: "CSS — Responsive Design"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Responsive Design

> Work through this without looking back.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Viewport meta tag** | `<meta name="viewport" content="width=device-width, initial-scale=1">` — tells mobile browsers to use the actual device width |
| **Viewport units** | `vw`, `vh`, `dvh` — percentages of the viewport dimensions |
| **`100dvh`** | Dynamic viewport height — accounts for mobile browser chrome appearing/disappearing |
| **Media query** | `@media (condition) { }` — styles applied conditionally based on a device feature |
| **`min-width`** | Media feature that applies styles at or above a given width; mobile-first |
| **`max-width`** | Media feature that applies styles at or below a given width; desktop-first |
| **Mobile-first** | Write base styles for mobile, add complexity with `min-width` queries |
| **Breakpoint** | The width at which a layout switches — ideally driven by content, not device dimensions |
| **`min(a, b)`** | Returns the smaller of two values — use to cap sizes |
| **`max(a, b)`** | Returns the larger of two values — use to enforce minimums |
| **`clamp(min, val, max)`** | Fluid value bounded between a minimum and maximum |
| **Intrinsic layout** | Layouts that adapt without explicit breakpoints using Grid, Flexbox, and modern CSS functions |
| **`prefers-reduced-motion`** | Media feature detecting user's preference to reduce or eliminate animations |
| **`prefers-color-scheme`** | Media feature detecting user's dark/light mode preference |

---

## Quick Check

1. Without the viewport meta tag, what does a mobile browser do with a responsive stylesheet? Why does this break media queries?

2. What is wrong with this meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />`?

3. Write the mobile-first CSS to make a `.grid` container go from 1 column → 2 columns at 640px → 3 columns at 1024px.

4. Using a single `clamp()` declaration, make a heading font size scale from `1.5rem` on mobile to `3rem` on wide screens, using a viewport-relative preferred value.

5. What is the difference between `min(280px, 100%)` and just `280px` inside `minmax()` in a `repeat(auto-fill, ...)` grid?

6. You want more padding on large screens and less on mobile — write the single-line CSS that handles this without a media query.

7. A user has enabled "reduce motion" in their OS settings. How would you detect this in CSS and what would you do for animated elements?
