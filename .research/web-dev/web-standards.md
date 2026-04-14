---
tags: [web-dev, web-standards, http, html5, css3, wcag, w3c, whatwg, web-platform]
related_topics:
  - "[[frontend-stack]]"
  - "[[backend-stack]]"
  - "[[infrastructure]]"
  - "[[core-competencies-fullstack]]"
last_updated: "2026-04-14"
---

## Summary for AI Agents

Web standards are the specifications maintained by bodies (W3C, WHATWG, IETF, ECMA International) that define how web technologies work interoperably across browsers and environments. Key standards for IT education: HTML Living Standard (WHATWG), CSS specifications (W3C), ECMAScript (ECMA-262), HTTP/1.1, HTTP/2, HTTP/3 (IETF), WCAG 2.1 (W3C), and the Web Platform (APIs defined in browsers). Understanding standards vs. implementations is critical: standards define the target; browsers implement them (with varying fidelity). This document maps the standards landscape and their educational relevance.

---

# Modern Web Standards

## Overview

**Web standards** are specifications that define the behavior of web technologies — HTML, CSS, JavaScript, HTTP, and browser APIs — in a way that is interoperable, vendor-neutral, and forward-compatible.

Web standards matter for IT education because they define the *correct* behavior of web technologies, independent of any specific browser's implementation. Teaching from standards produces learners who can reason about why a technology works the way it does, not just how to use it in a specific context.

---

## 1. The Standards Bodies

| Organization | Full Name | Standards Maintained |
| :--- | :--- | :--- |
| **W3C** | World Wide Web Consortium | CSS, SVG, WCAG, WebAssembly, MathML, many Web APIs |
| **WHATWG** | Web Hypertext Application Technology Working Group | HTML Living Standard, DOM, Fetch, URL, Storage, Encoding |
| **ECMA International** | European Computer Manufacturers Association | ECMAScript (JavaScript), JSON |
| **IETF** | Internet Engineering Task Force | HTTP/1.1, HTTP/2, HTTP/3, TLS, WebSocket, URI |
| **ISO/IEC** | International Standards Organization | Character sets, programming language standards (C, SQL) |

### W3C vs. WHATWG

Prior to 2019, both W3C and WHATWG maintained competing HTML specifications. In 2019, the W3C adopted the WHATWG HTML Living Standard as the single HTML specification. The WHATWG Living Standard is continuously updated and versioned through commits, not releases.

**Teaching implication:** When learners look up HTML specifications, they should use the WHATWG Living Standard at `html.spec.whatwg.org`. MDN Web Docs is the best educational implementation of these standards.

---

## 2. HTML — HyperText Markup Language

### Specification: WHATWG HTML Living Standard

The HTML Living Standard defines:
- Every HTML element, its semantics, and its permitted content model
- The document parsing algorithm (how browsers build the DOM from markup)
- The browser's event handling model
- Forms, scripting, the History API, and web component foundations

### Important Semantic Elements (HTML5 Era)

| Element | Semantic Meaning | Accessibility Impact |
| :--- | :--- | :--- |
| `<main>` | The primary content of the page | Landmark; aids screen reader navigation |
| `<nav>` | A navigation block | Landmark |
| `<header>` | Introductory content or navigational aids | Landmark |
| `<footer>` | Supplementary information | Landmark |
| `<article>` | Self-contained, independently distributable content | |
| `<section>` | A thematic grouping of content | Requires a heading to be meaningful |
| `<aside>` | Content tangentially related to the main content | Landmark (complementary) |
| `<figure>` + `<figcaption>` | A media element and its caption | Associates caption with figure |
| `<time>` | A date or time | Machine-readable with `datetime` attribute |

### The Content Model

Every HTML element has a **content model** — the rules governing what elements may appear inside it. Violating the content model produces invalid HTML that may be parsed inconsistently across browsers.

Examples:
- `<p>` cannot contain block-level elements (no `<div>` inside `<p>`)
- `<ul>` and `<ol>` may only directly contain `<li>` elements
- `<a>` cannot contain another `<a>`
- `<button>` cannot contain interactive content (no `<a>` inside `<button>`)

---

## 3. CSS — Cascading Style Sheets

### Specification: W3C CSS Specifications (Multiple Modules)

CSS3 is not a single specification — it is a collection of independently versioned *modules*:

| Module | Status (2025) | Educational Relevance |
| :--- | :--- | :--- |
| **CSS Selectors Level 4** | Candidate Recommendation | `:has()`, `:is()`, `:where()` are widely supported |
| **CSS Flexbox Level 1** | W3C Recommendation | Required; fully supported |
| **CSS Grid Layout Level 1** | W3C Recommendation | Required; fully supported |
| **CSS Custom Properties (Variables)** | W3C Recommendation | Required; taught as standard practice |
| **CSS Transitions Level 1** | W3C Recommendation | Required for UI polish |
| **CSS Animations Level 1** | W3C Recommendation | Required for interactive UI |
| **CSS Color Level 4** | W3C Recommendation | `oklch()`, `color-mix()` — growing adoption |
| **CSS Container Queries** | W3C Working Draft | Growing adoption; replaces many media query patterns |
| **CSS Cascade Layer** | W3C Recommendation | `@layer` — important for large codebase CSS management |

### Browser Compatibility

The fragmentation of CSS support across browsers is a real-world concern. Resources:
- **Can I Use** (`caniuse.com`) — compatibility tables for every CSS feature
- **Baseline** (web.dev/baseline) — tracks when features are "widely available" across all major browsers
- **Autoprefixer** (PostCSS plugin) — automatically adds vendor prefixes where needed

---

## 4. JavaScript — ECMAScript Standard

### Specification: ECMA-262 (ECMAScript)

ECMAScript is released annually. Key versions for education:

| Version | Year | Key Features |
| :--- | :--- | :--- |
| **ES6 / ES2015** | 2015 | Arrow functions, `let`/`const`, classes, modules, Promises, template literals, destructuring, generators |
| **ES2017** | 2017 | `async`/`await`, `Object.entries()`, `Object.values()` |
| **ES2019** | 2019 | `Array.flat()`, `Object.fromEntries()`, optional catch binding |
| **ES2020** | 2020 | Optional chaining (`?.`), nullish coalescing (`??`), `BigInt`, `Promise.allSettled()` |
| **ES2022** | 2022 | Class fields, `at()` method, `Object.hasOwn()`, `Array.at()` |
| **ES2024** | 2024 | `Promise.withResolvers()`, `Object.groupBy()`, `Map.groupBy()` |

> **💡 Tip:** For teaching, focus on ES6 features first (they transformed the language), then add post-ES6 features contextually as they appear in code learners encounter. Don't teach version history; teach features when relevant.

---

## 5. HTTP — HyperText Transfer Protocol

### Specification: IETF RFCs

HTTP is the application-layer protocol for the web. Three versions are in active use:

| Version | Year | Key Characteristics |
| :--- | :--- | :--- |
| **HTTP/1.1** | 1997 | Text-based; one request per connection; persistent connections via `Connection: keep-alive` |
| **HTTP/2** | 2015 | Binary framing; multiplexing (multiple requests per connection); header compression (HPACK); server push |
| **HTTP/3** | 2022 | Built on QUIC (UDP); eliminates head-of-line blocking at transport layer; faster connection establishment |

### HTTP Message Structure

**Request:**
```
GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGci...
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 89

{"id": 42, "name": "Alice", "email": "alice@example.com"}
```

### HTTPS and TLS

All modern web applications must use HTTPS. TLS (Transport Layer Security) encrypts the HTTP connection.

Key concepts:
- **TLS handshake**: Exchange of public keys and negotiation of session key
- **Certificate Authority (CA)**: Trusted third party that signs certificates (Let's Encrypt is free)
- **HSTS** (HTTP Strict Transport Security): Instructs browsers to only connect via HTTPS; prevents downgrade attacks

---

## 6. Web Accessibility (WCAG)

### Specification: WCAG 2.1 (W3C Recommendation, 2018)

**WCAG** (Web Content Accessibility Guidelines) defines standards for making web content accessible to people with disabilities.

### The POUR Principles

| Principle | Description |
| :--- | :--- |
| **Perceivable** | Information must be presentable to users in ways they can perceive (text alternatives, captions) |
| **Operable** | Interface must be operable by all users (keyboard navigation, no seizure-triggering content) |
| **Understandable** | Information must be understandable (readable, predictable, input assistance) |
| **Robust** | Content must be robust enough to be interpreted by assistive technologies |

### Conformance Levels

| Level | Requirement | Legal/Business Significance |
| :--- | :--- | :--- |
| **A** | Minimum; removes major barriers | Required baseline |
| **AA** | Standard target | Required by most laws (ADA, AODA, EU EN 301 549) |
| **AAA** | Highest; may not be achievable for all content | Aspirational |

### Quick Accessibility Checklist (HTML)

- [ ] All images have descriptive `alt` text (or `alt=""` for decorative images)
- [ ] All form inputs have associated `<label>` elements
- [ ] Color is never the *only* way information is conveyed
- [ ] Contrast ratio ≥ 4.5:1 for normal text (WCAG AA)
- [ ] All interactive elements are reachable and operable via keyboard
- [ ] Heading hierarchy is logical (no skipping from `<h1>` to `<h4>`)
- [ ] ARIA is used only when native HTML semantics are insufficient

---

## 7. Browser APIs (Web Platform)

The browser exposes hundreds of APIs defined by various standards. The most educationally relevant:

| API | Specification | Use Case |
| :--- | :--- | :--- |
| **Fetch API** | WHATWG Fetch | Make HTTP requests from JavaScript |
| **Web Storage** | WHATWG Storage | `localStorage`, `sessionStorage` |
| **IndexedDB** | W3C | Client-side structured data storage |
| **Service Worker** | W3C | Offline support; push notifications; background sync |
| **Web Components** | WHATWG/W3C | Custom HTML elements; Shadow DOM; HTML templates |
| **Canvas API** | WHATWG | 2D drawing |
| **WebGL** | Khronos Group | 3D graphics |
| **WebAssembly** | W3C / WHATWG | Near-native performance in the browser |
| **Geolocation** | W3C | Device location (with user permission) |

---

## Key Takeaways

- Web standards are maintained by multiple bodies; knowing which body owns which standard helps navigate documentation.
- The WHATWG HTML Living Standard replaced the versioned W3C HTML5 specification.
- CSS3 is a collection of modules, not a single specification; features are independently supported.
- ECMAScript is released annually; ES6 (2015) was the transformative release.
- HTTP/2 and HTTP/3 are in production but HTTP/1.1 semantics (methods, headers, status codes) are what developers interact with.
- WCAG 2.1 AA is the legal standard for web accessibility in most jurisdictions — it is not optional for professional web development.
