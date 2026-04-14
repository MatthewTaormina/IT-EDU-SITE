---
type: lesson
title: "ES Modules"
description: "Organize JavaScript into reusable modules using import and export, understand named vs. default exports, and use dynamic import() for lazy loading."
duration_minutes: 35
tags:
  - javascript
  - es6
  - modules
  - import
  - export
  - esm
---

# ES Modules

> **Lesson Summary:** ES Modules (ESM) are the native JavaScript module system. They let you split your code across files, explicitly declare what each file exposes (exports) and what it depends on (imports), and eliminate global scope pollution. Every modern JavaScript project uses them.

---

## Why Modules?

Before ES Modules, all JavaScript in a page shared one global scope:

```html
<script src="utils.js"></script>
<script src="app.js"></script>
<!-- Both files write to window.* — easy to have naming collisions -->
```

ES Modules solve this by giving each file its own scope:

```js
// utils.js
export function formatDate(date) { /* ... */ }

// app.js
import { formatDate } from './utils.js';
// Only formatDate is in scope — nothing else from utils.js leaks in
```

---

## Named Exports

**Named exports** allow a file to export multiple values by name:

```js
// math.js
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
```

Named exports can also be listed at the bottom:

```js
// math.js
const PI = 3.14159;
function add(a, b) { return a + b; }
function multiply(a, b) { return a * b; }

export { PI, add, multiply };
```

### Importing Named Exports

```js
import { PI, add } from './math.js';

console.log(add(2, 3));  // 5
console.log(PI);         // 3.14159
```

### Renaming on Import

```js
import { add as sum } from './math.js';
console.log(sum(2, 3)); // 5
```

### Importing Everything

```js
import * as Math from './math.js';
console.log(Math.add(2, 3)); // 5
console.log(Math.PI);        // 3.14159
```

---

## Default Exports

A file can have **one** default export — the "main thing" the module provides:

```js
// api.js
export default async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### Importing a Default Export

```js
import fetchUser from './api.js'; // no curly braces; choose any name
import getUser from './api.js';   // same export, different local name
```

> **💡 Tip:** Use named exports when a module has multiple things to export. Use a default export when the module has one primary purpose (a component, a utility function, a config object). Many style guides prefer named exports for everything because they are explicit and refactoring tools handle them better.

---

## Named + Default Together

A module can export both:

```js
// user-api.js
export const BASE_URL = '/api/users';

export default async function fetchUser(id) {
  return fetch(`${BASE_URL}/${id}`).then(r => r.json());
}
```

```js
import fetchUser, { BASE_URL } from './user-api.js';
```

---

## Module Scope

Each ES Module has its own scope. Variables declared at the top level of a module are **not** global — they are only accessible to code that explicitly imports them.

```js
// counter.js
let count = 0; // private to this module — not accessible from outside

export function increment() { count++; }
export function getCount() { return count; }
```

---

## Modules in the Browser

Use `type="module"` to enable ES Modules in an HTML `<script>` tag:

```html
<script type="module" src="./app.js"></script>
```

Key differences from regular scripts:
- Module scripts are **deferred** by default — they run after the DOM is parsed
- Each module file is fetched as a separate network request
- `import` paths must be explicit (e.g., `'./utils.js'` with the `.js` extension)

---

## Dynamic `import()`

`import()` loads a module lazily at runtime, returning a Promise:

```js
async function loadChartLibrary() {
  const { Chart } = await import('./chart.js');
  return new Chart('#canvas', config);
}

// The chart library is only fetched when this function is called
button.addEventListener('click', loadChartLibrary);
```

This is called **code splitting** — loading JavaScript only when it is needed, reducing initial page load size. Build tools like Vite use this pattern for automatic bundle optimization.

---

## Re-exporting

Modules can re-export from other modules — useful for creating a single entry point:

```js
// index.js — barrel file
export { fetchUser } from './user-api.js';
export { fetchPosts } from './post-api.js';
export { formatDate } from './utils.js';
```

```js
// Consumers import from one place
import { fetchUser, fetchPosts, formatDate } from './index.js';
```

---

## Key Takeaways

- ES Modules give each file its own scope — no global pollution.
- Named exports: `export const x` / `export function f()` → imported as `import { x, f } from './module.js'`.
- Default export: `export default value` → imported as `import anything from './module.js'`.
- Browser modules need `<script type="module">` and explicit `.js` extension in import paths.
- Dynamic `import()` loads modules lazily at runtime — essential for code splitting.

---

## Challenge: Module Refactor

Take the GitHub search code from Unit 01 (Lesson 6) and split it into three modules:

1. **`api.js`** — exports a named `searchRepositories(query, page)` function
2. **`ui.js`** — exports named `renderRepos(repos)`, `showLoading()`, `showError(message)` functions
3. **`app.js`** — imports from both modules; handles the form event and orchestrates the flow

**Success criteria:**
- [ ] `app.js` has no DOM manipulation — all of that is in `ui.js`
- [ ] `api.js` has no DOM references — only fetch logic
- [ ] The HTML file loads only `<script type="module" src="./app.js">`

---

## Research Questions

> **🔬 Research Question:** What is a "circular dependency" in modules? Does `a.js` importing from `b.js` while `b.js` imports from `a.js` cause an error? What happens, and how do you break the cycle?

> **🔬 Research Question:** What does `import.meta.url` contain? What is it useful for when working with ES Modules in Node.js?

## Optional Resources

- [MDN — JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [javascript.info — Modules](https://javascript.info/modules-intro) — Thorough explanation with interactive examples
