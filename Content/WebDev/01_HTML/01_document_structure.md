---
title: "Document Structure"
lesson_plan: "HTML"
order: 1
duration_minutes: 15
sidebar_position: 1
tags:
  - html
  - doctype
  - document-structure
  - head
  - body
---

# Document Structure

> **Lesson Summary:** Before you write a single visible element, every HTML document needs a skeleton — a specific set of outer tags that tell the browser what kind of document it is and where different types of content live. This lesson covers that skeleton: what each piece is, what it does, and why leaving any part out is a mistake.

![A glowing HTML document skeleton showing the DOCTYPE, html, head, and body tags on a dark background](../../../Assets/Images/webdev/html/html_document_structure.png)

## The Minimal Valid HTML Document

Every HTML file you will ever write begins with the same structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Page Title</title>
  </head>
  <body>
    <!-- Visible content goes here -->
  </body>
</html>
```

This is not boilerplate to memorise and forget. Each line has a specific job. Missing any of them causes real, silent problems.

---

## `<!DOCTYPE html>`

The very first line is not an HTML element — it is a **document type declaration**.

```html
<!DOCTYPE html>
```

It tells the browser: *"This document follows the modern HTML5 specification. Parse it accordingly."*

**Without it**, browsers fall back to a compatibility mode called **Quirks Mode** — a legacy parsing strategy designed to match the broken behaviour of 1990s browsers. In Quirks Mode, CSS layout and box model calculations work differently. Pages look wrong in unpredictable ways.

> **⚠️ Warning:** Quirks Mode is not a hypothetical problem. Missing `<!DOCTYPE html>` is one of the most common beginner mistakes. Always include it. Always as the very first line — nothing before it, not even a blank line.

---

## `<html lang="en">`

The `<html>` element is the **root element** — every other element in the document is a descendant of it.

The `lang` attribute declares the **primary language** of the document. This information is used by:

- **Screen readers** — to select the correct pronunciation engine and speak content accurately
- **Search engines** — to serve results in the right language to the right users
- **Browsers** — to offer the correct auto-translation prompt

```html
<html lang="en">     <!-- English -->
<html lang="fr">     <!-- French -->
<html lang="ar">     <!-- Arabic (also implies RTL direction) -->
```

> **💡 Tip:** `lang` is not cosmetic. A screen reader user whose system language is French, reading a page with `lang="en"`, will hear English text pronounced with French phonemes — which is essentially unintelligible. Get it right.

---

## `<head>`

The `<head>` element contains **document metadata** — information about the page that the browser and external services need, but that visitors never see directly.

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <link rel="stylesheet" href="styles.css" />
</head>
```

Common contents of `<head>`:

| Element | Purpose |
| :--- | :--- |
| `<meta charset="UTF-8">` | Character encoding — supports every human alphabet |
| `<meta name="viewport" …>` | Controls scaling on mobile devices |
| `<title>` | Text shown in the browser tab and search results |
| `<link rel="stylesheet">` | Attaches an external CSS file |
| `<script defer>` | Attaches an external JavaScript file |
| `<meta name="description">` | Search engine result snippet |

The `<head>` is covered in full in [Lesson 10 — The `<head>` Element](./10_the_head.md). For now, always include at minimum the `charset` and `title`.

> **⚠️ Warning:** `<meta charset="UTF-8">` must appear within the first 1024 bytes of the document. If it comes late, some browsers may misinterpret the characters before it — causing garbled text (mojibake) for any non-ASCII content.

---

## `<body>`

The `<body>` element contains everything that is **rendered and visible** to the user — all your headings, paragraphs, images, links, forms, and interactive components live here.

```html
<body>
  <h1>Hello, world</h1>
  <p>This is a paragraph.</p>
</body>
```

Everything you will learn in the remaining lessons of this unit goes inside `<body>`.

---

## How HTML Elements Work

Now is a good time to make sure the mechanics are clear.

An **HTML element** consists of:
- An **opening tag**: `<p>`
- **Content**: the text, other elements, or nothing
- A **closing tag**: `</p>`

```html
<p>This is a paragraph.</p>
```

Some elements are **void elements** — they have no content and no closing tag. They self-close:

```html
<meta charset="UTF-8" />
<img src="photo.jpg" alt="A photo" />
<br />
```

**Attributes** go inside the opening tag and provide additional information:

```html
<html lang="en">
<!--   ↑ attribute name  ↑ attribute value -->
```

**Nesting** — elements contained inside other elements — must be done correctly. If you open an element inside another, you must close it before closing the outer one:

```html
<!-- ✅ Correct nesting -->
<p>This is <strong>important</strong> text.</p>

<!-- ❌ Incorrect — overlapping tags -->
<p>This is <strong>important</p></strong>
```

Incorrect nesting causes the browser to guess your intent. It will usually recover, but the recovered structure may not be what you intended.

---

## Comments

HTML comments are not rendered — they are notes for developers only:

```html
<!-- This is a comment. The browser ignores it. -->
```

---

## Key Takeaways

- Every HTML file begins with `<!DOCTYPE html>` — omitting it triggers Quirks Mode.
- `<html lang="en">` is the root element; `lang` is required for accessibility and SEO.
- `<head>` holds metadata — information the browser needs but users don't see: charset, title, stylesheets, scripts.
- `<body>` holds all visible content.
- Elements have opening tags, content, and closing tags; void elements self-close.
- Nesting must be correct — inner elements must close before outer elements.

## Research Questions

> **🔬 Research Question:** What exactly is Quirks Mode, and what year did it emerge? Look up three specific CSS behaviours that differ between Quirks Mode and Standards Mode. Why do browsers still support it at all?
>
> *Hint: Search "CSS Quirks Mode MDN" and "IE5 box model".*

> **🔬 Research Question:** What is the difference between `UTF-8` and `UTF-16`? Why is `UTF-8` the universal default on the web?
>
> *Hint: Search "UTF-8 vs UTF-16 web" and "BOM byte order mark".*
