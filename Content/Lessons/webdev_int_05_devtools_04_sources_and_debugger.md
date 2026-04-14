---
type: lesson
title: "The Sources Panel & Debugger"
description: "Set breakpoints, step through JavaScript execution, inspect variables, and read the call stack using the Sources panel debugger — the professional alternative to console.log debugging."
duration_minutes: 35
tags:
  - devtools
  - debugger
  - breakpoints
  - sources-panel
  - call-stack
  - watch
---

# The Sources Panel & Debugger

> **Lesson Summary:** The Sources panel gives you access to the page's source files and a full JavaScript debugger. Instead of sprinkling `console.log` everywhere, you can pause execution at any line, inspect every variable in scope, step through code one line at a time, and watch expressions update in real time.

---

## The Sources Panel Structure

The Sources panel has three panes:

```
┌─────────────────────────────────────────────────────────────┐
│ File Explorer  │  Code Viewer (center)  │  Debugger Controls │
│                │                        │  (right panel)     │
│ ▶ Page         │  app.js                │  Watch             │
│   ▶ localhost  │  1  async function ... │  Call Stack        │
│     app.js     │  2  const response = ..│  Scope             │
│     api.js     │  3  if (!response.ok)  │  Breakpoints       │
│     ui.js      │  4    throw new Error  │  Event Listeners   │
└─────────────────────────────────────────────────────────────┘
```

- **File Explorer (left)** — navigate source files; pages, scripts, and source maps
- **Code viewer (center)** — the source file with line numbers; click a line number to add a breakpoint
- **Debugger controls (right)** — Scope, Watch, Call Stack, Breakpoints panels

---

## Setting Breakpoints

A **breakpoint** tells the debugger to pause execution when a specific line is reached.

### Line Breakpoints

Click the **line number** in the source file. A blue marker appears. When the page executes that line, it pauses.

### Conditional Breakpoints

Right-click a line number → **Add conditional breakpoint**. Enter an expression — the debugger only pauses when the expression is true.

```js
// Only pause when the loop index is over 90
i > 90

// Only pause for a specific user
user.id === 42
```

### Logpoints

Right-click a line number → **Add logpoint**. Enter a JavaScript expression. Instead of pausing, the debugger logs the result to the Console — no code changes needed.

```js
// Logpoint expression: logs without pausing
`User: ${user.name}, Page: ${page}`
```

---

## When the Debugger Pauses

When execution hits a breakpoint, the browser pauses and the Sources panel activates:

```
Paused in debugger

1  async function fetchUser(id) {
2    const response = await fetch(`/api/users/${id}`);
3  → const user = await response.json();   ← paused here
4    return user;
5  }
```

The → arrow shows the current line. Execution is frozen — you can examine everything.

---

## Stepping Through Code

| Button | Keyboard | Action |
| :--- | :--- | :--- |
| ▶ Resume | `F8` | Continue execution until the next breakpoint |
| ⬇ Step over | `F10` | Execute current line; stay in current function |
| ↓ Step into | `F11` | Descend into the function call on this line |
| ↑ Step out | `Shift+F11` | Run rest of current function; return to caller |
| → Step | `F9` | Execute exactly one statement |

**Step over** is your most-used button. Use it to walk through a function line by line. Switch to **step into** only when you need to see inside a function call.

---

## Inspecting Variables

While paused, you can inspect all in-scope variables in multiple ways:

### Scope Panel

The right-side Scope panel shows all variables in the current scope:
- **Local** — variables in the current function
- **Closure** — variables captured from outer scopes
- **Global** — `window` properties

Expand objects to drill into nested properties.

### Hover in Source

Hover over any variable or expression in the source code while paused — a tooltip shows its current value.

```js
3  → const user = await response.json();
// Hover over 'response' → { ok: true, status: 200, ... }
```

### Console While Paused

The Console is active while the debugger is paused. Type any expression — it evaluates in the current paused scope:

```js
// In the Console while paused at line 3:
response.status    // → 200
response.headers.get('Content-Type')  // → 'application/json'
user               // → { id: 1, name: 'Alice' }
```

This is extremely powerful — you can run any JavaScript in the exact context where the bug occurred.

---

## The Call Stack Panel

The Call Stack panel shows the chain of active function calls from the current frame back to the entry point:

```
Call Stack
  fetchUser          (app.js:3)   ← current frame
  loadDashboard      (app.js:12)
  (anonymous)        (app.js:85)
```

Click any frame to jump to that code and inspect its local variables — the Scope panel updates to show that frame's scope.

---

## Watch Expressions

Add **Watch** expressions to monitor specific values across all steps:

1. In the Watch panel, click **+**
2. Type any expression: `user.role`, `response.ok`, `items.length`
3. The expression re-evaluates at each step — you see its value change in real time

---

## The `debugger` Statement

You can trigger the debugger from code with the `debugger` statement:

```js
async function processPayment(cart) {
  debugger; // execution pauses here when DevTools is open
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  // ...
}
```

`debugger` only activates when DevTools is open. With DevTools closed, it is silently ignored — safe to commit temporarily, but remove before deploying to production.

> **⚠️ Warning:** Do not leave `debugger` statements in committed code. Add a linter rule (`no-debugger` in ESLint) to catch them before they reach your repository.

---

## Source Maps

Build tools (Vite, webpack) minify and bundle your code. The Sources panel can show the **original, un-minified source** if source maps are enabled — they are automatically enabled in development mode.

If you see minified one-letter variable names, source maps are missing. Check your build tool configuration.

---

## Key Takeaways

- Click a line number to set a breakpoint; execution pauses there.
- Conditional breakpoints only pause when an expression is true — essential for loops.
- **Step over** (F10) is your most-used action; use **Step into** (F11) to descend into a function.
- While paused: hover to inspect values, use the Console in the current scope, check the Call Stack.
- Watch expressions monitor specific values at every step.
- The `debugger` statement triggers a pause in code — remove before deploying.

---

## Challenge: Debug the Hard Way

Find or write a function with a deliberate bug (suggestions: off-by-one in pagination, wrong property access in a map callback, async error not caught). Then debug it:

1. Set a breakpoint at the function entry point
2. Step through the code line by line
3. Identify the exact line where the incorrect value first appears
4. Use the Console (while paused) to evaluate the correct expression
5. Fix the bug in your code

**Rules:** No `console.log` allowed. You must find the bug using only the debugger, scope panel, and in-console evaluation.

---

## Research Questions

> **🔬 Research Question:** What are "DOM breakpoints"? How do you set a breakpoint that fires when a specific element's child nodes change? (Right-click an element in the Elements panel.)

> **🔬 Research Question:** What are "Event Listener Breakpoints"? Where are they in the Sources panel, and how do you pause execution whenever any click event fires — without knowing which JavaScript file handles it?

## Optional Resources

- [Chrome DevTools — Debug JavaScript](https://developer.chrome.com/docs/devtools/javascript/)
- [Chrome DevTools — Pause your code with breakpoints](https://developer.chrome.com/docs/devtools/javascript/breakpoints/)
