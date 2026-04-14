---
title: "Unit Review — Browser APIs & Storage"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Unit Review — Browser APIs & Storage

> Work through this without looking back at the lessons. If you cannot answer a question, that is the lesson to revisit.

---

## What You Covered

| Lesson | Summary |
| :--- | :--- |
| Web Storage | `localStorage` and `sessionStorage`: storing, reading, and removing key-value pairs; serializing objects with JSON; scoping and lifecycle differences |
| The History API | `history.pushState()`, `history.replaceState()`, the `popstate` event; building SPA navigation without page reloads |
| URL & Query Parameters | The `URL` class, `URLSearchParams` API, reading and writing query parameters from `window.location.search` |
| Intersection Observer | `new IntersectionObserver()`, callback signature, `threshold` option; lazy loading images and triggering scroll animations |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **localStorage** | A persistent key-value store in the browser; data survives page reloads and browser restarts; scoped to origin |
| **sessionStorage** | A key-value store cleared when the tab is closed; scoped to the tab session |
| **Origin** | The combination of protocol, hostname, and port: `https://example.com:443` |
| **`JSON.stringify()`** | Converts a JavaScript value (object, array) to a JSON string |
| **`JSON.parse()`** | Parses a JSON string back into a JavaScript value |
| **History API** | The browser's `window.history` interface; allows JavaScript to add entries to and navigate the session history stack |
| **`pushState()`** | Adds a new entry to the history stack and updates the URL without a page load |
| **`replaceState()`** | Replaces the current history entry without adding a new one |
| **`popstate` event** | Fires on `window` when the user navigates via the browser Back/Forward buttons |
| **Query parameter** | A key-value pair in a URL after `?`: `?sort=name&order=asc` |
| **`URLSearchParams`** | A Web API class for reading and writing URL query parameters |
| **Intersection Observer** | A browser API that efficiently fires a callback when a target element enters or exits the viewport |
| **Threshold** | A value (0–1) controlling at what percentage of the element's visibility the Intersection Observer callback fires |

---

## Quick Check

1. You want to save a user's theme preference (`'dark'` or `'light'`) that persists after the browser is closed. Which storage API do you use and why?

2. Write the code to save an array of bookmark objects (`[{ id, title }]`) to `localStorage` under the key `'bookmarks'`, then read it back.

3. What happens to `sessionStorage` when the user opens the saved page in a new tab? When they refresh the same tab?

4. The URL is `https://app.example.com/search?q=javascript&page=2`. Write the JavaScript to read the value of `q` using `URLSearchParams`.

5. You want to change the URL to `?view=saved` without reloading the page, and you want the Back button to return to `?view=results`. Write the code.

6. Describe what the `threshold: 0.5` option does in an Intersection Observer. When exactly does the callback fire?

7. Why is Intersection Observer preferred over a `scroll` event listener for lazy loading?

---

## Common Misconceptions

**"localStorage is secure for storing tokens."**
`localStorage` is accessible to any JavaScript running on the same origin — including injected scripts from XSS attacks. Sensitive tokens (auth tokens, API keys) should use `httpOnly` cookies where possible. For this course's SPA projects, `localStorage` is acceptable; in production authentication, it requires care.

**"You can store any value directly in localStorage."**
`localStorage` only stores strings. Storing an object without `JSON.stringify()` results in the string `"[object Object]"`. Always serialize objects and arrays before storing them.

**"`pushState` is the same as navigating to a new URL."**
`pushState` changes the URL and adds a history entry, but it does not make any network request and does not re-run any page initialization code. Your JavaScript is responsible for reading the new URL and updating the DOM.

---

## What Comes Next

Unit 04 — CSS Transitions will add motion to the projects you have been building in Units 01–03. No JavaScript required for this unit — it is a return to pure CSS. After that, Unit 05 — DevTools will teach you to debug everything you have built so far.

---

## Further Reading

- [MDN — Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN — History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [MDN — Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
