---
type: lesson
title: "Links & Navigation"
description: "The \"HT\" in HTML stands for HyperText — and hypertext means links. The ability to connect documents together is what turned a file-sharing protocol into the World Wide Web. The `<a>` element is how..."
duration_minutes: 15
tags:
  - html
  - anchor
  - links
  - navigation
  - urls
  - href
---

# Links & Navigation

> **Lesson Summary:** The "HT" in HTML stands for HyperText — and hypertext means links. The ability to connect documents together is what turned a file-sharing protocol into the World Wide Web. The `<a>` element is how you create those connections, and understanding it means understanding relative vs. absolute URLs, link targets, accessibility requirements, and how navigation landmarks structure a page.

![Glowing blue arrows connecting floating document cards on a dark background, representing hyperlinks](../../../Assets/Images/webdev/html/html_links_navigation.png)

## The Anchor Element

The `<a>` element creates a **hyperlink**. Click it, and the browser navigates to the resource specified in its `href` attribute.

```html
<a href="https://developer.mozilla.org">MDN Web Docs</a>
```

The content between the opening and closing tags is the **link text** — what the user sees and clicks. The `href` attribute is the destination.

> **⚠️ Warning:** A link with no `href` attribute is not a link — it is just styled text. It will not be keyboard-focusable. Do not create fake links with `<span>` and click handlers; use a real `<a href="…">`.

---

## Absolute vs. Relative URLs

The `href` value can be an **absolute URL** or a **relative URL**.

### Absolute URLs

An absolute URL contains the complete address — protocol, domain, and path:

```html
<a href="https://example.com/about">About Us</a>
```

Use absolute URLs when linking to **a different website**.

### Relative URLs

A relative URL describes the path *relative to the current document's location*:

```html
<!-- From /products/index.html, these link to: -->

<a href="shoes.html">Shoes</a>
<!-- → /products/shoes.html -->

<a href="../contact.html">Contact</a>
<!-- → /contact.html  (../ means "go up one directory") -->

<a href="/about.html">About</a>
<!-- → /about.html  (/ means "from the site root") -->
```

Use relative URLs when linking to **pages within your own site**. They continue to work correctly regardless of which domain or server the site is deployed to.

| Prefix | Meaning |
| :--- | :--- |
| (no prefix) | Same directory |
| `../` | One directory up |
| `../../` | Two directories up |
| `/` | Site root |

---

## Fragment Links

A fragment link scrolls the page to a specific element — identified by its `id` attribute:

```html
<!-- Link to a section on the same page -->
<a href="#installation">Jump to Installation</a>

<!-- The target element -->
<h2 id="installation">Installation</h2>
```

The `#` prefix means "find the element with this `id` on the current page." Fragment links can also be appended to absolute or relative URLs:

```html
<a href="/docs/setup.html#prerequisites">Setup Prerequisites</a>
```

> **💡 Tip:** Fragment links do not cause a network request — the `#…` portion never reaches the server. It is processed entirely in the browser. (You covered this in Unit 00 — Web Foundations.)

---

## Link Targets

The `target` attribute controls where the linked page opens:

```html
<!-- Opens in the current tab (default behaviour) -->
<a href="https://example.com">Default</a>

<!-- Opens in a new tab -->
<a href="https://example.com" target="_blank">New tab</a>
```

When using `target="_blank"`, **always add `rel="noopener"`**:

```html
<a href="https://example.com" target="_blank" rel="noopener">External Link</a>
```

Without `rel="noopener"`, the opened page can access your page's `window` object via `window.opener` — a security vulnerability known as **reverse tabnapping**.

> **⚠️ Warning:** Don't open every external link in a new tab by reflex. Unexpectedly opening new tabs breaks the Back button and surprises users — especially those using screen readers. Reserve `target="_blank"` for cases where context requires it (e.g., leaving a checkout flow to read terms, where navigating away would lose progress).

---

## Linking to Email and Phone

`href` is not limited to web URLs:

```html
<!-- Opens the user's default email client -->
<a href="mailto:hello@example.com">Email us</a>

<!-- With a pre-filled subject -->
<a href="mailto:hello@example.com?subject=Support%20Request">Contact Support</a>

<!-- Triggers a phone call on mobile -->
<a href="tel:+15551234567">+1 (555) 123-4567</a>
```

---

## Link Text — The Accessibility Requirement

Your link text must make sense **out of context**. Screen readers often navigate pages by cycling through links only — without the surrounding text.

```html
<!-- ❌ Terrible link text — means nothing without context -->
<p>To read our privacy policy, <a href="/privacy">click here</a>.</p>

<!-- ✅ Descriptive link text — works in isolation -->
<p>Read our <a href="/privacy">privacy policy</a>.</p>
```

The same rule applies to `title` attributes and `aria-label` overrides — but fixing the link text itself is always the right first move.

---

## Navigation with `<nav>`

A group of navigation links should be wrapped in a `<nav>` element — a semantic landmark that tells browsers, screen readers, and search engines: "this is the site's navigation."

```html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/courses">Courses</a>
  <a href="/contact">Contact</a>
</nav>
```

A page can have multiple `<nav>` elements — for example, a main site navigation and a within-page table of contents. Screen reader users can jump directly to `<nav>` landmarks to find links quickly.

> **💡 Tip:** `<nav>` does not have to contain a `<ul>`. Some navigation menus use `<ul>` + `<li>` for structure (valid and often good). Some are flat lists of `<a>` elements. The requirement is that navigation links live inside `<nav>` — not a specific internal structure.

---

## Key Takeaways

- `<a href="…">` creates hyperlinks. The `href` is always required for a real link.
- Absolute URLs include the full address; relative URLs describe a path from the current location. Use relative URLs within your own site.
- Fragment links (`#id`) scroll to an element — they never reach the server.
- `target="_blank"` always requires `rel="noopener"` for security.
- Link text must be **descriptive out of context** — never "click here."
- Wrap navigation links in `<nav>` to create a semantic landmark.

## Research Questions

> **🔬 Research Question:** What is `rel="noreferrer"` and how does it differ from `rel="noopener"`? Is there a case where you would use one but not the other?
>
> *Hint: Search "rel noopener noreferrer difference" and "HTTP Referer header".*

> **🔬 Research Question:** What is the `download` attribute on `<a>` elements? What security restrictions does the browser enforce on it?
>
> *Hint: Search "HTML a download attribute MDN" and "same-origin download restriction".*
