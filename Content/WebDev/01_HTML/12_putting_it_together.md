---
title: "Putting It Together"
lesson_plan: "HTML"
order: 12
duration_minutes: 25
sidebar_position: 12
tags:
  - html
  - challenge
  - project
  - semantic
  - capstone
---

# Putting It Together

> **Lesson Summary:** You have learned every significant HTML element. Now you will use all of them — without guidance. This is a challenge, not a tutorial. There is no step-by-step walkthrough. You are given a target, a set of requirements, and the tools you have built over the preceding eleven lessons. The rest is up to you.

![A glowing developer profile page layout showing a portrait, name, bio, skills, and contact section on a dark background](../../../Assets/Images/webdev/html/html_capstone.png)

---

## The Target

Below is the finished page you are building. Study it carefully. Everything you need to reproduce it is covered in this unit.

<iframe
  src="/assets/HTML/webdev/html_capstone_target.html"
  title="Target: Alex Chen developer profile page"
  width="100%"
  height="700"
  style={{ border: "1px solid #d8d3c8", borderRadius: "4px" }}
  loading="lazy"
></iframe>

> **💡 Tip:** Right-click the iframe and open it in a new tab to inspect it in full. Use your browser's **View Page Source** (`Ctrl+U` / `Cmd+U`) only *after* you have made a genuine attempt. Looking first teaches you nothing.

---

## Requirements

You are building a **developer profile page** — a personal page that an early-career developer might use as a portfolio landing page.

Your submission must meet every requirement below. These are not suggestions.

### Structure
- [ ] Valid HTML5 document: `<!DOCTYPE html>`, correct `<html lang>`, `<head>`, `<body>`
- [ ] `<meta charset="UTF-8">` as the first element inside `<head>`
- [ ] `<meta name="viewport">` set correctly for mobile
- [ ] `<title>` — unique, descriptive, under 60 characters
- [ ] `<meta name="description">` — 150 characters or fewer

### Page regions
- [ ] A `<header>` containing the person's name as an `<h1>` and their role/location as supplementary text
- [ ] A `<nav>` with at least four fragment links (`#id`) pointing to sections on the page
- [ ] A `<main>` element wrapping all primary content
- [ ] A `<footer>` with a copyright notice

### Content sections (all inside `<main>`)
Each section must use `<section>` with a correct `<h2>` heading and the matching `id` referenced by the `<nav>`.

**About section** must contain:
- [ ] A `<figure>` with an `<img>` and a `<figcaption>`. The `<img>` must have a meaningful `alt` attribute and explicit `width`/`height` attributes.
- [ ] At least two `<p>` elements of bio text
- [ ] One `<blockquote>` — a real or invented quote from the subject

**Skills section** must contain:
- [ ] An unordered list (`<ul>` + `<li>`) of at least six skills

**Experience section** must contain:
- [ ] A `<table>` with `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, and `<td>`
- [ ] At least three experience rows

**Contact section** must contain:
- [ ] A `<dl>` with at least three contact methods, using `<dt>` and `<dd>`
- [ ] At least one `mailto:` link and one external link with correct `rel="noopener"`

### Accessibility
- [ ] All form controls (if any) have associated `<label>` elements
- [ ] No interactive element is built from a `<div>` or `<span>`
- [ ] Focus outlines are not removed

---

## Rules

1. **No CSS frameworks** — no Bootstrap, no Tailwind. You may write your own CSS.
2. **No JavaScript** — this is a pure HTML exercise. The target page works with no JavaScript at all.
3. **No copying the source** — do the work. Use the target as a reference; use your own content.
4. **Validate your work** — paste your finished HTML into the [W3C Markup Validation Service](https://validator.w3.org/#validate_by_input). Fix all errors before you consider it done.

---

## What to Submit

A single `.html` file. Open it in your browser. It should look and work like the target — without being identical, because you will use your own content.

---

## Self-Assessment

When you are done, answer these questions without looking anything up. If you cannot, re-read the relevant lesson.

1. Why is `<!DOCTYPE html>` on the very first line, with nothing before it?
2. What is the difference between the `alt` attribute on your `<img>` and the `<figcaption>` text?
3. Why does `<nav>` contain fragment links (`#about`, `#skills`, etc.) rather than full file links?
4. Why is `scope="col"` on your `<th>` elements? What breaks if you omit it?
5. Your `<dl>` contains contact details. Why is `<dl>` more appropriate here than `<ul>`?
6. Your external links have `rel="noopener"`. What does it prevent?
7. One of your links uses `mailto:`. What happens when a user on a phone clicks it?
8. Open your finished page in DevTools → Elements. Find one example of a text node that is a separate child from an element node in the same parent. What does that tell you?
