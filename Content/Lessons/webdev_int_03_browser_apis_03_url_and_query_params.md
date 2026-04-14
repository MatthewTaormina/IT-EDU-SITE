---
type: lesson
title: "URL & Query Parameters"
description: "Parse and build URLs programmatically using the URL class and URLSearchParams API — read query strings, construct API request URLs, and update the address bar."
duration_minutes: 25
tags:
  - browser-apis
  - url
  - query-params
  - urlsearchparams
  - javascript
---

# URL & Query Parameters

> **Lesson Summary:** The `URL` class and `URLSearchParams` API provide a clean, programmatic way to parse, read, and construct URLs and query strings. This eliminates fragile manual string parsing and is used for both building API request URLs and reading URL state in SPAs.

---

## The `URL` Class

The built-in `URL` class parses a URL string into its components:

```js
const url = new URL('https://api.example.com/search?q=javascript&sort=stars&page=2');

console.log(url.protocol);  // 'https:'
console.log(url.hostname);  // 'api.example.com'
console.log(url.pathname);  // '/search'
console.log(url.search);    // '?q=javascript&sort=stars&page=2'
console.log(url.href);      // Full URL string
```

You can also construct a URL from a relative path and a base:

```js
const base = 'https://api.github.com';
const url = new URL('/users/torvalds', base);
console.log(url.href); // 'https://api.github.com/users/torvalds'
```

---

## `URLSearchParams` — Reading Query Parameters

The `searchParams` property of a `URL` is a `URLSearchParams` object:

```js
const url = new URL('https://example.com/search?q=javascript&page=2&sort=stars');

console.log(url.searchParams.get('q'));     // 'javascript'
console.log(url.searchParams.get('page'));  // '2' (always a string)
console.log(url.searchParams.get('lang'));  // null (missing key)

// Check if a parameter exists
console.log(url.searchParams.has('sort'));  // true
console.log(url.searchParams.has('limit')); // false
```

> **💡 Tip:** All `URLSearchParams` values are strings. If you need a number, parse it explicitly: `parseInt(url.searchParams.get('page'), 10) ?? 1`.

---

## Reading the Current Page's Query Parameters

Use `window.location.search` to read the current page's query string:

```js
// Page URL: https://app.example.com/search?q=react&category=library
const params = new URLSearchParams(window.location.search);

const query = params.get('q');           // 'react'
const category = params.get('category'); // 'library'
const page = parseInt(params.get('page') ?? '1', 10); // 1 (default)
```

---

## Building Query Strings

`URLSearchParams` can also build query strings:

```js
const params = new URLSearchParams({
  q: 'javascript frameworks',
  sort: 'stars',
  per_page: '10',
  page: '1',
});

console.log(params.toString());
// 'q=javascript+frameworks&sort=stars&per_page=10&page=1'

const apiUrl = `https://api.github.com/search/repositories?${params}`;
```

> **💡 Tip:** `URLSearchParams` automatically handles special characters (spaces become `+` or `%20`, `&` becomes `%26`). Never manually concatenate query strings — use `URLSearchParams` to avoid encoding bugs.

---

## Modifying Parameters

```js
params.set('page', '2');      // update existing
params.append('lang', 'js');  // add without replacing existing 'lang'
params.delete('sort');        // remove
```

After modification, the URL can be updated using the History API:

```js
function updateSearch(query, page) {
  const params = new URLSearchParams(window.location.search);
  params.set('q', query);
  params.set('page', String(page));

  history.pushState(null, '', `?${params}`);
}
```

---

## Multi-Valued Parameters

Some APIs accept the same parameter name multiple times (e.g., `?tag=react&tag=typescript`):

```js
const params = new URLSearchParams('tag=react&tag=typescript&tag=node');

console.log(params.get('tag'));      // 'react' (only first value)
console.log(params.getAll('tag'));   // ['react', 'typescript', 'node']
```

To append multiple values:

```js
const params = new URLSearchParams();
['react', 'typescript'].forEach(tag => params.append('tag', tag));
// '?tag=react&tag=typescript'
```

---

## Iterating All Parameters

```js
const params = new URLSearchParams('a=1&b=2&c=3');

for (const [key, value] of params) {
  console.log(key, value);
}
// a 1
// b 2
// c 3

// Or convert to object (loses multi-value params!)
const obj = Object.fromEntries(params);
// { a: '1', b: '2', c: '3' }
```

---

## Practical Example: Search State in the URL

Making search state URL-driven means users can share links and use the Back button to return to previous searches:

```js
// Read state from URL on page load
function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') ?? '';
  const page = parseInt(params.get('page') ?? '1', 10);

  if (query) {
    document.querySelector('#search-input').value = query;
    performSearch(query, page);
  }
}

// Update URL when search changes
function performSearch(query, page) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  history.pushState(null, '', `?${params}`);
  // ... fetch and render results
}

// Handle Back/Forward
window.addEventListener('popstate', initFromUrl);

initFromUrl(); // Run on page load
```

---

## Key Takeaways

- `new URL(urlString)` parses a URL into `protocol`, `hostname`, `pathname`, `search`, etc.
- `url.searchParams` is a `URLSearchParams` object for reading and writing query parameters.
- `new URLSearchParams(window.location.search)` reads the current page's query parameters.
- All parameter values are strings — parse numbers explicitly.
- Use `URLSearchParams` to build query strings safely — never concatenate manually.
- Store search/filter state in the URL (with `history.pushState`) so users can share links.

---

## Challenge: URL-Driven Filter State

Build a movie filter page:

1. Three filter controls: genre (select), min rating (number input), sort (select)
2. On any change, update the URL query string with the current filter values using `replaceState`
3. On page load, read filters from the URL and pre-set the controls to match
4. The URL `?genre=Action&minRating=8&sort=rating` should restore the same filter state on refresh

---

## Research Questions

> **🔬 Research Question:** Does `new URLSearchParams` automatically encode special characters? Test by setting a parameter value containing `&`, `=`, and spaces. What does `.toString()` produce?

> **🔬 Research Question:** What is the difference between `url.searchParams.set()` and `url.searchParams.append()` when a key already exists?

## Optional Resources

- [MDN — URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [MDN — URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
