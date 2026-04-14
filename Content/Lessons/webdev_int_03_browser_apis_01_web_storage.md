---
type: lesson
title: "Web Storage — localStorage & sessionStorage"
description: "Store and retrieve data in the browser using localStorage and sessionStorage — what they are, how to use them, when to choose each, and how to store structured objects."
duration_minutes: 35
tags:
  - browser-apis
  - localstorage
  - sessionstorage
  - web-storage
  - json
  - persistence
---

# Web Storage — localStorage & sessionStorage

> **Lesson Summary:** The Web Storage API gives your JavaScript application a key-value store inside the browser. `localStorage` persists indefinitely; `sessionStorage` clears when the tab closes. Both are synchronous, string-only, and origin-scoped. This lesson covers their usage, JSON serialization for storing objects, and when to choose which.

---

## What Is Web Storage?

Before Web Storage, storing data client-side meant cookies — which are limited in size (4 KB), sent with every HTTP request, and complex to manage. The Web Storage API provides two simpler alternatives:

| Feature | `localStorage` | `sessionStorage` |
| :--- | :--- | :--- |
| **Persistence** | Survives restarts and refreshes | Cleared when the tab closes |
| **Scope** | All tabs of the same origin | Only the current tab |
| **Size limit** | ~5–10 MB (browser-dependent) | ~5–10 MB |
| **Sent to server?** | Never | Never |
| **Accessible via** | `window.localStorage` | `window.sessionStorage` |

Both have identical APIs — the same methods work on either.

---

## The API

### `setItem(key, value)` — Store

```js
localStorage.setItem('theme', 'dark');
sessionStorage.setItem('sessionId', 'abc123');
```

Keys and values are always strings. Setting a key that already exists overwrites it.

### `getItem(key)` — Read

```js
const theme = localStorage.getItem('theme'); // 'dark'
const missing = localStorage.getItem('nonexistent'); // null (not undefined)
```

### `removeItem(key)` — Delete

```js
localStorage.removeItem('theme');
```

### `clear()` — Delete Everything

```js
localStorage.clear(); // removes ALL keys in this origin's localStorage
```

> **⚠️ Warning:** `clear()` removes everything — including data set by other parts of your application. Use `removeItem(key)` to delete specific entries.

### `length` and `key(index)` — Enumerate

```js
console.log(localStorage.length); // number of stored keys

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

---

## Storing Objects with JSON

`localStorage` stores only strings. To store objects and arrays, serialize them with `JSON.stringify()` and deserialize with `JSON.parse()`:

```js
// Storing an object
const user = { id: 42, name: 'Alice', theme: 'dark' };
localStorage.setItem('user', JSON.stringify(user));

// Reading it back
const stored = localStorage.getItem('user');
const parsedUser = JSON.parse(stored);
console.log(parsedUser.name); // 'Alice'
```

### Defensive Parsing

`JSON.parse()` throws if the stored value is not valid JSON (e.g., if it was set directly as a string by old code):

```js
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user'); // clear corrupted data
    return null;
  }
}
```

---

## A Practical Pattern: Storage Utilities

Create a small wrapper module to avoid JSON boilerplate throughout your app:

```js
// storage.js
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function remove(key) {
  localStorage.removeItem(key);
}
```

```js
// app.js
import { save, load, remove } from './storage.js';

save('bookmarks', [{ id: 1, title: 'MDN' }]);
const bookmarks = load('bookmarks', []); // defaults to [] if missing
```

---

## Real-World Use Cases

| Use Case | Storage | Why |
| :--- | :--- | :--- |
| User's preferred theme | `localStorage` | Should persist across browser restarts |
| Shopping cart items | `localStorage` | User expects cart to be there next day |
| Current form draft (auto-save) | `localStorage` or `sessionStorage` | Depends on whether you want it to survive a browser restart |
| Temporary multi-step form data | `sessionStorage` | Should disappear when the user closes the tab |
| Single-use success/error messages | `sessionStorage` | Only relevant for the current navigation |

---

## The `storage` Event

When `localStorage` is changed in one tab, other tabs of the same origin receive a `storage` event:

```js
window.addEventListener('storage', (event) => {
  console.log('Key changed:', event.key);
  console.log('Old value:', event.oldValue);
  console.log('New value:', event.newValue);
});
```

This enables basic cross-tab communication (e.g., logging out in one tab logs out all tabs).

---

## Key Takeaways

- `localStorage` persists indefinitely; `sessionStorage` clears on tab close.
- Both are string-only key-value stores — use `JSON.stringify` / `JSON.parse` for objects.
- `setItem`, `getItem`, `removeItem`, `clear` — the four essential methods.
- Wrap storage operations in utilities to avoid repetitive JSON handling.
- The `storage` event fires in other tabs when `localStorage` changes — useful for cross-tab sync.

---

## Challenge: Bookmark Manager

Build a simple bookmark manager:

1. An input for a URL and a button to save it
2. Save bookmarks as an array of objects `[{ url, savedAt }]` in `localStorage`
3. On page load, read from `localStorage` and render existing bookmarks
4. A "Remove" button on each bookmark removes it from the DOM and from `localStorage`
5. A "Clear all" button removes everything

---

## Research Questions

> **🔬 Research Question:** What happens to `localStorage` data when the user clears their browser history? What about Private/Incognito mode — does `localStorage` work there?

> **🔬 Research Question:** Is there an asynchronous alternative to `localStorage`? Research the **IndexedDB API** and its higher-level wrapper **idb** (a library). When would you choose IndexedDB over `localStorage`?

## Optional Resources

- [MDN — Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN — Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
