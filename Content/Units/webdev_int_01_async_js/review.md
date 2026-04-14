---
title: "Unit Review — Asynchronous JavaScript"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Unit Review — Asynchronous JavaScript

> Work through this without looking back at the lessons. If you cannot answer a question, that is the lesson to revisit.

---

## What You Covered

| Lesson | Summary |
| :--- | :--- |
| The Event Loop | The call stack, task queue, microtask queue, and how the event loop coordinates them to produce non-blocking behavior |
| Callbacks | The original async pattern; callback functions passed to async operations; callback hell and why it is a problem |
| Promises | The `Promise` constructor, `.then()`, `.catch()`, `.finally()`, chaining, and `Promise.all()` / `Promise.race()` |
| async/await | The `async` keyword, `await` expressions, `try/catch` for error handling, and how async functions relate to Promises |
| The Fetch API | `fetch()`, the `Response` object, `.json()`, reading status codes, and handling network errors |
| Consuming a REST API | Reading API documentation, constructing request URLs, passing query parameters, setting headers, and handling paginated responses |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Synchronous** | Executed in sequence; the next line runs only after the current line finishes |
| **Asynchronous** | Operations that start now but complete later without blocking the thread |
| **Call stack** | The LIFO data structure tracking which function is currently executing |
| **Task queue (macrotask queue)** | Holds callbacks from `setTimeout`, `setInterval`, and DOM events; processed after the call stack is empty |
| **Microtask queue** | Holds resolved Promise callbacks (`.then()`, `await`); processed before the next macrotask |
| **Event loop** | The mechanism that moves tasks from queues to the call stack when it empties |
| **Callback** | A function passed as an argument to another function, to be called later |
| **Callback hell** | Deeply nested callbacks that become difficult to read, debug, and error-handle |
| **Promise** | An object representing a value that will be available in the future; states: `pending`, `fulfilled`, `rejected` |
| **`.then()`** | Registers a handler for a fulfilled Promise; returns a new Promise |
| **`.catch()`** | Registers a handler for a rejected Promise |
| **`async` function** | A function that always returns a Promise; enables use of `await` inside |
| **`await`** | Pauses an `async` function until the awaited Promise settles; the function suspends, not the thread |
| **Fetch API** | The built-in browser API for making HTTP requests; returns a Promise |
| **`Response` object** | The object returned by a resolved `fetch()` Promise; contains status, headers, and body-reading methods |
| **`response.json()`** | Parses the response body as JSON; also returns a Promise |

---

## Quick Check

1. Draw (or describe in words) a timeline: `setTimeout(() => console.log('A'), 0)` runs, then `Promise.resolve().then(() => console.log('B'))`, then `console.log('C')`. In what order do A, B, and C print? Why?

2. What is the practical difference between these two patterns?
   ```js
   // Pattern 1
   fetch(url).then(r => r.json()).then(data => render(data)).catch(err => showError(err));

   // Pattern 2
   async function load() {
     try {
       const r = await fetch(url);
       const data = await r.json();
       render(data);
     } catch (err) {
       showError(err);
     }
   }
   ```

3. `fetch()` resolves even for HTTP error responses like 404. How do you detect an HTTP error, and why does this trip up beginners?

4. You want to fetch three independent API endpoints simultaneously and wait for all three to complete before rendering. Which Promise method do you use and why? What happens if one of them fails?

5. An `async` function is called without `await`. What does the caller receive? What happens to any error thrown inside the function?

6. What is the difference between a network error and an HTTP error when using `fetch()`? Write the check that handles both correctly.

---

## Common Misconceptions

**"`await` pauses the entire browser."**
`await` pauses only the `async` function it is inside. The event loop continues running — the browser still paints, handles clicks, and processes other tasks. Suspension is cooperative, not blocking.

**"I can use `await` anywhere."**
`await` is only valid inside an `async` function (or at the top level of an ES module in modern environments). Using it in a regular function is a syntax error.

**"If `fetch()` returns a response, the request succeeded."**
`fetch()` only rejects (throws) on network failure — a DNS error, no internet connection, or a CORS block. A 404 or 500 response *resolves* successfully as a `Response` object with a non-`ok` status. Always check `response.ok` or `response.status`.

**"`.catch()` at the end of a chain catches all errors in all `.then()` callbacks."**
Yes, `.catch()` at the end of a chain does catch errors from any preceding `.then()`. But only if all `.then()` handlers return or propagate the chain. A `.then()` that swallows an error (catches it internally and returns nothing useful) can break the chain.

---

## What Comes Next

Unit 02 — ES6+ will make everything you have written more concise and readable. You will refactor the API project from this unit using destructuring, spread, and modules. Async/await and the Fetch API remain the core mechanism — ES6+ features are the syntax upgrade.

---

## Further Reading

- [MDN — Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) — Definitive reference with interactive examples
- [MDN — async function](https://developer.mozilla.org/en-US/docs org/Web/JavaScript/Reference/Statements/async_function) — Full specification and examples
- [Jake Archibald — Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) — The definitive deep-dive on the event loop with visual diagrams
