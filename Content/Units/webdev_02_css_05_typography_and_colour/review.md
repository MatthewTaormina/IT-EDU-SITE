---
title: "Sub-unit Review — Typography & Colour"
lesson_plan: "CSS — Typography & Colour"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Typography & Colour

> Work through this without looking back.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Font stack** | Comma-separated list of fonts; browser uses the first available, fallback to last |
| **Generic family** | `sans-serif`, `serif`, `monospace` — the browser's built-in last-resort fonts |
| **`rem`** | Root-relative unit — predictable, accessible, respects user font preferences |
| **`em`** | Parent-relative unit — cascades multiplicatively |
| **`ch`** | Width of the `0` character — useful for capping prose line length |
| **`line-height` unitless** | Relative to element's own font size; avoids inheritance bugs |
| **Hex colour** | `#RRGGBB` or `#RGB` — six or three hex digits |
| **HSL** | `hsl(hue, saturation%, lightness%)` — intuitive axis-based colour model |
| **`opacity`** | Whole-element transparency including children — prefer per-property alpha |
| **`currentColor`** | References the element's `color` value; used in SVG and borders |
| **CSS Custom Property** | `--name: value` — dynamic, inheritable, cascade-aware variable |
| **`var()`** | References a custom property; optional fallback: `var(--name, fallback)` |
| **Design token** | A named, semantic value (e.g. `--color-brand`) shared across a design system |
| **`prefers-color-scheme`** | Media feature detecting user's OS dark/light mode preference |

---

## Quick Check

1. Write a font stack for a modern sans-serif UI that works on macOS, Windows, and Android without loading any custom font.

2. An element has `font-size: 1.5rem` and `line-height: 1.5em`. What is the computed line height if the root is 16px? What would it be with `line-height: 1.5`?

3. Write the HSL colour that is the same hue and saturation as `hsl(220, 70%, 60%)` but 20% darker.

4. You want a card to have a 20% transparent blue background. Write the CSS — without using `opacity` on the element.

5. Declare a custom property `--color-primary` on `:root` as blue, then override it to teal inside a `.theme-teal` section. Write a `<p>` rule that references it.

6. What is the dark mode pattern using `@media (prefers-color-scheme: dark)`? Sketch the `:root` approach in 6 lines.

7. Can CSS custom properties be set by JavaScript? Write the one-liner that changes `--color-primary` on the root element at runtime.
