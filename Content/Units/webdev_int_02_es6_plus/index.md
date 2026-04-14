---
type: unit
title: "ES6+ Modern JavaScript"
description: "Destructuring, spread/rest, ES modules, optional chaining, nullish coalescing, and modern array methods — the syntax features that make contemporary JavaScript concise and expressive."
domain: "WebDev"
difficulty: "Intermediate"
estimated_hours: 6
tags:
  - es6
  - javascript
  - destructuring
  - modules
  - optional-chaining
  - spread
prerequisites:
  - "Asynchronous JavaScript (Unit 01 of this course)"
learning_objectives:
  - "Use array and object destructuring, including nested destructuring and default values"
  - "Apply the spread operator to copy and merge arrays and objects"
  - "Use rest parameters to write variadic functions"
  - "Organize code into ES modules using named and default exports"
  - "Navigate deeply nested data safely using optional chaining and nullish coalescing"
  - "Use map, filter, reduce, find, and flatMap to transform data without mutation"
references:
  - type: lesson
    slug: webdev_int_02_es6_plus_01_destructuring
  - type: lesson
    slug: webdev_int_02_es6_plus_02_spread_and_rest
  - type: lesson
    slug: webdev_int_02_es6_plus_03_modules
  - type: lesson
    slug: webdev_int_02_es6_plus_04_optional_chaining_and_nullish
  - type: lesson
    slug: webdev_int_02_es6_plus_05_modern_array_methods
---

# ES6+ Modern JavaScript

> **Unit Summary:** ES2015 (ES6) and the annual ECMAScript releases since then transformed JavaScript from a scripting language into a serious engineering language. This unit covers the ES6+ features you will encounter daily in real codebases — and that interviewers will expect you to know fluently.

## Learning Objectives

By the end of this unit, you will be able to:

- Use array and object destructuring, including nested destructuring and default values
- Apply the spread operator to copy and merge arrays and objects
- Use rest parameters to write variadic functions
- Organize code into ES modules using named and default exports
- Navigate deeply nested data safely using optional chaining and nullish coalescing
- Use `map`, `filter`, `reduce`, `find`, and `flatMap` to transform data without mutation

## Prerequisites

- **Asynchronous JavaScript** — Unit 01 of this course; you will use these features while fetching and processing API data

## Lessons in this Unit

1. [Destructuring](../../Lessons/webdev_int_02_es6_plus_01_destructuring.md)
2. [Spread & Rest](../../Lessons/webdev_int_02_es6_plus_02_spread_and_rest.md)
3. [ES Modules](../../Lessons/webdev_int_02_es6_plus_03_modules.md)
4. [Optional Chaining & Nullish Coalescing](../../Lessons/webdev_int_02_es6_plus_04_optional_chaining_and_nullish.md)
5. [Modern Array Methods](../../Lessons/webdev_int_02_es6_plus_05_modern_array_methods.md)

## Core Terminology

**Destructuring**
A syntax for unpacking values from arrays or properties from objects into distinct variables in a single statement.

**Spread operator (`...`)**
When used in an expression context (e.g., `[...arr]` or `{ ...obj }`), copies all iterable elements or enumerable properties into a new array or object.

**Rest parameters (`...args`)**
When used in a function parameter list, collects all remaining arguments into a single array.

**ES Module (ESM)**
A JavaScript file that uses `import` and `export` statements. The native browser module system — no bundler required for basic use.

**Optional chaining (`?.`)**
An operator that short-circuits to `undefined` instead of throwing `TypeError` when accessing a property on `null` or `undefined`.

**Nullish coalescing (`??`)**
An operator that returns the right operand only when the left operand is `null` or `undefined` — unlike `||`, it does not treat `0`, `''`, or `false` as falsy.

**Pure function**
A function that produces no side effects and returns the same output for the same input. Array methods like `map` and `filter` follow this pattern.

---

## Unit Challenge

Refactor a messy data-processing script:

**Goal:** You are given a raw JSON response from a movie API (provided in the challenge). Use ES6+ features to produce a cleaned, sorted list of films.

**Requirements:**
- Use **destructuring** to extract title, year, rating, and genres from each film object
- Use **spread** to merge two arrays of films without mutating either original
- Use `filter` to remove films with a rating below 7.0
- Use `map` to produce a new array of `{ title, year, topGenre }` objects
- Use `sort` to order by year descending
- Organize the solution into an **ES module** with named exports
- Use **optional chaining** when accessing the `genres` array (some films have no genres)

**Success Criteria:**
- [ ] No mutation of the original data arrays
- [ ] A single `import` statement in the entry file — logic lives in a separate module
- [ ] Optional chaining prevents any `TypeError` on films with missing genre data
- [ ] The final output is logged as a formatted table using `console.table()`

---

> **Unit Insight:** These features are not "sugar coating" — they eliminate entire categories of bugs. Destructuring prevents accidental property name typos. Modules prevent global scope pollution. Optional chaining prevents the most common `TypeError` in JavaScript. Learn them once; use them forever.
