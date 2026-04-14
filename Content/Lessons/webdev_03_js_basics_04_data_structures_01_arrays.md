---
type: lesson
title: "Arrays"
description: "An array is an ordered, zero-indexed collection of values. Arrays are the most frequently used data structure in JavaScript. This lesson covers creating and indexing arrays, the mutating methods fo..."
duration_minutes: 30
tags:
  - javascript
  - arrays
  - map
  - filter
  - reduce
  - spread
---

# Arrays

> **Lesson Summary:** An array is an ordered, zero-indexed collection of values. Arrays are the most frequently used data structure in JavaScript. This lesson covers creating and indexing arrays, the mutating methods for adding and removing items, and the powerful higher-order methods that let you transform arrays without modifying the original.

---

## Creating an Array

```js
const fruits = ["apple", "banana", "cherry"];
const numbers = [1, 2, 3, 4, 5];
const mixed   = [true, "hello", 42, null]; // arrays can hold any type
const empty   = [];
```

Arrays use **zero-based indexing** — the first element is at index `0`.

```js
console.log(fruits[0]); // "apple"
console.log(fruits[1]); // "banana"
console.log(fruits[2]); // "cherry"
console.log(fruits[3]); // undefined — no element at index 3
```

---

## Key Properties

```js
const fruits = ["apple", "banana", "cherry"];

fruits.length;        // 3 — number of elements
fruits[fruits.length - 1]; // "cherry" — last element
```

---

## Mutating Methods (modify the original array)

### Adding Elements

```js
const items = ["a", "b"];

items.push("c");     // adds to the END   → ["a", "b", "c"]
items.unshift("z");  // adds to the START → ["z", "a", "b", "c"]
```

### Removing Elements

```js
items.pop();    // removes from the END   → ["z", "a", "b"]  (returns removed element)
items.shift();  // removes from the START → ["a", "b"]       (returns removed element)
```

### Splice — Insert or Remove at Any Position

```js
const arr = ["a", "b", "c", "d"];

arr.splice(1, 2);        // remove 2 items starting at index 1 → ["a", "d"]
arr.splice(1, 0, "x");   // insert "x" at index 1, remove 0   → ["a", "x", "d"]
arr.splice(1, 1, "y");   // replace 1 item at index 1 with "y"→ ["a", "y", "d"]
```

---

## Non-Mutating Methods (return a new array or value)

### `map` — Transform Every Element

`map` applies a function to every element and returns a **new array** of the results.

```js
const prices = [10, 25, 8, 40];
const withTax = prices.map(price => price * 1.2);
// [12, 30, 9.6, 48]
```

### `filter` — Keep Elements That Pass a Test

`filter` returns a **new array** containing only the elements for which the callback returns truthy.

```js
const scores = [45, 72, 88, 55, 91, 63];
const passing = scores.filter(score => score >= 60);
// [72, 88, 91, 63]
```

### `find` — First Element That Passes a Test

`find` returns the **first element** that matches, or `undefined` if none do.

```js
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

const user = users.find(u => u.id === 2);
// { id: 2, name: "Bob" }
```

### `reduce` — Combine All Elements into a Single Value

`reduce` iterates through the array, accumulating a result.

```js
const totals = [10, 20, 30, 40];
const sum = totals.reduce((accumulator, current) => accumulator + current, 0);
// 100

// Explained:
// Start: acc = 0
// Iteration 1: acc = 0 + 10 = 10
// Iteration 2: acc = 10 + 20 = 30
// Iteration 3: acc = 30 + 30 = 60
// Iteration 4: acc = 60 + 40 = 100
```

### Other Useful Methods

```js
const arr = [3, 1, 4, 1, 5, 9];

arr.includes(4);        // true — checks if value exists
arr.indexOf(1);         // 1 — first occurrence index
arr.some(n => n > 8);   // true — at least one element passes
arr.every(n => n > 0);  // true — all elements pass
arr.sort((a, b) => a - b); // [1, 1, 3, 4, 5, 9] — sorts in place ⚠️ mutates
arr.slice(1, 3);        // [1, 4] — new sub-array (non-mutating)
arr.join(", ");         // "3, 1, 4, 1, 5, 9" — convert to string
```

---

## The Spread Operator

The spread operator (`...`) expands an array into individual values:

```js
const a = [1, 2, 3];
const b = [4, 5, 6];

// Copy an array (non-mutating)
const copy = [...a]; // [1, 2, 3] — new array

// Merge arrays
const merged = [...a, ...b]; // [1, 2, 3, 4, 5, 6]

// Add items
const extended = [...a, 99]; // [1, 2, 3, 99]
```

---

## Array Destructuring

Destructuring pulls values out of an array into named variables:

```js
const coordinates = [51.5074, -0.1278];
const [lat, lng] = coordinates;

console.log(lat); // 51.5074
console.log(lng); // -0.1278
```

```js
const [first, second, ...rest] = [10, 20, 30, 40, 50];
// first = 10, second = 20, rest = [30, 40, 50]
```

---

## Key Takeaways

- Arrays are zero-indexed ordered collections.
- **Mutating** methods change the original array: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`.
- **Non-mutating** methods return a new value: `map`, `filter`, `find`, `reduce`, `slice`, `includes`.
- Prefer non-mutating methods — they produce fewer side effects and are easier to reason about.
- The spread operator `[...arr]` is the cleanest way to copy or merge arrays.

---

## Research Questions

> **🔬 Research Question:** What is the **`flatMap`** method and when would you use it instead of chaining `map` + `flat`? What does `flat` do?
>
> *Hint: Try `[[1, 2], [3, 4]].flat()` in the console.*

> **🔬 Research Question:** The `.sort()` method without a comparator does not sort numbers correctly (try `[10, 9, 2].sort()`). Why not, and what is the correct comparator function for ascending numeric sort?
