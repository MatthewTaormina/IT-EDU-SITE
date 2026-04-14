---
title: "Sub-unit Review — Selectors & Specificity"
lesson_plan: "CSS — Selectors & Specificity"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Selectors & Specificity

> Work through this without looking back.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Type selector** | Targets all elements of a given tag (`p`, `h1`) — lowest specificity |
| **Class selector** | Targets elements with a matching `class` attribute (`.card`) |
| **ID selector** | Targets the element with a matching `id` (`#hero`) — high specificity, avoid in CSS |
| **Attribute selector** | Targets by attribute presence or value (`[type="email"]`) |
| **Descendant combinator** | Space ` ` — any descendant of the first element |
| **Child combinator** | `>` — direct children only |
| **Adjacent sibling combinator** | `+` — immediately following sibling |
| **General sibling combinator** | `~` — all following siblings |
| **Pseudo-class** | `:hover`, `:focus`, `:nth-child()` — element state or position |
| **Pseudo-element** | `::before`, `::after`, `::first-line` — part of an element |
| **Generated content** | Content inserted via `::before`/`::after` with the `content` property |
| **`:focus-visible`** | Focus style only for keyboard/sequential navigation |
| **`:is()`** | Logical pseudo-class matching any of its selectors; takes highest argument specificity |
| **`:where()`** | Like `:is()` but always zero specificity — for overridable base styles |
| **`:has()`** | "Parent selector" — matches if element contains a matching descendant |
| **Specificity score** | (A, B, C) — IDs, Classes/attributes/pseudo-classes, Types/pseudo-elements |

---

## Quick Check

1. Rank these selectors from highest to lowest specificity and give each a score: `p`, `#hero`, `.card p`, `nav > a:hover`, `*`, `li:first-child::before`.

2. Two rules target the same element: `.intro { color: blue; }` and `p { color: red; }`. Which wins, and why? What if you swap in `p#hero` for `p`?

3. What is the difference between `ul li` and `ul > li`? Write HTML where they produce different results.

4. A checkbox with `id="toggle"` is checked. Write the CSS selector that targets a `<div class="panel">` that immediately follows it.

5. You want the first `<p>` inside any `<article>` to be slightly larger. Write both a structural pseudo-class approach and a class-based approach. When would you prefer each?

6. `::before` needs `content: ''` to render. Why does an empty string work — what is it actually generating?

7. Your colleague says "I'll just add `!important` to fix this." What should you tell them, and what should you actually do instead?
