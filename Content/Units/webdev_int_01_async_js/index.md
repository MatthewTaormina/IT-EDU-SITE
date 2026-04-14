---
type: unit
title: "Asynchronous JavaScript"
description: "The event loop, callbacks, Promises, async/await, and the Fetch API — how JavaScript handles time and network requests without blocking the browser."
domain: "WebDev"
difficulty: "Intermediate"
estimated_hours: 8
tags:
  - async
  - promises
  - async-await
  - fetch
  - rest-api
  - event-loop
  - javascript
prerequisites:
  - "Unit 00 — Git & CLI (this course)"
  - "JS Basics — Functions, Data Structures, and the DOM (FrontEndBasic course)"
learning_objectives:
  - "Explain what the JavaScript event loop is and why it matters"
  - "Identify callback-based async patterns and describe their limitations"
  - "Create and consume Promises using .then(), .catch(), and .finally()"
  - "Rewrite Promise chains using async/await and handle errors with try/catch"
  - "Make HTTP requests with the Fetch API and process JSON responses"
  - "Build a page that fetches data from a public REST API and renders it in the DOM"
references:
  - type: lesson
    slug: webdev_int_01_async_js_01_the_event_loop
  - type: lesson
    slug: webdev_int_01_async_js_02_callbacks
  - type: lesson
    slug: webdev_int_01_async_js_03_promises
  - type: lesson
    slug: webdev_int_01_async_js_04_async_await
  - type: lesson
    slug: webdev_int_01_async_js_05_fetch_api
  - type: lesson
    slug: webdev_int_01_async_js_06_rest_api_consumption
---

# Asynchronous JavaScript

> **Unit Summary:** JavaScript runs in a single thread — it can only do one thing at a time. Yet your browser fetches data, animates elements, responds to clicks, and plays audio all simultaneously. This unit explains the mechanism behind that: the event loop. Then it teaches you the three tools for writing async code in modern JavaScript — callbacks, Promises, and async/await — and puts them to work with the Fetch API.

## Learning Objectives

By the end of this unit, you will be able to:

- Explain what the JavaScript event loop is and why it matters
- Identify callback-based async patterns and describe their limitations
- Create and consume Promises using `.then()`, `.catch()`, and `.finally()`
- Rewrite Promise chains using async/await and handle errors with try/catch
- Make HTTP requests with the Fetch API and process JSON responses
- Build a page that fetches data from a public REST API and renders it in the DOM

## Prerequisites

- **Git & CLI** (Unit 00 of this course) — you will need to push your work to GitHub
- **JS Basics** — functions, closures, DOM manipulation, and event listeners must all be comfortable before starting this unit

## Lessons in this Unit

1. [The Event Loop](../../Lessons/webdev_int_01_async_js_01_the_event_loop.md)
2. [Callbacks](../../Lessons/webdev_int_01_async_js_02_callbacks.md)
3. [Promises](../../Lessons/webdev_int_01_async_js_03_promises.md)
4. [async/await](../../Lessons/webdev_int_01_async_js_04_async_await.md)
5. [The Fetch API](../../Lessons/webdev_int_01_async_js_05_fetch_api.md)
6. [Consuming a REST API](../../Lessons/webdev_int_01_async_js_06_rest_api_consumption.md)

## Core Terminology

**Synchronous**
Executed in sequence — the next line runs only after the current line finishes. Most code you have written so far is synchronous.

**Asynchronous**
Operations that can start now but complete later — without blocking the thread in between.

**Call stack**
The data structure tracking which function is currently executing. Functions are pushed when called and popped when they return.

**Task queue (macrotask queue)**
A queue of callbacks waiting to run after the call stack empties. `setTimeout`, `setInterval`, and browser events feed this queue.

**Microtask queue**
A higher-priority queue for Promise callbacks (`.then()`, `.catch()`, `await`). Always drained before the next macrotask.

**Event loop**
The runtime mechanism that continuously checks whether the call stack is empty and, if so, moves the next task from the queues onto the stack.

**Promise**
An object representing the eventual completion or failure of an asynchronous operation. A Promise is in one of three states: `pending`, `fulfilled`, or `rejected`.

**async function**
A function declared with the `async` keyword. It always returns a Promise; `await` expressions inside it pause execution until the awaited Promise settles.

**Fetch API**
A browser built-in for making HTTP network requests. Returns a Promise that resolves to a `Response` object.

---

## Unit Challenge

Build a "GitHub User Card" page:

**Goal:** A page with a text input and a button. When the user types a GitHub username and clicks "Search," fetch the user's profile from the GitHub API and display their avatar, name, bio, and follower count.

**Requirements:**
- Use `async/await` and the GitHub Users API: `https://api.github.com/users/{username}`
- Show a loading state while the request is in flight
- Show a meaningful error message if the username is not found (404) or the request fails
- Display results in a card that appears below the input after the search

**Success Criteria:**
- [ ] Valid usernames display a card with avatar, name, bio, and follower count
- [ ] Invalid usernames display a friendly error message (not a browser alert)
- [ ] A loading indicator is visible during the fetch
- [ ] The code uses `async/await` with a `try/catch` block — no raw `.then()` chains
- [ ] No API key required (the GitHub public API is rate-limited but open)

> **⚠️ Warning:** The GitHub API rate-limits unauthenticated requests to 60 per hour per IP address. If your search stops working temporarily, wait a few minutes.

---

> **Unit Insight:** Understanding the event loop is a threshold concept — once it clicks, you will be able to reason about *any* async code, not just JavaScript.
