---
title: "Unit Review — HTML"
lesson_plan: "HTML"
type: "review"
sidebar_position: 999
sidebar_label: "Review & Summary"
---

# Unit Review — HTML

> Work through this review without looking back at the lessons. Every question is answerable from memory if you have genuinely absorbed the material. If you draw a blank, note it — then go back and re-read that lesson before moving on to CSS.

---

## What You Covered

| Lesson | Core Idea |
| :--- | :--- |
| **01 — Document Structure** | Every HTML file requires `<!DOCTYPE html>`, `<html lang>`, `<head>`, and `<body>`. Missing any causes silent failures. |
| **02 — The DOM** | The browser converts HTML into a live tree of objects — the DOM. CSS and JavaScript interact with the DOM, not the raw file. |
| **03 — Text Elements** | Elements describe meaning, not appearance. Headings declare hierarchy; `<strong>` declares importance; `<em>` declares stress. |
| **04 — Links & Navigation** | `<a href>` creates hyperlinks. Absolute vs. relative URLs. Fragment links. `rel="noopener"` on `target="_blank"`. `<nav>` as a landmark. |
| **05 — Images & Media** | `<img>` requires `src`, `alt`, `width`, and `height`. `<figure>`/`<figcaption>` for captioned images. `<video>` and `<audio>` with `<source>`. |
| **06 — Lists** | `<ul>` for unordered, `<ol>` for ordered, `<dl>` for term–definition pairs. |
| **07 — Tables** | Tables are for tabular data, not layout. `<thead>`, `<tbody>`, `<th scope>`, `colspan`, `rowspan`, `<caption>`. |
| **08 — Forms** | `<label for>` is always required. `<input type>` controls mobile keyboard and validation. `method="post"` for sensitive data. `<fieldset>`/`<legend>` for groups. |
| **09 — Semantic HTML** | `<header>`, `<main>` (one per page), `<footer>`, `<nav>`, `<article>`, `<section>`, `<aside>`. `<div>`/`<span>` are last resorts. |
| **10 — The `<head>`** | `charset`, `viewport`, `title`, `description`, Open Graph, `<link rel="stylesheet">`, `<script defer>`. |
| **11 — Accessibility Basics** | Correct semantic HTML is the primary accessibility tool. Keyboard operability. Never remove focus outlines. Alt text. Label associations. Contrast 4.5:1. |
| **12 — Putting It Together** | Applied all concepts to build a complete, valid, semantic HTML developer profile page. |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **DOM** | Document Object Model — the browser's live, in-memory tree of objects built from HTML |
| **Element node** | A DOM node representing an HTML element |
| **Text node** | A DOM node containing text content |
| **Semantic HTML** | Choosing elements that communicate the *role* of content, not its appearance |
| **Landmark** | A named region of a page (`<header>`, `<main>`, `<nav>`, `<footer>`) that assistive technologies use for navigation |
| **Void element** | An element with no content and no closing tag — `<img>`, `<meta>`, `<br>`, `<hr>`, `<input>` |
| **Inline element** | An element that flows within text — `<strong>`, `<em>`, `<a>`, `<span>` |
| **Block element** | An element that starts on a new line and occupies the full available width — `<p>`, `<h1>`, `<div>` |
| **Fragment link** | A link whose `href` starts with `#` — navigates to an element with that `id` on the same page |
| **Absolute URL** | A URL containing the full address — protocol, domain, path |
| **Relative URL** | A URL describing a path relative to the current document's location |
| **`alt` attribute** | Alternative text for an image — read by screen readers, shown if image fails to load |
| **`<figure>`** | A self-contained content unit — image, diagram, code — that can be moved without breaking document flow |
| **`<fieldset>`** | Groups related form controls under a shared `<legend>` label |
| **`required`** | An HTML attribute that prevents form submission if the field is empty |
| **`defer`** | Script attribute — downloads in parallel with HTML parsing, executes after DOM is complete |
| **Open Graph** | Meta tag protocol controlling how a page appears when shared to social media |
| **Quirks Mode** | A legacy browser parsing mode triggered by a missing `<!DOCTYPE html>` |
| **`scope` attribute** | On `<th>` — declares whether the header applies to its column (`col`) or row (`row`) |
| **Accessibility tree** | A parallel representation of the page that browsers expose to screen readers and assistive technologies |
| **WCAG** | Web Content Accessibility Guidelines — the international standard for accessible web content |
| **Focus indicator** | The visible outline shown on a keyboard-focused element |
| **`:focus-visible`** | A CSS pseudo-class that applies styles only for keyboard/sequential navigation focus |
| **Contrast ratio** | A measure of the difference in luminance between text and background; WCAG AA requires 4.5:1 for body text |
| **ARIA** | Accessible Rich Internet Applications — HTML attributes that supplement accessibility information on custom widgets |
| **`tabindex`** | An attribute controlling whether and in what order an element receives keyboard focus |

---

## Quick Check

Answer these without looking at the lessons. Write full answers.

1. What happens if you load an HTML page that has no `<!DOCTYPE html>` declaration? What specifically changes in the browser's interpretation?

2. Explain the difference between the HTML file and the DOM. If JavaScript adds a `<div>` to the page, what happens to the HTML file on disk?

3. A designer wants a heading to look smaller than a `<h3>`. They suggest using `<h5>` for a top-level section heading. What is wrong with this approach, and what should they do instead?

4. You have an image that is purely decorative — it adds no information. What `alt` value do you give it, and why does leaving the attribute out entirely cause a different problem?

5. Write the HTML for an external link that opens in a new tab. What attributes are required for security, and what does each protect against?

6. A colleague builds a navigation menu using `<div>` elements with click handlers. List three concrete problems this creates compared to using `<ul>` + `<li>` + `<a>`.

7. You have a form with a credit card number field. Should it use `method="get"` or `method="post"`? Explain the difference and why it matters here.

8. What is the difference between `<article>` and `<section>`? Give one example where each is the correct choice.

9. You include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. What does it do, and what happens to a responsive CSS layout if you omit it?

10. A `<script src="app.js">` in `<head>` without any attributes blocks page rendering. Explain why — and how `defer` and `async` each change this behaviour. When would you choose each?

---

## Common Misconceptions

> **❌ "HTML controls how things look."**
> HTML only declares what content is and what it means. Appearance is entirely CSS's domain. A `<h1>` declares "this is the primary heading" — the browser's default large-bold rendering is just a convenience style, overridable with one CSS rule.

> **❌ "The browser displays the HTML file."**
> The browser parses the HTML file and constructs the DOM. CSS and JavaScript interact with the DOM. If you open DevTools → Elements, you are looking at the live DOM — not the source HTML. They can differ significantly after JavaScript runs.

> **❌ "`alt` and `placeholder` are the same idea."**
> `alt` describes an image's content for users who cannot see it — it is content. `placeholder` is a short hint inside an empty input field — it disappears when the user starts typing and must never replace a `<label>`.

> **❌ "Tables are old and should be avoided."**
> Tables are old — and they remain the correct element for tabular data. The outdated pattern was *using tables for layout*. A comparison table of HTTP status codes belongs in a `<table>`. The aversion to tables is misapplied.

> **❌ "Accessibility is for disabled users only."**
> Accessible HTML is better HTML for everyone: larger click targets improve mobile usability; keyboard navigation helps power users; high contrast helps users in bright sunlight; semantic structure helps developers maintain code. Accessibility is a quality attribute, not a niche feature.

> **❌ "`<div>` is the default container."**
> `<div>` carries no semantic meaning and should be a last resort. Before using `<div>`, ask: is there a semantic element that describes what this region is? `<article>`, `<section>`, `<aside>`, `<header>`, `<main>`, `<footer>`, `<nav>` exist precisely to replace `<div>` in most cases.

---

## What Comes Next

The next unit is **CSS** — and you are now exactly where you need to be to learn it. You understand the DOM tree that CSS operates on. You can write valid, semantic HTML that CSS can target with precision. You know that HTML describes meaning; CSS will now describe *appearance*. Every property, selector, and layout model you learn in CSS will be applied to the same element nodes you have been writing in this unit.

CSS unit covers: the box model, selectors, specificity, the cascade, typography, colour, layouts (flexbox and grid), responsive design, and animation.
