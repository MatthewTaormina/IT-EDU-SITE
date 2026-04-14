---
type: lesson
title: "JSON"
description: "JSON (JavaScript Object Notation) is a text format for representing structured data. It is the standard format for exchanging data between web APIs and browsers. In this lesson you will learn the r..."
duration_minutes: 20
tags:
  - javascript
  - json
  - fetch
  - stringify
  - parse
  - api
---

# JSON

> **Lesson Summary:** JSON (JavaScript Object Notation) is a text format for representing structured data. It is the standard format for exchanging data between web APIs and browsers. In this lesson you will learn the rules of valid JSON, how to convert between JSON strings and JavaScript values, and how JSON is used in practice when fetching data from an API.

---

## What Is JSON?

JSON is a **string** — it is plain text that represents structured data following specific rules. It looks very similar to a JavaScript object literal, but it is not the same thing.

```json
{
  "id": 1,
  "name": "Alice",
  "age": 30,
  "isAdmin": false,
  "tags": ["developer", "educator"],
  "address": {
    "city": "London",
    "country": "UK"
  }
}
```

---

## JSON Rules

JSON is stricter than JavaScript object syntax:

| Rule | JavaScript (object literal) | JSON |
| :--- | :--- | :--- |
| Keys | Can be unquoted: `{ name: "Alice" }` | Must be double-quoted: `{ "name": "Alice" }` |
| Strings | Single or double quotes | Must be **double quotes** only |
| Comments | Allowed (`// …`) | **Not allowed** |
| Trailing commas | Allowed | **Not allowed** |
| Functions | Allowed as values | **Not allowed** |
| `undefined` | Allowed as value | **Not allowed** (`null` is used instead) |

**Valid JSON types:** string, number, boolean, null, array, object.

---

## `JSON.stringify()` — JavaScript → JSON String

Converts a JavaScript value into a JSON string. This is used when you need to *send* data (to a server, or to `localStorage`).

```js
const user = { name: "Alice", age: 30, isAdmin: false };

const jsonString = JSON.stringify(user);
console.log(jsonString);
// '{"name":"Alice","age":30,"isAdmin":false}'
console.log(typeof jsonString); // "string"
```

### Pretty Printing (for readability)

`JSON.stringify` accepts indentation as a third argument:

```js
console.log(JSON.stringify(user, null, 2));
// {
//   "name": "Alice",
//   "age": 30,
//   "isAdmin": false
// }
```

### What Gets Omitted

```js
const data = {
  name: "Alice",
  greet: function() {},    // functions are dropped
  secret: undefined,       // undefined values are dropped
  score: null,             // null is kept
};

JSON.stringify(data);
// '{"name":"Alice","score":null}'
```

---

## `JSON.parse()` — JSON String → JavaScript Value

Converts a JSON string back into a JavaScript value. This is used when you *receive* data (from a server response or `localStorage`).

```js
const jsonString = '{"name":"Alice","age":30,"isAdmin":false}';

const user = JSON.parse(jsonString);
console.log(user.name);    // "Alice"
console.log(typeof user);  // "object"
```

> **⚠️ Always parse untrusted JSON inside a try/catch.** If the string is invalid JSON, `JSON.parse()` throws a `SyntaxError`.

```js
try {
  const data = JSON.parse(untrustedString);
  // use data
} catch (error) {
  console.error("Invalid JSON:", error.message);
}
```

---

## Deep Cloning with JSON

A common trick: `JSON.parse(JSON.stringify(obj))` produces a **deep clone** of an object (all nested objects and arrays are copied, not referenced):

```js
const original = { a: 1, nested: { b: 2 } };
const clone = JSON.parse(JSON.stringify(original));

clone.nested.b = 99;
console.log(original.nested.b); // 2 — original unchanged ✅
```

> **⚠️ Limitation:** This drops functions, `undefined`, and non-JSON-serialisable values. For production use, prefer `structuredClone()` (modern browsers) or a library.

---

## JSON in Practice — Fetching an API

The most common real-world use of JSON is receiving data from a web API using the `fetch()` function.

```js
fetch("https://api.example.com/users/1")
  .then(response => response.json()) // parses the JSON body
  .then(user => {
    console.log(user.name); // use the parsed object
  })
  .catch(error => {
    console.error("Fetch failed:", error);
  });
```

`response.json()` is a shorthand provided by the Fetch API — it calls `JSON.parse()` on the response body for you.

You don't need to fully understand Promises (`.then()`) yet — just recognise the pattern. You will cover asynchronous JavaScript in a later unit.

---

## JSON and `localStorage`

Browser `localStorage` only stores strings. JSON lets you persist structured data:

```js
// Save
const prefs = { theme: "dark", fontSize: 16 };
localStorage.setItem("prefs", JSON.stringify(prefs));

// Load
const stored = localStorage.getItem("prefs");
const prefs = JSON.parse(stored);
console.log(prefs.theme); // "dark"
```

---

## Key Takeaways

- JSON is a **text format** — a string — not a JavaScript object.
- JSON keys and strings must use **double quotes**; no functions, `undefined`, or comments.
- `JSON.stringify(value)` converts a JS value to a JSON string.
- `JSON.parse(string)` converts a JSON string to a JS value; wrap in `try/catch` for untrusted input.
- JSON is the standard wire format for web APIs — `fetch()` returns JSON data you parse with `.json()`.

---

## Research Questions

> **🔬 Research Question:** `JSON.stringify()` accepts a second argument called a **replacer**. What does it do? How would you use it to remove sensitive fields (like `password`) before serialising a user object?
>
> *Hint: Search "JSON.stringify replacer function".*

> **🔬 Research Question:** What is `structuredClone()` and how does it improve on the `JSON.parse(JSON.stringify())` clone trick? What types can it handle that JSON cannot?
