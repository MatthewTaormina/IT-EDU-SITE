---
title: "Sub-unit Review — CSS Foundations"
lesson_plan: "CSS — Foundations"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — CSS Foundations

> Work through this without looking back at the lessons.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **CSSOM** | CSS Object Model — the browser's parsed tree of CSS rules |
| **Render tree** | The combination of DOM + CSSOM used to paint the page |
| **External stylesheet** | A `.css` file linked via `<link rel="stylesheet">` — the preferred approach |
| **Inline style** | CSS written directly in a `style` attribute — highest specificity, last resort |
| **Rule** | A selector + declaration block: `selector { property: value; }` |
| **Declaration** | A single `property: value;` pair |
| **Shorthand** | A property that sets multiple sub-properties at once (e.g., `margin: 1rem 2rem`) |
| **Cascade** | The algorithm resolving conflicting CSS rules: origin → specificity → order |
| **Origin** | Where a CSS rule comes from: user-agent, author, or inline |
| **Specificity** | A (ID, Class, Type) score calculating which selector "wins" a conflict |
| **Source order** | When specificity ties, the last rule in document order wins |
| **Inheritance** | Typographic properties flow automatically from parent to child elements |
| **Computed value** | The final resolved value for a property after cascade and inheritance |
| **`initial`** | Keyword resetting a property to its spec-defined starting value |
| **`inherit`** | Keyword forcing a property to inherit from its parent |
| **`unset`** | Keyword: `inherit` if naturally inherited, `initial` otherwise |

---

## Quick Check

1. What is the difference between the DOM and the CSSOM? At what point do they combine?

2. List the three ways to apply CSS to a document. Why is the external stylesheet approach almost always correct?

3. A rule in `theme.css` sets `p { color: blue }`. A rule in `base.css` (linked before `theme.css`) sets `p { color: red }`. What colour does a `<p>` render as, and why?

4. Calculate the specificity score for these selectors: `div`, `.card`, `#hero`, `#hero .card p`. Which would win over the others?

5. An `<h2>` inside a `<div style="color: green">` renders green even though no CSS rule targets `<h2>`. What mechanism causes this?

6. You set `font-family: 'Inter', sans-serif` on `body`. Do you need to set it again on `<p>`, `<li>`, and `<td>`? Why or why not?

7. DevTools shows a CSS rule crossed out with a strikethrough. What does that mean? Where do you look to find out which rule won instead?
