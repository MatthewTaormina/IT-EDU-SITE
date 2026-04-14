---
type: unit
title: "Browser APIs & Storage"
description: "localStorage, sessionStorage, the History API, URL and query parameters, and the Intersection Observer — the browser built-ins every front-end developer uses daily."
domain: "WebDev"
difficulty: "Intermediate"
estimated_hours: 5
tags:
  - browser-apis
  - localstorage
  - history-api
  - url
  - intersection-observer
  - javascript
prerequisites:
  - "ES6+ Modern JavaScript (Unit 02 of this course)"
  - "Asynchronous JavaScript (Unit 01 of this course)"
learning_objectives:
  - "Store and retrieve structured data in localStorage and sessionStorage"
  - "Explain when to use localStorage versus sessionStorage versus cookies"
  - "Implement URL-based navigation in a SPA using the History API"
  - "Read and write query parameters using the URLSearchParams API"
  - "Lazy-load content and trigger animations using the Intersection Observer API"
references:
  - type: lesson
    slug: webdev_int_03_browser_apis_01_web_storage
  - type: lesson
    slug: webdev_int_03_browser_apis_02_history_api
  - type: lesson
    slug: webdev_int_03_browser_apis_03_url_and_query_params
  - type: lesson
    slug: webdev_int_03_browser_apis_04_intersection_observer
---

# Browser APIs & Storage

> **Unit Summary:** The browser exposes a rich set of JavaScript APIs beyond the DOM — for storing data, managing navigation history, parsing URLs, and observing the viewport. This unit covers the APIs that appear in virtually every real-world front-end project.

## Learning Objectives

By the end of this unit, you will be able to:

- Store and retrieve structured data in `localStorage` and `sessionStorage`
- Explain when to use `localStorage` versus `sessionStorage` versus cookies
- Implement URL-based navigation in a SPA using the History API
- Read and write query parameters using the `URLSearchParams` API
- Lazy-load content and trigger animations using the Intersection Observer API

## Prerequisites

- **ES6+ Modern JavaScript** — Unit 02 of this course; destructuring and modules are used throughout
- **Asynchronous JavaScript** — Unit 01 of this course; Intersection Observer callbacks are async in nature

## Lessons in this Unit

1. [Web Storage — localStorage & sessionStorage](../../Lessons/webdev_int_03_browser_apis_01_web_storage.md)
2. [The History API](../../Lessons/webdev_int_03_browser_apis_02_history_api.md)
3. [URL & Query Parameters](../../Lessons/webdev_int_03_browser_apis_03_url_and_query_params.md)
4. [Intersection Observer](../../Lessons/webdev_int_03_browser_apis_04_intersection_observer.md)

## Core Terminology

**Web Storage API**
A browser API that provides `localStorage` and `sessionStorage` — two key-value stores accessible from JavaScript. Data is stored as strings.

**localStorage**
A persistent key-value store. Data survives browser restarts and is scoped to the origin (`protocol://hostname:port`).

**sessionStorage**
A key-value store that is cleared when the browser tab is closed. Scoped to the tab, not shared between tabs.

**History API**
A browser API (`window.history`) that lets JavaScript add, replace, and navigate through the browser's session history stack — enabling SPA routing without page reloads.

**Query parameter**
A key-value pair appended to a URL after `?`. Example: `https://example.com/search?q=javascript&page=2`. Multiple parameters are separated by `&`.

**URLSearchParams**
A built-in Web API class for reading and writing query parameters. Works with the `URL` class and `window.location.search`.

**Intersection Observer API**
A browser API that efficiently fires a callback when a target element enters or exits the viewport — used for lazy loading images, triggering animations, and infinite scroll.

---

## Unit Challenge

Upgrade the API project from Unit 01 (Async JS) to a bookmarking app:

**Goal:** Add a "Save" button to each result card. Saved items persist across page refreshes using `localStorage`. A separate "Saved" view shows only saved items, using the History API to create two navigable views without a page reload.

**Requirements:**
- A "Save" / "Unsave" toggle button on each result card
- Saved item IDs stored in `localStorage` as a JSON array
- A "Saved" view at `?view=saved` (use `URLSearchParams` to read the current view)
- The History API to push state when switching between "Results" and "Saved" views
- The Back button restores the correct view

**Success Criteria:**
- [ ] Saved items persist after a full page reload
- [ ] The URL changes when switching views (`?view=saved` vs no param)
- [ ] The browser Back button works correctly between views
- [ ] Unsaving an item removes it from both `localStorage` and the DOM

---

> **Unit Insight:** The browser is a far richer platform than most developers explore. Every Web API you learn removes a dependency from your project and deepens your understanding of how the web actually works.
