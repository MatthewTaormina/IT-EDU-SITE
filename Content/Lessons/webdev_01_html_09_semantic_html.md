---
type: lesson
title: "Semantic HTML"
description: "Semantic HTML means choosing elements that describe the *meaning* of your content, not just its appearance. A `<div>` and a `<main>` can look identical on screen — but only `<main>` tells browsers,..."
duration_minutes: 20
tags:
  - html
  - semantic
  - landmarks
  - header
  - main
  - footer
  - article
  - section
  - aside
  - accessibility
  - seo
---

# Semantic HTML

> **Lesson Summary:** Semantic HTML means choosing elements that describe the *meaning* of your content, not just its appearance. A `<div>` and a `<main>` can look identical on screen — but only `<main>` tells browsers, screen readers, and search engines what that region *is*. This lesson covers the full set of page-level semantic landmarks and explains why `<div>` and `<span>` are last resorts, not defaults.

![A web page divided into semantic regions — header, main, aside, and footer each outlined in different colors on a dark background](../../Assets/Images/webdev/html/html_semantic.png)

## What "Semantic" Means

An element is **semantic** if its name communicates the *role* of its content in the document — independent of how it looks.

Compare:

```html
<!-- Non-semantic: only describes visual appearance -->
<div class="big-box">
  <div class="top-stripe">...</div>
  <div class="center-area">...</div>
</div>

<!-- Semantic: communicates role -->
<article>
  <header>...</header>
  <main>...</main>
</article>
```

The `<div>` version requires a developer to read the class names to understand the intent. The semantic version is self-documenting — the element names themselves carry the meaning.

---

## Page-Level Landmarks

These elements divide a page into named regions — called **landmark regions** in accessibility terminology.

### `<header>`

The introductory region of a page or of a section within a page:

```html
<header>
  <a href="/">Company Name</a>
  <nav>
    <a href="/products">Products</a>
    <a href="/about">About</a>
  </nav>
</header>
```

At the **page level**, `<header>` typically contains the site logo, primary navigation, and possibly a search bar. It can also appear inside `<article>` or `<section>` to mark that section's own header.

### `<main>`

The **primary content** of the page — the reason the user came:

```html
<main>
  <h1>Getting Started with HTML</h1>
  <p>…</p>
</main>
```

There must be **exactly one `<main>` per page**. It should not contain site navigation, headers, or footers. Screen reader users can skip directly to `<main>` to bypass repeated navigation.

### `<footer>`

The concluding content of a page or section:

```html
<footer>
  <p>&copy; 2025 My Site. All rights reserved.</p>
  <nav>
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
  </nav>
</footer>
```

Like `<header>`, `<footer>` can appear inside an `<article>` or `<section>` to serve as that component's footer (e.g., "Author: Jane Doe, published 2025").

### `<nav>`

Navigation links — covered in [Lesson 04](./webdev_01_html_04_links_and_navigation.md). Pages can have multiple `<nav>` elements (main navigation + footer navigation + table of contents).

---

## Structural Landmarks

### `<article>`

A **self-contained, independently distributable piece of content** — something that makes sense on its own:

```html
<article>
  <header>
    <h2>How DNS Works</h2>
    <p>Published 13 April 2025</p>
  </header>
  <p>DNS translates domain names into IP addresses…</p>
  <footer>
    <p>Tags: networking, dns, fundamentals</p>
  </footer>
</article>
```

**Test:** Could this content be syndicated to another site (RSS, social media, another newsletter) and still make sense? If yes, it's an `<article>`. Good candidates: blog posts, news articles, forum posts, product cards, comments.

### `<section>`

A **thematic grouping of content** within a document — a logical chunk with a heading:

```html
<section>
  <h2>Prerequisites</h2>
  <p>Before starting this unit, you should have…</p>
</section>

<section>
  <h2>Learning Objectives</h2>
  <ul>…</ul>
</section>
```

Every `<section>` should have a heading. If it doesn't, it's probably a `<div>`.

**`<article>` vs `<section>`:** use `<article>` for self-contained content that stands independently; use `<section>` for a thematic subdivision of a larger document.

### `<aside>`

Content that is **tangentially related** to the surrounding content — a sidebar, callout, advertisement, or related links that could be removed without damaging the main content flow:

```html
<main>
  <p>The HTTP request-response cycle is the foundation of all web communication.</p>

  <aside>
    <h3>Did You Know?</h3>
    <p>HTTP/3 uses UDP instead of TCP for faster connection setup.</p>
  </aside>

  <p>Every browser request follows the same pattern…</p>
</main>
```

---

## Generic Containers — `<div>` and `<span>`

These two elements carry **no semantic meaning** — they are neutral containers.

| Element | Display | Use when |
| :--- | :--- | :--- |
| `<div>` | Block | No semantic element fits; need to group block content for CSS/layout |
| `<span>` | Inline | No semantic element fits; need to target inline text for CSS/JavaScript |

```html
<!-- div: wrapping elements for CSS layout -->
<div class="card-grid">
  <article>…</article>
  <article>…</article>
</div>

<!-- span: targeting text inline -->
<p>The <span class="highlight">DOM</span> is the browser's working model of the page.</p>
```

> **⚠️ Warning:** `<div>` is not a default. Before reaching for `<div>`, ask: is there a semantic element that describes what this region actually *is*? `<div>` is for cases where the answer is genuinely "no."

---

## The Impact of Semantics

| Audience | How they benefit |
| :--- | :--- |
| **Screen reader users** | Can jump between landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`) without reading every element |
| **Keyboard users** | Landmark navigation is built-in browser behaviour for semantic elements |
| **Search engines** | Tag choice signals importance and relationships; `<article>` content is weighted differently from `<aside>` |
| **Developers** | Self-documenting HTML is faster to read, easier to maintain |

---

## A Complete Semantic Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Course — Web Development</title>
</head>
<body>

  <header>
    <a href="/">IT Learning Hub</a>
    <nav>
      <a href="/courses">Courses</a>
      <a href="/wiki">Wiki</a>
    </nav>
  </header>

  <main>
    <h1>Web Development</h1>

    <section>
      <h2>Course Overview</h2>
      <p>From foundations to full-stack…</p>
    </section>

    <section>
      <h2>Units</h2>
      <article>
        <h3>Unit 00 — Web Foundations</h3>
        <p>How the web works before you write any code.</p>
      </article>
      <article>
        <h3>Unit 01 — HTML</h3>
        <p>Structuring content with meaning.</p>
      </article>
    </section>
  </main>

  <aside>
    <h2>Related Resources</h2>
    <ul>
      <li><a href="/wiki/networking">Networking Wiki</a></li>
    </ul>
  </aside>

  <footer>
    <p>&copy; 2025 IT Learning Hub</p>
    <nav>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>

</body>
</html>
```

---

## Key Takeaways

- Semantic elements describe the **role** of content, not how it looks.
- Page landmarks: `<header>`, `<main>` (exactly one per page), `<footer>`, `<nav>`.
- Structural elements: `<article>` (self-contained), `<section>` (thematic group with heading), `<aside>` (tangential).
- `<div>` and `<span>` carry no meaning — use them only when no semantic element fits.
- Semantic HTML is the foundation of accessibility and SEO — not an optional polish step.

## Research Questions

> **🔬 Research Question:** What is the accessibility tree? How does it differ from the DOM, and what role does it play in connecting your HTML to screen readers and other assistive technologies?
>
> *Hint: Search "accessibility tree browser MDN" and "AOM accessibility object model".*

> **🔬 Research Question:** What are ARIA landmark roles (`role="main"`, `role="navigation"`, etc.)? When should you use them instead of semantic HTML elements — and when should you prefer the HTML element?
>
> *Hint: Search "ARIA landmarks vs HTML5 semantic elements" and "first rule of ARIA".*
