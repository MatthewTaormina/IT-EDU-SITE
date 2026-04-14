---
type: lesson
title: "The Console"
description: "Use the browser Console as an interactive REPL, read error messages with stack traces, and use the full console API — log, table, group, time, and assert."
duration_minutes: 30
tags:
  - devtools
  - console
  - debugging
  - javascript
  - repl
  - logging
---

# The Console

> **Lesson Summary:** The Console is an interactive JavaScript REPL (Read-Eval-Print Loop) with full access to the current page's JavaScript context. It aggregates errors, warnings, and log output. This lesson covers using it as a debugging tool, reading error messages, and the full `console` API beyond `console.log`.

---

## The Console Is a REPL

The Console is not read-only. You can type any JavaScript expression and it executes immediately with access to all variables, functions, and DOM elements on the page.

```js
// In the browser Console on any page:
document.title = 'DevTools is fun';
// → the tab title changes immediately

document.querySelectorAll('a').length
// → number of links on the page
```

This makes the Console the fastest tool for:
- Verifying a selector works before putting it in code
- Testing a function with a specific argument
- Inspecting the current state of a variable

---

## `console.log()` and Friends

```js
console.log('Basic log');                        // informational
console.warn('⚠️ Non-critical warning');         // yellow warning icon
console.error('🚨 Something went wrong');         // red error icon
console.info('ℹ️ For your information');           // informational (some browsers show ℹ️)
```

Filter which types appear using the left panel ("Default levels," "Verbose," etc.) or the filter input at the top of the Console.

---

## Logging Objects

### The Gotcha: Live Object References

```js
const user = { name: 'Alice' };
console.log(user); // logs the object reference

user.name = 'Bob'; // mutate after logging

// When you expand the logged object in DevTools:
// It shows { name: 'Bob' } — the CURRENT state, not the state at log time!
```

To log a snapshot of the object at the time of logging:

```js
console.log({ ...user });               // spread creates a shallow copy
console.log(JSON.parse(JSON.stringify(user))); // deep clone
console.log(JSON.stringify(user));       // prints as string — always correct
```

### `console.table()`

For arrays of objects, `console.table()` renders a sortable, readable grid:

```js
const repos = [
  { name: 'react', stars: 220000, language: 'JavaScript' },
  { name: 'vue', stars: 208000, language: 'JavaScript' },
  { name: 'svelte', stars: 77000, language: 'TypeScript' },
];

console.table(repos);
// ┌─────────┬─────────┬────────┬────────────┐
// │ (index) │  name   │ stars  │  language  │
// ├─────────┼─────────┼────────┼────────────┤
// │    0    │ 'react' │ 220000 │'JavaScript'│
```

---

## Grouping Output

`console.group()` and `console.groupCollapsed()` group related log output:

```js
console.group('User loaded');
console.log('Name:', user.name);
console.log('Role:', user.role);
console.log('Last login:', user.lastLogin);
console.groupEnd();
```

`console.groupCollapsed()` starts the group collapsed — useful when logging frequently and you want clean output by default.

---

## Timing Code

`console.time()` and `console.timeEnd()` measure elapsed time:

```js
console.time('API fetch');
const data = await fetchUsers();
console.timeEnd('API fetch');
// API fetch: 234.567ms
```

`console.timeLog('label')` logs an intermediate time without stopping the timer.

---

## Assertions

`console.assert()` logs an error message if the condition is false — does nothing if true:

```js
const user = { role: 'admin' };
console.assert(user.role === 'admin', 'Expected admin, got:', user.role);
// → no output (assertion passed)

console.assert(user.role === 'superadmin', 'Role mismatch:', user.role);
// → Assertion failed: Role mismatch: admin
```

Useful as lightweight inline tests during development.

---

## Reading Error Messages

When JavaScript throws an error, the Console shows a red message with a **stack trace**:

```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at initSearch (app.js:42:10)
    at app.js:85:3
```

Reading the stack trace:
1. **Error type and message** — `TypeError: Cannot read properties of null (reading 'addEventListener')` — something is `null` where you expected a DOM element
2. **Location** — `app.js:42:10` — file, line 42, column 10. Click it to jump to that exact line in the Sources panel.
3. **Call stack** — `initSearch` was called from line 85. The error occurred in `initSearch` at line 42.

**Common error types:**

| Error | Typical cause |
| :--- | :--- |
| `TypeError: Cannot read properties of null` | `document.querySelector()` returned `null` — element doesn't exist at that point |
| `TypeError: x is not a function` | You called something that isn't a function — often a variable name collision |
| `ReferenceError: x is not defined` | Variable typo, or accessing a variable before it is declared |
| `SyntaxError` | Invalid JavaScript syntax — often a missing bracket or quote |

---

## `console.dir()`

While `console.log()` on a DOM element shows the HTML representation, `console.dir()` shows the DOM element as a JavaScript object with all its properties:

```js
const btn = document.querySelector('button');
console.log(btn);   // <button class="primary">Submit</button>
console.dir(btn);   // {disabled: false, textContent: "Submit", ... 200+ properties}
```

---

## Filtering and Clearing

- **Filter by text:** Type in the filter input to show only matching log entries.
- **Filter by level:** Use the dropdown next to the filter to show only Errors, Warnings, Info, etc.
- **Clear:** `Ctrl+L` or `Cmd+K` clears the Console.
- **Persist logs across navigation:** Check "Preserve log" to prevent the Console from clearing on page reload or navigation.

---

## Key Takeaways

- The Console is a live JavaScript REPL — use it to test selectors, inspect variables, and debug interactively.
- `console.log()` logs object references — expand them to see current state, not state at log time. Use spread or `JSON.stringify` for snapshots.
- `console.table()` renders arrays of objects as readable grids.
- `console.group()`, `console.time()`, `console.assert()` — use the full API, not just `log`.
- Click error file:line links to jump directly to the source.

---

## Challenge: Debug by Console

1. Open any complex website (a news site, an e-commerce store, a web app)
2. In the Console, write a one-liner that logs how many images on the page have a missing or empty `alt` attribute — this is an accessibility audit
3. Write a one-liner that logs the text content of every navigation link in an array
4. Set `console.time('renderTime')` before a DOM operation, perform 100 iterations of appending elements to a `<div>`, call `console.timeEnd('renderTime')`, and compare with a single `innerHTML` assignment

---

## Research Questions

> **🔬 Research Question:** What is `console.profile()` and `console.profileEnd()`? What does it capture, and how is it different from `console.time()`?

> **🔬 Research Question:** Can you customize `console.log` output with CSS? Try `console.log('%c Hello World', 'color: red; font-size: 20px')`. What are `%c`, `%s`, `%d`, and `%o` format specifiers used for?

## Optional Resources

- [MDN — console](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [Chrome DevTools — Console overview](https://developer.chrome.com/docs/devtools/console/)
