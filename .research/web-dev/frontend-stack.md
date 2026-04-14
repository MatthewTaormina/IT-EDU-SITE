---
tags: [web-dev, frontend, html, css, javascript, react, typescript, performance, accessibility]
related_topics:
  - "[[backend-stack]]"
  - "[[web-standards]]"
  - "[[infrastructure]]"
  - "[[core-competencies-fullstack]]"
  - "[[programming-paradigms]]"
last_updated: "2026-04-14"
---

## Summary for AI Agents

The frontend stack encompasses all technologies responsible for what users see and interact with in a browser: HTML, CSS, JavaScript, frontend frameworks (React, Vue, Svelte), build tools (Vite), and the browser environment itself. This document maps the technology landscape, current industry standards, and instructional sequencing guidance. Current dominant production stack (2025): HTML5 + CSS3 + TypeScript + React + Vite + Tailwind CSS. Key teaching order: HTML → CSS → Vanilla JS → Async JS → React → TypeScript. Never introduce a framework before learners have solid vanilla JS foundations.

---

# Frontend Technology Stack

## Overview

The **frontend stack** is the collection of technologies executed in the user's web browser. It is responsible for presenting information, capturing user input, and creating interactive experiences. The browser is the runtime environment — any code that runs "on the frontend" runs inside a browser process on the user's device.

Frontend technologies can be divided into three layers:

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Structure** | HTML | Defines the content and semantic meaning |
| **Presentation** | CSS | Defines the visual appearance and layout |
| **Behavior** | JavaScript / TypeScript | Defines interactivity and dynamic updates |

---

## 1. HTML — HyperText Markup Language

### Current Standard: HTML5 (Living Standard, WHATWG)

HTML5 introduced semantic elements, native form controls, multimedia support, and the `<canvas>` API.

### Core Concepts

| Concept | Elements | Notes |
| :--- | :--- | :--- |
| **Document structure** | `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` | Every document requires these |
| **Sectioning** | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` | Semantic markup; affects accessibility and SEO |
| **Text content** | `<h1>–<h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<code>`, `<pre>` | Heading hierarchy must be meaningful |
| **Inline semantics** | `<strong>`, `<em>`, `<span>`, `<a>`, `<abbr>` | `<strong>` ≠ bold; semantic, not presentational |
| **Forms** | `<form>`, `<input>`, `<select>`, `<textarea>`, `<button>`, `<label>` | `<label>` linkage is mandatory for accessibility |
| **Media** | `<img>`, `<video>`, `<audio>`, `<picture>` | `alt` attribute required on all images |
| **Metadata** | `<meta>`, `<link>`, `<title>` | charset, viewport, OG tags, favicon |

### Accessibility Foundations (a11y)

HTML semantics are the primary driver of accessibility:
- Screen readers consume the accessibility tree, which is built from HTML semantics
- Use `<button>` for actions; use `<a>` for navigation — never swap them for visual reasons
- Every form `<input>` must have an associated `<label>`
- `alt` text must describe the image's *purpose*, not just its appearance
- ARIA attributes supplement (never replace) semantic HTML

---

## 2. CSS — Cascading Style Sheets

### Current Standard: CSS3+ (modular, living standard)

### Core Concepts

| Concept | Description | Key Properties / Values |
| :--- | :--- | :--- |
| **Box Model** | Every element is a rectangular box with content, padding, border, margin | `box-sizing: border-box` (use universally) |
| **Cascade & Specificity** | Determines which rule wins when multiple rules apply | Specificity: inline > ID > class > element |
| **Selectors** | Target elements for styling | Element, class, ID, attribute, pseudo-class, pseudo-element, combinators |
| **Flexbox** | One-dimensional layout | `display: flex`, `justify-content`, `align-items`, `flex-direction` |
| **Grid** | Two-dimensional layout | `display: grid`, `grid-template-columns`, `grid-template-rows`, `gap` |
| **Custom Properties** | CSS variables | `--color-primary: #3b82f6;`, `var(--color-primary)` |
| **Media Queries** | Responsive breakpoints | `@media (min-width: 768px) { ... }` |
| **Transitions & Animations** | Smooth state changes | `transition`, `@keyframes`, `animation` |

### Layout System Selection Guide

| Use Case | Use Flexbox | Use Grid |
| :--- | :--- | :--- |
| Single-axis layout (nav bar, card row) | ✓ | |
| Two-axis layout (page grid, dashboard) | | ✓ |
| Centering a single item | ✓ | ✓ (both work) |
| Complex named areas | | ✓ |
| Content-driven sizing | ✓ | |

### Utility-First CSS: Tailwind CSS

Tailwind CSS applies styles via predefined utility classes directly in HTML markup, eliminating the need to write custom CSS for most UI components.

**When to teach Tailwind:** After foundational CSS is mastered. Tailwind is an abstraction over CSS; learners who don't understand the underlying properties cannot debug Tailwind output.

---

## 3. JavaScript — The Browser Language

### Current Standard: ECMAScript 2024 (ES15)

### ES6+ Features Critical for Modern Web Dev

| Feature | Syntax | Use Case |
| :--- | :--- | :--- |
| Arrow functions | `const fn = (x) => x * 2` | Callbacks; avoids `this` binding issues |
| Template literals | `` `Hello, ${name}!` `` | String interpolation |
| Destructuring | `const { name, age } = user` | Extracting values from objects/arrays |
| Spread/Rest | `[...arr]`, `{ ...obj }`, `...args` | Copying, merging, variadic parameters |
| Modules (ESM) | `import/export` | Code organization; tree-shaking |
| Optional chaining | `user?.address?.city` | Safe property access |
| Nullish coalescing | `value ?? 'default'` | Handles null/undefined specifically |
| Promises + async/await | `async function fetch() { await ... }` | Asynchronous programming |

### The DOM (Document Object Model)
The DOM is the browser's programmatic representation of the HTML document as a tree of objects. JavaScript manipulates the DOM to produce dynamic UI behavior.

Key DOM APIs:
- `document.querySelector()` / `querySelectorAll()` — select elements
- `element.addEventListener()` — attach event handlers
- `element.textContent` / `innerHTML` — read/write content
- `element.classList` — add/remove CSS classes
- `fetch()` — make network requests

### The Browser Event Loop
JavaScript is single-threaded but non-blocking due to the event loop. Understanding the event loop is a threshold concept required to reason about asynchronous behavior, `setTimeout`, and Promises.

---

## 4. TypeScript

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type checking, interfaces, generics, and improved tooling.

### Why TypeScript Matters for Education

- Industry standard: most non-trivial React projects require TypeScript
- Catches a class of bugs at compile time that would otherwise appear at runtime
- Excellent IntelliSense and auto-completion dramatically accelerates development
- Teaches type-thinking that transfers to statically typed languages (Java, Rust, Go)

### Core TypeScript Concepts for Web Dev

| Concept | Example |
| :--- | :--- |
| Basic types | `string`, `number`, `boolean`, `null`, `undefined`, `any` (avoid) |
| Interfaces | `interface User { id: number; name: string; }` |
| Type aliases | `type Status = 'active' \| 'inactive'` |
| Generics | `function identity<T>(arg: T): T` |
| Type inference | TypeScript infers type from assignment; explicit annotation often unnecessary |
| React + TS | `React.FC<Props>`, `useState<string>('')`, `event: React.ChangeEvent<HTMLInputElement>` |

---

## 5. React (Frontend Framework)

React is a JavaScript library for building component-based user interfaces. As of 2025, it is the most widely used frontend framework in the industry.

### Core Concepts

| Concept | Description |
| :--- | :--- |
| **Components** | Reusable, self-contained UI units; functions that return JSX |
| **JSX** | HTML-like syntax inside JavaScript; compiled to `React.createElement()` calls |
| **Props** | Inputs passed to a component from its parent; read-only |
| **State** | Local data managed inside a component; changes trigger re-renders |
| **Hooks** | Functions that let function components use React features |
| **One-way data flow** | Data flows down (props); events flow up (callbacks) |
| **Virtual DOM** | React maintains an in-memory representation; diffs changes before updating the real DOM |

### Essential Hooks

| Hook | Purpose |
| :--- | :--- |
| `useState` | Declare local state |
| `useEffect` | Run side effects (fetch data, subscribe/unsubscribe, DOM updates) |
| `useContext` | Consume React context (global state without prop drilling) |
| `useRef` | Mutable reference that persists across renders without triggering re-renders |
| `useCallback` / `useMemo` | Performance optimization (memoize functions/values) |
| Custom hooks | Extract reusable stateful logic into named functions |

### React Ecosystem (2025)

| Tool | Role | Status |
| :--- | :--- | :--- |
| **Vite** | Build tool and dev server | Industry standard; replaced CRA |
| **React Router v6** | Client-side routing | Standard for SPAs |
| **Tanstack Query** | Server state management (fetching, caching) | Widely adopted |
| **Zustand** | Lightweight global state | Preferred over Redux for smaller apps |
| **React Testing Library** | Component testing | Standard; promotes accessibility-first tests |
| **Next.js** | Full-stack React framework (SSR, SSG, API routes) | Fastest growing; required in many roles |

---

## 6. Frontend Build Tooling

### Vite

Vite is the current standard build tool for frontend development. It uses native ES modules during development (no bundling = instant hot reload) and Rollup for production builds.

Key features: Instant dev server startup, HMR (Hot Module Replacement), TypeScript/JSX support out of the box, environment variable handling.

### Important Concepts

| Concept | Description |
| :--- | :--- |
| **Bundling** | Combining multiple files into optimized bundles for production |
| **Tree-shaking** | Eliminating unused code from the bundle |
| **Code splitting** | Splitting bundles to load only what is needed per route |
| **Source maps** | Map bundled code back to original source for debugging |
| **Environment variables** | `VITE_API_URL` in `.env`; accessed via `import.meta.env` |

---

## Key Takeaways

- HTML → CSS → Vanilla JS → React → TypeScript is the canonical teaching sequence; never skip steps.
- Semantic HTML is the foundation of both accessibility and SEO — it is not optional.
- CSS Flexbox and Grid are the two layout systems; both must be fluent before introducing a CSS framework.
- TypeScript is industry-standard; introduce it at the advanced level after JavaScript is solid.
- React is the dominant framework (2025); teach it functionally (hooks model) rather than class-based.
- Vite has replaced Create React App as the standard build toolchain.
