---
type: lesson
title: "The History API"
description: "Add and replace history entries with pushState and replaceState, respond to the browser Back button with the popstate event, and build URL-driven SPA navigation."
duration_minutes: 35
tags:
  - browser-apis
  - history-api
  - spa
  - routing
  - navigation
  - pushstate
---

# The History API

> **Lesson Summary:** The History API lets JavaScript control the browser's session history — adding, replacing, and navigating entries without page reloads. This is how single-page applications (SPAs) implement URL-based navigation: clicking a link updates the URL and changes the view, but no HTTP request is made and no page flashes.

---

## Why the History API?

A traditional multi-page application navigates by making HTTP requests for each page:

```
Click "About" → GET /about → Browser loads new page
```

A single-page application (SPA) handles all views in JavaScript:

```
Click "About" → JS updates DOM → window.history.pushState(null, '', '/about')
```

The URL changes, the Back button works, but there is no page load. The History API makes the second pattern possible.

---

## The History Object

`window.history` (or just `history`) provides access to the browser's session history for the current tab:

| Property / Method | Description |
| :--- | :--- |
| `history.length` | Number of entries in the session history |
| `history.back()` | Navigate to the previous entry (same as Back button) |
| `history.forward()` | Navigate to the next entry |
| `history.go(n)` | Navigate `n` steps forward (positive) or backward (negative) |
| `history.pushState(state, title, url)` | Add a new entry to the history stack |
| `history.replaceState(state, title, url)` | Replace the current entry |
| `history.state` | The state object associated with the current entry |

---

## `pushState()` — Adding History Entries

```js
history.pushState(stateObject, title, url);
```

- **`stateObject`** — A serializable JavaScript object stored with this history entry. Retrieved via `history.state` or the `popstate` event. Pass `null` if no state is needed.
- **`title`** — Currently ignored by all browsers; pass an empty string `''`.
- **`url`** — The new URL to display. Must be same-origin. Can be absolute or relative.

```js
// User clicks "Products" tab
history.pushState({ view: 'products', page: 1 }, '', '/products');
console.log(history.state); // { view: 'products', page: 1 }
console.log(location.href); // 'https://app.example.com/products'
```

The page does not reload. The URL changes. A new entry is added to the session history.

---

## `replaceState()` — Replacing the Current Entry

`replaceState()` updates the current URL without adding a new history entry — the Back button does not go back to the previous URL because it never existed as a separate entry.

```js
// User is on /search?q=javascript, they type one more character
// Replace instead of push to avoid a history entry for every keystroke
history.replaceState(null, '', '/search?q=javascripts');
```

---

## Responding to Back/Forward — `popstate`

When the user navigates using the browser Back or Forward buttons, a `popstate` event fires on `window`:

```js
window.addEventListener('popstate', (event) => {
  const state = event.state; // the state object from pushState/replaceState

  if (state?.view === 'products') {
    renderProductsView(state.page);
  } else if (state?.view === 'detail') {
    renderDetailView(state.productId);
  } else {
    renderHomeView();
  }
});
```

> **⚠️ Warning:** `popstate` does not fire when you call `pushState()` or `replaceState()` — it only fires when the user navigates (Back/Forward buttons or `history.go()`). You must manually update the view when calling `pushState`.

---

## A Complete SPA Navigation Pattern

Putting it together — a two-view SPA that responds correctly to both link clicks and browser Back/Forward:

```js
function navigate(view, params = {}) {
  // 1. Build the URL
  const url = view === 'home' ? '/' : `/${view}`;
  const fullUrl = params.id ? `${url}/${params.id}` : url;

  // 2. Push to history
  history.pushState({ view, params }, '', fullUrl);

  // 3. Render the view
  renderView(view, params);
}

function renderView(view, params = {}) {
  if (view === 'home') {
    document.getElementById('app').innerHTML = renderHome();
  } else if (view === 'detail') {
    document.getElementById('app').innerHTML = renderDetail(params.id);
  }
}

// Handle Back/Forward
window.addEventListener('popstate', (event) => {
  const { view, params } = event.state ?? { view: 'home', params: {} };
  renderView(view, params);
});

// Handle link clicks (intercept to prevent full page navigation)
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-nav]');
  if (link) {
    event.preventDefault();
    navigate(link.dataset.nav, { id: link.dataset.id });
  }
});
```

HTML:
```html
<a href="/detail/42" data-nav="detail" data-id="42">View item 42</a>
```

---

## Reading the Current URL

Use `window.location` to read the current URL at any time:

```js
console.log(location.href);       // 'https://app.example.com/products?page=2'
console.log(location.pathname);   // '/products'
console.log(location.search);     // '?page=2'
console.log(location.hash);       // '' (or '#section-1')
console.log(location.origin);     // 'https://app.example.com'
```

---

## Key Takeaways

- `history.pushState(state, '', url)` adds a history entry and changes the URL without a page load.
- `history.replaceState(state, '', url)` updates the URL in-place — Back button does not return to it.
- `popstate` fires only on Back/Forward navigation, not on `pushState`/`replaceState` calls.
- The `popstate` event's `.state` property contains the object passed to the original `pushState`.
- This is the mechanism underlying client-side routing in React Router, Vue Router, and similar libraries.

---

## Challenge: Two-View SPA

Using the bookmark manager from Lesson 1 (Web Storage), add navigation:

1. A "List" view (the default) — shows all bookmarks
2. A "Add" view — shows a form to add a new bookmark
3. Clicking "Add New" navigates to `?view=add` using `pushState`
4. Submitting the form saves the bookmark, navigates back to `?view=list` using `pushState`
5. The browser Back button correctly moves between views

---

## Research Questions

> **🔬 Research Question:** If your SPA serves all paths from `index.html` (SPA routing), what happens when a user types `https://app.example.com/products` directly in the address bar? The server would receive a request for `/products` and might return a 404. How do hosting services like Netlify and Vercel solve this, and what configuration do they require?

> **🔬 Research Question:** What is the difference between `location.assign(url)`, `location.replace(url)`, and `history.pushState()`? When does each make an HTTP request?

## Optional Resources

- [MDN — History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [MDN — Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
