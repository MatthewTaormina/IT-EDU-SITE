---
type: lesson
title: "async/await"
description: "Write asynchronous code that reads like synchronous code using the async and await keywords, and handle errors with try/catch."
duration_minutes: 40
tags:
  - javascript
  - async-await
  - promises
  - try-catch
  - error-handling
---

# async/await

> **Lesson Summary:** `async/await` is syntactic sugar over Promises — it lets you write asynchronous code that reads like synchronous, top-to-bottom code. Every `async` function returns a Promise, and `await` pauses the function until the awaited Promise settles. This lesson teaches you to write and debug `async/await` code fluently.

---

## The Problem `async/await` Solves

Promise chains are better than callback hell, but they still require `.then()` nesting for complex operations. This code is correct but requires mental overhead to follow:

```js
function loadUserDashboard(userId) {
  return fetch(`/api/users/${userId}`)
    .then(r => r.json())
    .then(user => {
      return fetch(`/api/posts?userId=${user.id}`)
        .then(r => r.json())
        .then(posts => ({ user, posts }));
    });
}
```

With `async/await`, the same logic reads as if it were synchronous:

```js
async function loadUserDashboard(userId) {
  const userResponse = await fetch(`/api/users/${userId}`);
  const user = await userResponse.json();

  const postsResponse = await fetch(`/api/posts?userId=${user.id}`);
  const posts = await postsResponse.json();

  return { user, posts };
}
```

Same behavior. Dramatically clearer intent.

---

## The `async` Keyword

Adding `async` before a function makes it an **async function**:

```js
async function doSomething() {
  return 42;
}
```

An async function **always returns a Promise**, even if you return a plain value:

```js
doSomething().then(val => console.log(val)); // 42
```

If you return a Promise from an async function, the returned Promise is that same Promise (not a double-wrapped one).

---

## The `await` Keyword

`await` pauses an async function until the awaited Promise settles:

```js
async function main() {
  console.log('before');
  const result = await new Promise(resolve => setTimeout(() => resolve('done'), 1000));
  console.log(result); // 'done' — printed after 1 second
  console.log('after');
}

main();
```

Key behaviors:
- `await` can only be used **inside an `async` function** (or at the top level of an ES module)
- It pauses *that function* — not the entire thread or event loop
- The value of an `await` expression is the fulfilled value of the Promise

---

## Error Handling with try/catch

When a Promise rejects inside an `async` function, the rejection becomes a thrown error. Handle it with a `try/catch` block:

```js
async function loadUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to load user:', error.message);
    return null;
  }
}
```

`try/catch` handles both:
- **Network failures** — `fetch()` rejects (no internet, DNS failure)
- **HTTP errors** — you throw explicitly after checking `response.ok`

> **⚠️ Warning:** `fetch()` does not throw on HTTP error status codes (404, 500). It only rejects on network failure. Always check `response.ok` and throw if necessary.

---

## Parallel Execution with `async/await`

`await` one-at-a-time is sequential — each waits for the previous to finish:

```js
// Sequential: total time = 500ms + 500ms = ~1000ms
const user = await fetchUser();    // wait 500ms
const posts = await fetchPosts();  // wait another 500ms
```

For independent operations, start all Promises first, then `await` them together:

```js
// Parallel: total time = max(500ms, 500ms) = ~500ms
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
```

> **💡 Tip:** If operations are independent (fetching user data and settings separately), use `Promise.all`. If one operation depends on the result of another (fetch user, then fetch that user's posts), `await` sequentially.

---

## The `await` Top-Level Pattern

In modern environments (Node.js 14+, ES modules in browsers), `await` can be used at the top level of a module without wrapping in an `async` function:

```js
// In a .mjs file or a <script type="module"> block:
const data = await fetch('/api/config').then(r => r.json());
console.log(data);
```

---

## async/await vs. Promise Chains: When to Use Which

Both do the same thing. Use the pattern that produces the clearest code:

| Pattern | Best for |
| :--- | :--- |
| `async/await` | Sequential operations where each step uses the previous result |
| `.then()` chains | Short transformations (e.g., `fetch(url).then(r => r.json())`) |
| `Promise.all` + `await` | Parallel operations where you need all results |

In practice, most code should use `async/await` for readability, with `Promise.all` where parallelism is needed.

---

## Common Mistakes

### Forgetting `await`

```js
async function loadData() {
  const data = fetch('/api/data'); // ⚠️ missing await — data is a Promise, not the response!
  console.log(data); // Promise { <pending> }
}
```

### Using `await` in a non-async function

```js
function loadData() {
  const data = await fetch('/api/data'); // SyntaxError: await outside async function
}
```

### Sequential when parallel would work

```js
// Slow — runs one at a time unnecessarily
const user = await getUser();
const theme = await getTheme(); // doesn't need user — should run in parallel
const settings = await getSettings(); // same
```

---

## Key Takeaways

- `async` before a function makes it always return a Promise.
- `await` pauses the async function until the Promise settles, then produces the fulfilled value.
- `await` can only be used inside an `async` function (or at top level of a module).
- Error handling uses standard `try/catch` — much cleaner than Promise `.catch()` chains.
- Use `Promise.all` with `await` for parallel independent operations.

---

## Challenge: Rewrite with async/await

Take the Promise chain from the Lesson 3 challenge (fetch user → fetch country → log capital and population) and rewrite it completely using `async/await` with a `try/catch` error handler.

**Success criteria:**
- [ ] No `.then()` or `.catch()` methods in your solution
- [ ] A single `try/catch` handles all errors
- [ ] Includes an explicit check for `response.ok` before calling `.json()`

---

## Research Questions

> **🔬 Research Question:** What happens if you `await` a value that is not a Promise (e.g., `await 42`)? Is this valid? What does it return?

> **🔬 Research Question:** How do you handle the case where some steps should have their own error recovery while others should let the error propagate to the outer `try/catch`? Write an example with nested `try/catch` blocks inside an `async` function.

## Optional Resources

- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [javascript.info — async/await](https://javascript.info/async-await) — Clear explanation with exercises
