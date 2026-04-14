---
title: "Common Flexbox Patterns"
lesson_plan: "CSS — Flexbox"
order: 4
duration_minutes: 20
sidebar_position: 4
tags:
  - css
  - flexbox
  - patterns
  - navbar
  - card-layout
  - centering
---

# Common Flexbox Patterns

> **Lesson Summary:** Flexbox theory becomes useful when applied to real UI problems. This lesson covers the most common, production-relevant Flexbox patterns — navbar layout, card rows, perfect centring, and sidebar layouts. Each pattern is complete, working code.

## Pattern 1 — Navbar

A horizontal navigation bar with the logo/brand on the left and links on the right:

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  background: #0f172a;
}

.navbar__brand {
  font-weight: 700;
  color: #f8fafc;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__links a {
  color: #94a3b8;
  text-decoration: none;
}

.navbar__links a:hover {
  color: #f8fafc;
}
```

```html
<header class="navbar">
  <span class="navbar__brand">MyBrand</span>
  <nav>
    <ul class="navbar__links">
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
```

**Key moves:** `justify-content: space-between` pushes brand left and links right. `align-items: center` vertically centres both. The `<ul>` is also a flex container for the link spacing.

---

## Pattern 2 — Responsive Card Row

Cards that fill available space, wrap naturally, and have consistent gutters:

```css
.card-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  flex: 1 1 280px;  /* grow, shrink, min-width basis */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1.5rem;
  min-width: 0;
}
```

**Key move:** `flex: 1 1 280px` means each card has a minimum width of 280px, grows to fill space, and wraps to the next row when it can't fit. The container needs no media queries — it's inherently responsive.

---

## Pattern 3 — Perfect Centring

Centre any content (horizontally and vertically) inside a container:

```css
/* Full viewport centering */
.page-centre {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Centre within a card */
.card-centre {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
```

---

## Pattern 4 — Sidebar Layout

A two-column layout with a fixed-width sidebar and a flexible content area:

```css
.page-layout {
  display: flex;
  min-height: 100vh;
  gap: 0;
}

.sidebar {
  flex: 0 0 260px;        /* Never grows or shrinks — always 260px */
  background: #0f172a;
  padding: 2rem 1.5rem;
}

.main-content {
  flex: 1;                /* Takes all remaining space */
  padding: 2rem;
  min-width: 0;           /* Allows content to shrink if needed */
}
```

**Key move:** `flex: 0 0 260px` on the sidebar means it is perfectly rigid. `flex: 1` on the content means it claims everything else.

---

## Pattern 5 — Sticky Footer

A page where the footer always sticks to the bottom — even on short pages:

```css
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;  /* Stack vertically */
}

main {
  flex: 1;                 /* Main grows to fill available space, pushing footer down */
}

footer {
  /* Stays at the bottom — no position tricks needed */
}
```

---

## Pattern 6 — Icon + Label Button

An inline element with an icon on the left and label text aligned to the centre:

```css
.btn {
  display: inline-flex;    /* inline so buttons don't fill full width */
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #3b82f6;
  color: white;
  font-size: 0.9rem;
}
```

```html
<button class="btn">
  <svg aria-hidden="true">…</svg>
  Save changes
</button>
```

---

## Key Takeaways

- Flexbox patterns are composable — flex containers can be nested inside flex items.
- `flex: 1 1 280px` + `flex-wrap: wrap` = responsive card grid without media queries.
- `min-height: 100vh` + `flex-direction: column` + `flex: 1` on `<main>` = sticky footer.
- `justify-content: space-between` on a navbar pushes brand and links to opposite edges.
- `flex: 0 0 Xpx` on a sidebar = perfectly rigid column that never grows or shrinks.

## Research Questions

> **🔬 Research Question:** What is the "Holy Grail" layout? Describe its structure (header, footer, two sidebars, main content) and sketch how you would implement it using Flexbox.
>
> *Hint: Search "holy grail layout CSS flexbox" and compare with a Grid version.*

> **🔬 Research Question:** What is `aspect-ratio` in CSS and how does it interact with Flexbox sizing? Can you maintain a 16:9 ratio on a flex item that grows?
>
> *Hint: Search "CSS aspect-ratio property MDN" and "aspect-ratio flexbox".*
