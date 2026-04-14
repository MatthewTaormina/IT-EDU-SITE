---
type: lesson
title: "Modern Array Methods"
description: "Transform and query arrays with map, filter, reduce, find, some, every, and flatMap — without mutation and without explicit loops."
duration_minutes: 40
tags:
  - javascript
  - es6
  - arrays
  - map
  - filter
  - reduce
  - functional-programming
---

# Modern Array Methods

> **Lesson Summary:** JavaScript's array methods let you transform, filter, search, and accumulate data declaratively — without `for` loops and without mutating the original array. These methods are used in virtually every JavaScript application, especially when processing API data for display.

---

## The Functional Approach

Instead of this:

```js
const prices = [10, 25, 5, 50, 15];
const discounted = [];

for (let i = 0; i < prices.length; i++) {
  if (prices[i] > 10) {
    discounted.push(prices[i] * 0.9);
  }
}
```

Write this:

```js
const discounted = prices
  .filter(price => price > 10)
  .map(price => price * 0.9);
```

The result is identical. The second version is shorter, reads like prose ("filter prices above 10, then map each to 90%"), and does not mutate the original array.

---

## `map()` — Transform Each Element

`map()` applies a function to every element and returns a **new array of the same length**:

```js
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8]

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const names = users.map(user => user.name); // ['Alice', 'Bob']
const ids = users.map(({ id }) => id);      // [1, 2] (with destructuring)
```

Common use: transforming API data into DOM strings:

```js
const html = repos.map(repo =>
  `<li><a href="${repo.html_url}">${repo.name}</a></li>`
).join('');

document.querySelector('#list').innerHTML = html;
```

---

## `filter()` — Keep Matching Elements

`filter()` returns a new array containing only elements for which the callback returns truthy:

```js
const scores = [72, 45, 88, 60, 95, 38];
const passing = scores.filter(s => s >= 60); // [72, 88, 60, 95]

const users = [
  { name: 'Alice', active: true },
  { name: 'Bob', active: false },
  { name: 'Carol', active: true },
];

const activeUsers = users.filter(user => user.active);
// [{ name: 'Alice', ... }, { name: 'Carol', ... }]
```

---

## `reduce()` — Accumulate to a Single Value

`reduce()` iterates the array, passing an **accumulator** through each element. The final accumulator is the result.

```js
array.reduce((accumulator, currentValue) => newAccumulator, initialValue)
```

### Sum

```js
const nums = [1, 2, 3, 4, 5];
const total = nums.reduce((sum, n) => sum + n, 0); // 15
```

### Count by Category

```js
const items = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];

const counts = items.reduce((acc, item) => {
  acc[item] = (acc[item] ?? 0) + 1;
  return acc;
}, {});
// { apple: 3, banana: 2, cherry: 1 }
```

### Flatten Array of Arrays

```js
const matrix = [[1, 2], [3, 4], [5, 6]];
const flat = matrix.reduce((acc, row) => [...acc, ...row], []);
// [1, 2, 3, 4, 5, 6]
```

> **⚠️ Warning:** Always provide the `initialValue` (second argument to `reduce`). Without it, `reduce` uses the first array element as the initial accumulator — which is correct for numeric sums but wrong for most other uses and throws on empty arrays.

---

## `find()` and `findIndex()` — Search for One Element

`find()` returns the **first element** matching the predicate, or `undefined`:

```js
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
];

const alice = users.find(user => user.id === 1);
// { id: 1, name: 'Alice' }

const unknown = users.find(user => user.id === 99);
// undefined
```

`findIndex()` returns the **index** of the first match, or `-1`:

```js
const idx = users.findIndex(user => user.name === 'Bob'); // 1
```

---

## `some()` and `every()` — Boolean Queries

`some()` returns `true` if **at least one** element matches:

```js
const hasAdmin = users.some(user => user.role === 'admin');
```

`every()` returns `true` if **all** elements match:

```js
const allActive = users.every(user => user.active === true);
```

---

## `flatMap()` — Map Then Flatten

`flatMap()` is a map followed by a one-level flatten — useful for one-to-many transformations:

```js
const sentences = ['Hello world', 'Goodbye moon'];
const words = sentences.flatMap(s => s.split(' '));
// ['Hello', 'world', 'Goodbye', 'moon']
```

Without `flatMap`:
```js
const words = sentences.map(s => s.split(' ')).flat();
// Same result but two operations
```

---

## Chaining Methods

Array methods return new arrays, so they chain naturally:

```js
const results = repos
  .filter(repo => repo.stargazers_count > 1000)        // only popular
  .filter(repo => repo.language === 'JavaScript')        // only JS
  .sort((a, b) => b.stargazers_count - a.stargazers_count) // sort by stars desc
  .slice(0, 10)                                          // top 10
  .map(repo => `<li>${repo.full_name} ⭐${repo.stargazers_count}</li>`)
  .join('');
```

---

## Key Takeaways

- `map()` — transform; returns same-length array.
- `filter()` — keep matching elements; returns shorter or equal array.
- `reduce()` — accumulate to a single value (any type); always provide an initial value.
- `find()` — first match or `undefined`; `findIndex()` — index of first match or `-1`.
- `some()` — any match? `every()` — all match?
- `flatMap()` — map then flatten one level.
- All these methods return new arrays/values; they never mutate the original.

---

## Challenge: Process a Movie Dataset

```js
const movies = [
  { title: 'Inception', year: 2010, rating: 8.8, genres: ['Action', 'Sci-Fi'] },
  { title: 'The Dark Knight', year: 2008, rating: 9.0, genres: ['Action', 'Crime'] },
  { title: 'Interstellar', year: 2014, rating: 8.6, genres: ['Adventure', 'Sci-Fi'] },
  { title: 'Dunkirk', year: 2017, rating: 7.9, genres: ['Action', 'Drama'] },
  { title: 'Tenet', year: 2020, rating: 7.3, genres: ['Action', 'Sci-Fi'] },
  { title: 'Oppenheimer', year: 2023, rating: 8.9, genres: ['Biography', 'Drama'] },
];
```

Using chained array methods:

1. Filter to movies with rating ≥ 8.0
2. Sort by rating descending
3. Map to objects containing only `title`, `year`, and `topGenre` (first genre)
4. Use `reduce` to build an object counting how many movies per top genre

---

## Research Questions

> **🔬 Research Question:** What is `Array.prototype.flat()`? How does it differ from `flatMap()`? Try `[[1, [2, 3]], [4]].flat(Infinity)`.

> **🔬 Research Question:** `reduce` can replace `map` and `filter`. Implement `map` using only `reduce`. Then implement `filter` using only `reduce`. Why do we still prefer `map` and `filter` over `reduce` for those operations?

## Optional Resources

- [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) — Full method reference
- [javascript.info — Array methods](https://javascript.info/array-methods) — Comprehensive examples for every method
