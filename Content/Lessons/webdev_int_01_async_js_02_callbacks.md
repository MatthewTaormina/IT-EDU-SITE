---
type: lesson
title: "Callbacks"
description: "The original async pattern — passing functions as arguments to be called later — and why callback hell motivated the invention of Promises."
duration_minutes: 30
tags:
  - javascript
  - callbacks
  - async
  - event-driven
---

# Callbacks

> **Lesson Summary:** A callback is a function passed as an argument to another function, to be invoked when an asynchronous operation completes. Callbacks are the foundational async pattern in JavaScript — event listeners, array methods, and early Node.js APIs all use them. This lesson covers how they work and why their limitations led to Promises.

---

## What Is a Callback?

A **callback** is any function passed to another function and called later. You already know callbacks from the DOM:

```js
button.addEventListener('click', function () {
  console.log('clicked!'); // this function is a callback
});
```

The anonymous function is not called immediately — the browser calls it *later*, when a click event occurs.

---

## Callbacks for Async Operations

Callbacks are used throughout JavaScript's async APIs. `setTimeout` is the simplest example:

```js
console.log('before');

setTimeout(function () {
  console.log('inside timeout'); // called 1 second later
}, 1000);

console.log('after');

// Output:
// before
// after
// (1s later) inside timeout
```

The function passed to `setTimeout` is a callback. The runtime calls it when the timer fires.

---

## Callbacks with Results

A callback can receive data as arguments — this is how async operations return values:

```js
function loadUser(id, callback) {
  // Simulate an async database lookup
  setTimeout(function () {
    const user = { id: id, name: 'Alice' };
    callback(null, user); // Node.js convention: (error, result)
  }, 500);
}

loadUser(42, function (err, user) {
  if (err) {
    console.error('Failed:', err);
    return;
  }
  console.log('User:', user.name);
});
```

This is the **Node.js error-first callback convention**: the first argument is an error (or `null` if none), the second is the result.

---

## Callback Hell

The real problem appears when you need to chain multiple async operations — each depending on the result of the previous one:

```js
loadUser(1, function (err, user) {
  if (err) return handleError(err);

  loadPosts(user.id, function (err, posts) {
    if (err) return handleError(err);

    loadComments(posts[0].id, function (err, comments) {
      if (err) return handleError(err);

      loadLikes(comments[0].id, function (err, likes) {
        if (err) return handleError(err);

        console.log('likes:', likes); // finally...
      });
    });
  });
});
```

This pattern has several names: **callback hell**, the **pyramid of doom**, or **deeply nested callbacks**. The problems it creates:

| Problem | Description |
| :--- | :--- |
| **Readability** | Code grows horizontally; difficult to follow the flow |
| **Error handling** | Each level must handle errors independently; easy to miss one |
| **Reuse** | Inner callbacks are anonymous and tightly coupled — hard to extract or test |
| **Control flow** | Running two operations in parallel is awkward |

---

## Array Methods Are Also Callbacks

You have already used callbacks in synchronous contexts — array methods like `forEach`, `map`, `filter`, and `sort` all accept callback functions:

```js
const numbers = [1, 2, 3, 4, 5];

numbers.forEach(function (n) {
  console.log(n * 2); // synchronous callback
});

const evens = numbers.filter(function (n) {
  return n % 2 === 0;
});
```

These are **synchronous callbacks** — called immediately, not deferred. The event loop is not involved.

---

## Named Callbacks Improve Readability

One improvement over anonymous callback hell: give callbacks names.

```js
function handleLikes(err, likes) {
  if (err) return handleError(err);
  console.log('likes:', likes);
}

function handleComments(err, comments) {
  if (err) return handleError(err);
  loadLikes(comments[0].id, handleLikes);
}

function handlePosts(err, posts) {
  if (err) return handleError(err);
  loadComments(posts[0].id, handleComments);
}

function handleUser(err, user) {
  if (err) return handleError(err);
  loadPosts(user.id, handlePosts);
}

loadUser(1, handleUser);
```

This is flat and readable — but the code flow is still non-obvious (you have to read bottom-to-top to follow the execution order). Promises solved this properly.

---

## Key Takeaways

- A callback is a function passed to another function to be called later.
- The error-first callback convention `(err, result)` is the Node.js standard for async callbacks.
- Callback hell arises when multiple sequential async operations are nested — readability and error handling degrade rapidly.
- Array methods (`map`, `filter`, `forEach`) also use callbacks, but synchronously.
- Promises were designed specifically to solve the problems of deeply nested callbacks.

---

## Research Questions

> **🔬 Research Question:** `setInterval` is similar to `setTimeout` but repeats. What does `clearInterval` do, and why is it important to call it? Write a counter that increments every second and stops at 10.

> **🔬 Research Question:** What is the difference between a synchronous callback and an asynchronous callback? Give one example of each from built-in JavaScript APIs.

## Optional Resources

- [MDN — Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)
- [Callbackhell.com](http://callbackhell.com/) — Classic article describing the problem and mitigation strategies
