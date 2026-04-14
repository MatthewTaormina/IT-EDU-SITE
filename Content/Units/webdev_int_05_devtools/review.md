---
title: "Unit Review — Browser DevTools"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Unit Review — Browser DevTools

> Work through this without looking back at the lessons. If you cannot answer a question, that is the lesson to revisit.

---

## What You Covered

| Lesson | Summary |
| :--- | :--- |
| The Elements Panel | Inspecting the live DOM tree; editing HTML and CSS in-place; the Computed and Styles tabs; the Box Model visualizer |
| The Console | `console.log/warn/error/table/group`; executing JavaScript in the page context; reading error messages and stack traces |
| The Network Panel | Recording requests; filtering by type; inspecting request/response headers and bodies; timing waterfall; throttling network speed |
| The Sources Panel & Debugger | Navigating source files; setting line and conditional breakpoints; step-over/step-into/step-out; the Watch panel; the Call Stack panel |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **DOM (live)** | The in-memory representation of the page that DevTools reflects; changes in the Elements panel update the DOM instantly but do not save to disk |
| **Computed styles** | The final CSS values after all cascade, inheritance, and specificity resolution; shown in the Computed tab |
| **`console.table()`** | Formats an array or object as a tabular grid in the Console — useful for inspecting arrays of objects |
| **Stack trace** | The list of function calls leading to an error; readable in the Console error output |
| **Network waterfall** | A visual timeline of all HTTP requests, showing when each started, how long each phase took, and when it completed |
| **Request headers** | Metadata sent by the client to the server (e.g., `Authorization`, `Content-Type`, `Accept`) |
| **Response headers** | Metadata sent by the server back to the client (e.g., `Content-Type`, `Cache-Control`, `Access-Control-Allow-Origin`) |
| **Breakpoint** | A marker in source code that pauses JavaScript execution at that line |
| **Conditional breakpoint** | A breakpoint that only pauses when a specified expression evaluates to truthy |
| **Step over** | Execute the current line and advance to the next, without descending into called functions |
| **Step into** | Descend into the function called on the current line |
| **Step out** | Execute the rest of the current function and return to the caller |
| **Watch expression** | A custom expression evaluated at every pause — useful for monitoring a variable's value throughout execution |

---

## Quick Check

1. You suspect a CSS rule is being overridden. Where in DevTools do you look to confirm which rule is winning, and what visual indicator shows the overridden rule?

2. A `console.log(user)` shows the object's *current* state when you expand it, not the state at the time of the log. How do you log an object snapshot instead?

3. How do you find which JavaScript file and line number triggered a specific network request?

4. You are debugging a loop that runs 100 times but the bug only occurs when `index > 90`. Which breakpoint type do you use, and what expression do you write?

5. The Network panel shows a request with status `0`. What does status 0 mean?

6. Your fetch call is failing with a CORS error. Which DevTools panel first shows this, and where do you look to confirm which header is causing it?

7. Describe the difference between "step over" and "step into" at a function call site. When would you choose each?

---

## Common Misconceptions

**"Changes in the Elements panel are saved to my code."**
DevTools edits are live and immediate, but they affect only the in-memory DOM. They are lost on refresh. To persist changes, use DevTools' Overrides feature or (better) edit your source files directly.

**"A `console.log` of an object shows the value at that moment."**
Not always. When you log an object reference and later expand it in the Console, browsers show the object's *current* state — which may have changed since the log. Use `JSON.parse(JSON.stringify(obj))` or `console.log({...obj})` to capture a snapshot.

**"Only Chrome DevTools matter."**
Firefox DevTools is equally capable and includes some features (CSS flexbox/grid inspectors, enhanced accessibility panel) that are ahead of Chrome's. Learning one deeply transfers almost completely to the other.

**"If the debugger shows a minified file, I can't debug it."**
Source maps link minified production code back to original source files. If the project has source maps enabled (most development builds do), the Sources panel will show the original, readable source automatically.

---

## What Comes Next

You have completed all six units of Front-End Intermediate. The final step is the [Intermediate Capstone Project](../../Projects/webdev_intermediate_capstone/index.md) — a data-driven SPA that applies everything from Git and async JavaScript through browser APIs and DevTools. After the capstone, you are ready for **Front-End Advanced** — TypeScript, React, and the professional build toolchain.

---

## Further Reading

- [Chrome DevTools documentation](https://developer.chrome.com/docs/devtools/) — comprehensive official reference with video walkthroughs
- [Firefox DevTools User Docs](https://firefox-source-docs.mozilla.org/devtools-user/) — thorough coverage of Firefox-specific tools
- [Umar Hansa — DevTips](https://umaar.com/dev-tips/) — newsletter-style weekly DevTools tips with GIF demonstrations
