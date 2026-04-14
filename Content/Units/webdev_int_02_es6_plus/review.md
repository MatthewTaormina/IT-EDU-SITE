---
title: "Unit Review — ES6+ Modern JavaScript"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Unit Review — ES6+ Modern JavaScript

> Work through this without looking back at the lessons. If you cannot answer a question, that is the lesson to revisit.

---

## What You Covered

| Lesson | Summary |
| :--- | :--- |
| Destructuring | Unpacking array elements and object properties into variables; nested destructuring; default values; renaming |
| Spread & Rest | Copying and merging arrays/objects with `...`; collecting function arguments with rest parameters |
| ES Modules | `import`/`export`; named vs. default exports; `import * as`; dynamic `import()`; module scope |
| Optional Chaining & Nullish Coalescing | Safe property access with `?.`; `undefined`-specific fallbacks with `??`; combining both patterns |
| Modern Array Methods | `map`, `filter`, `reduce`, `find`, `findIndex`, `some`, `every`, `flatMap`; chaining; immutability |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Destructuring** | Syntax that unpacks values from arrays or properties from objects into named variables |
| **Rest parameters** | `...args` in a function parameter list — collects remaining arguments into an array |
| **Spread operator** | `...` in expression context — expands iterable elements or object properties inline |
| **ES Module** | A JavaScript file using `import`/`export` (ESM); each file is a separate scope |
| **Named export** | `export const name = value` — imported by the exact name with `{ name }` |
| **Default export** | `export default value` — one per file; imported with any name |
| **Optional chaining (`?.`)** | Short-circuits to `undefined` instead of throwing when accessing props on `null`/`undefined` |
| **Nullish coalescing (`??`)** | Returns the right operand only when the left is `null` or `undefined` (not `0`, `''`, `false`) |
| **`map()`** | Transforms each element of an array; returns a new array of the same length |
| **`filter()`** | Returns a new array containing only elements for which the callback returns truthy |
| **`reduce()`** | Accumulates all array elements into a single value using a callback and initial accumulator |
| **`find()`** | Returns the first element matching the predicate, or `undefined` |
| **`flatMap()`** | Maps then flattens one level — useful for one-to-many transformations |
| **Immutability** | Not modifying the original data; producing new values instead of mutating existing ones |

---

## Quick Check

1. Rewrite this using destructuring:
   ```js
   const name = user.name;
   const city = user.address.city;
   const zip = user.address.zip;
   ```

2. You have an array of product objects. Each product has a `price` property. Write a single expression using `filter` and `map` that returns an array of names (strings) of products costing more than $50.

3. What is the difference between `??` and `||` when the left-hand value is `0`?

4. You call a function `getUser()` that might return `null`. The user object has a nested `address.city` property. Write the expression to get the city, defaulting to `'Unknown'` if anything in the chain is null/undefined.

5. Write a module `math.js` that exports an `add` function as a named export and a `PI` constant as a named export. Write the import statement in another file that imports both.

6. Explain what `Array.prototype.reduce` does by describing what the following produces and why:
   ```js
   [1, 2, 3, 4, 5].reduce((acc, n) => acc + n, 0)
   ```

7. What is the difference between rest parameters and the legacy `arguments` object?

---

## Common Misconceptions

**"Spread creates a deep copy."**
Spread creates a *shallow* copy. Nested objects and arrays inside the copy still reference the same memory as the original. Modifying a nested property in the copy modifies the original too.

**"Optional chaining is just `if (x !== null && x !== undefined)`."**
Functionally similar for a single level, but `?.` chains — `a?.b?.c?.d` would require multiple nested null checks written manually. It also works with method calls (`obj.method?.()`) and array access (`arr?.[0]`).

**"`filter` and `map` are slow — I should use a `for` loop."**
For educational content arrays (hundreds to thousands of elements), the performance difference is negligible. The readability and composability benefits far outweigh any micro-optimization concern at this level. Optimize when you have a measured bottleneck, not preemptively.

**"A module's default export must be anonymous."**
Default exports can be named or anonymous. `export default function myFunction() {}` exports a named function as the default. The *importing* name can be anything, but the internal name remains `myFunction` for stack traces and debugging.

---

## What Comes Next

Unit 03 — Browser APIs will use destructuring, optional chaining, and modules throughout. You will apply `Object.entries()` destructuring to URL search parameters and use modules to organize the storage layer of the capstone project.

---

## Further Reading

- [MDN — Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN — JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Axel Rauschmayer — Exploring ES6](https://exploringjs.com/es6/) — Free online book; detailed chapters on every ES6 feature
