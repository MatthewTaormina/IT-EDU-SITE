---
type: lesson
title: "DOM Selection"
description: "Before you can change anything on the page, you need to *select* the element you want to change. JavaScript provides several methods to find elements in the DOM — from the modern and flexible `quer..."
duration_minutes: 25
tags:
  - javascript
  - dom
  - querySelector
  - getElementById
  - NodeList
---

# DOM Selection

> **Lesson Summary:** Before you can change anything on the page, you need to *select* the element you want to change. JavaScript provides several methods to find elements in the DOM — from the modern and flexible `querySelector` to the legacy-but-still-common `getElementById`. Understanding what each method returns (a single element vs. a NodeList) is essential for using them correctly.

---

## The DOM Recap

The DOM (Document Object Model) is the browser's live, in-memory representation of the HTML on the page. Every element — every `<div>`, every `<button>`, every `<h1>` — is a node in a tree. JavaScript interacts with the page by reading and modifying this tree.

The entry point to the DOM is the global `document` object.

---

## `document.querySelector()`

Returns the **first element** in the document that matches a CSS selector. If no element matches, returns `null`.

```js
// Select by tag name
const heading = document.querySelector("h1");

// Select by class
const card = document.querySelector(".card");

// Select by id
const nav = document.querySelector("#main-nav");

// Complex selectors work too
const firstItem = document.querySelector("ul.menu > li:first-child");
```

`querySelector` accepts **any valid CSS selector** — this makes it the most powerful and versatile selection method.

> **⚠️ It returns a single element** (or `null`). If multiple elements match, only the first one in document order is returned.

---

## `document.querySelectorAll()`

Returns a **NodeList** containing all elements that match a CSS selector (empty NodeList if none match).

```js
const allButtons = document.querySelectorAll("button");
const cards      = document.querySelectorAll(".card");
const inputs     = document.querySelectorAll("input[type='text']");
```

### Working with a NodeList

A NodeList is array-like but is **not an array** — it has `length` and can be iterated with `for...of`, but it lacks array methods like `map` and `filter`.

```js
// ✅ for...of works
for (const btn of allButtons) {
  console.log(btn.textContent);
}

// ✅ Convert to array if you need array methods
const buttonsArray = Array.from(allButtons);
const texts = buttonsArray.map(btn => btn.textContent);

// ✅ Spread also works
const [...buttons] = allButtons;
```

---

## `document.getElementById()`

Returns the element with the matching `id` attribute (only one can exist per page), or `null`.

```js
const loginForm = document.getElementById("login-form");
```

Note: no `#` prefix — unlike `querySelector`, this takes just the id string.

### Comparison Table

| Method | Returns | Selector type |
| :--- | :--- | :--- |
| `querySelector(sel)` | First matching element or `null` | Any CSS selector |
| `querySelectorAll(sel)` | NodeList of all matches (may be empty) | Any CSS selector |
| `getElementById(id)` | Element or `null` | ID string (no `#`) |
| `getElementsByClassName(cls)` | Live HTMLCollection | Class name (legacy) |
| `getElementsByTagName(tag)` | Live HTMLCollection | Tag name (legacy) |

> **💡 Best practice:** Use `querySelector` and `querySelectorAll` for new code. They are more flexible and accept any CSS selector. `getElementById` is fine too — it is slightly faster for id lookups and very widely used.

---

## Scoped Queries

You can call `querySelector` and `querySelectorAll` on any element, not just `document`. This scopes the search to descendants of that element:

```js
const sidebar = document.querySelector("#sidebar");

// Only selects links that are INSIDE #sidebar
const sidebarLinks = sidebar.querySelectorAll("a");
```

This is much more efficient than selecting from the full document and then filtering manually.

---

## Null-Safety

When an element might not exist, always guard against `null`:

```js
const modal = document.querySelector("#modal");

if (modal) {
  // safe to use modal here
  console.log(modal.textContent);
}
```

Or with optional chaining:

```js
document.querySelector("#modal")?.classList.add("active");
// Does nothing if #modal doesn't exist — no error thrown
```

---

## Key Takeaways

- `document.querySelector(cssSelector)` → first matching element or `null`.
- `document.querySelectorAll(cssSelector)` → NodeList of all matches.
- `document.getElementById(id)` → element with that id or `null`.
- NodeLists can be iterated with `for...of`; use `Array.from()` for array methods.
- Scope queries to a parent element for efficiency and specificity.
- Always null-check elements that might not exist on the page.

---

## Research Questions

> **🔬 Research Question:** What is the difference between a **live HTMLCollection** (returned by `getElementsByClassName`) and a **static NodeList** (returned by `querySelectorAll`)? What does "live" mean in this context, and why can it be dangerous?

> **🔬 Research Question:** What is **`closest()`**? How does it traverse the DOM *up* the tree (toward the root) to find the nearest ancestor matching a selector? When is this useful in event handling?
