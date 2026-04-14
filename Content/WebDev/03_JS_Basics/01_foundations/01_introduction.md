---
title: "Introduction to JavaScript"
lesson_plan: "JS — Foundations"
order: 1
duration_minutes: 20
sidebar_position: 1
tags:
  - javascript
  - foundations
  - script-tag
  - console
  - defer
---

# Introduction to JavaScript

> **Lesson Summary:** JavaScript is the programming language of the Web. While HTML defines content and CSS defines presentation, JavaScript specifies *behaviour*. In this lesson you will attach a script to an HTML document, write your first lines of code, and use the browser console to inspect results.

---

## What JavaScript Is

JavaScript was created in 1995 by Brendan Eich at Netscape in just ten days. It was originally called LiveScript, then renamed to capitalise on the popularity of Java — despite having almost nothing in common with it.

Today, JavaScript is one of the most widely used programming languages in the world. It is:

- **The only language natively understood by browsers** — no plugin or compiler required
- **An interpreted language** — code is executed line-by-line at runtime, not compiled to a binary beforehand
- **Single-threaded** — one operation runs at a time, but the event loop allows asynchronous behaviour
- **Dynamically typed** — a variable's type is inferred at runtime and can change

---

## Attaching JavaScript to HTML

Just like CSS, JavaScript can be written inline in a `<script>` block or loaded from an external file. **External files are always preferred** for the same reasons as external stylesheets: reusability, caching, and clean separation of concerns.

### External Script (preferred)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Page</title>
</head>
<body>
  <h1>Hello</h1>

  <!-- Link your script at the END of <body> -->
  <script src="app.js"></script>
</body>
</html>
```

Placing the `<script>` tag **at the end of `<body>`** ensures the HTML is fully parsed before JavaScript runs. Attempting to select an element before it exists in the DOM is one of the most common beginner mistakes.

### The `defer` Attribute (modern approach)

```html
<head>
  <script src="app.js" defer></script>
</head>
```

`defer` tells the browser to download `app.js` in parallel with parsing HTML, but only execute it once parsing is complete. This keeps scripts in `<head>` without blocking rendering — and preserves execution order when multiple scripts are present.

| Approach | Download | Executes when |
| :--- | :--- | :--- |
| `<script>` in `<body>` | After body parsed | Immediately after download |
| `<script defer>` in `<head>` | Parallel with parsing | After DOM is ready |
| `<script async>` in `<head>` | Parallel with parsing | Immediately after download |

> **⚠️ Rule:** Use `defer` for all your own scripts. Avoid `async` unless you are loading a third-party script that has no dependencies on the DOM (e.g., analytics).

### Inline Script (avoid)

```html
<script>
  console.log("I run immediately — before the DOM is ready!");
</script>
```

Inline scripts **block HTML parsing** at the point they appear. Reserve them for rare cases (e.g., a critical analytics snippet that must fire before the page loads).

---

## The Browser Console

The most important tool for learning JavaScript is the browser's DevTools console.

**To open it:**
- Windows/Linux: `F12` or `Ctrl + Shift + J`
- Mac: `Cmd + Option + J`

The console lets you type JavaScript and execute it instantly. Every code snippet in this unit works in the console — you do not need a project set up to experiment.

---

## Your First JavaScript Statement

`console.log()` prints values to the console. It is the JavaScript equivalent of `print()` in Python.

```js
console.log("Hello, World!");
// Output: Hello, World!

console.log(42);
// Output: 42

console.log(1 + 1);
// Output: 2
```

You can pass multiple values separated by commas:

```js
console.log("The answer is", 42);
// Output: The answer is 42
```

---

## The `typeof` Operator

`typeof` tells you the data type of a value — useful for debugging:

```js
console.log(typeof "hello");    // "string"
console.log(typeof 42);         // "number"
console.log(typeof true);       // "boolean"
console.log(typeof undefined);  // "undefined"
console.log(typeof null);       // "object"  ← known quirk
console.log(typeof {});         // "object"
console.log(typeof function(){}); // "function"
```

> **💡 Note:** `typeof null` returning `"object"` is a long-standing bug in JavaScript. `null` is **not** an object — this is preserved for backwards compatibility.

---

## Comments

```js
// This is a single-line comment

/*
  This is a
  multi-line comment
*/

console.log("This runs"); // Inline comment after code
```

Comments are ignored by the JavaScript engine. Use them to explain *why* something is done, not *what* it does — the code itself should be clear enough to explain the what.

---

## Key Takeaways

- JavaScript is the only programming language natively supported by browsers.
- Link JS with `<script src="...">` at end of `<body>`, or use `<script src="..." defer>` in `<head>`.
- **Never** use inline `<script>` blocks for your main application code.
- `console.log()` prints values; the browser DevTools console lets you experiment immediately.
- `typeof value` returns a string describing the type of a value.

---

## Research Questions

> **🔬 Research Question:** JavaScript runtimes exist outside the browser too. What is **Node.js**, and how has it changed where and how JavaScript is used?
>
> *Hint: Search "Node.js what is it used for" and "JavaScript server-side Node.js vs browser".*

> **🔬 Research Question:** The `<script>` tag has `defer` and `async` attributes. We covered the difference above — but what happens when you have **multiple** `async` scripts? Can you guarantee their execution order?
>
> *Hint: Search "script defer vs async multiple scripts order".*
