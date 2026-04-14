---
type: lesson
title: "Spread & Rest"
description: "Copy and merge arrays and objects with the spread operator, and collect function arguments with rest parameters."
duration_minutes: 30
tags:
  - javascript
  - es6
  - spread
  - rest
  - immutability
---

# Spread & Rest

> **Lesson Summary:** The `...` syntax does two different things depending on where it appears: in an expression, it *spreads* values out (copy, merge); in a function parameter list, it *collects* remaining arguments into an array. Both patterns are used constantly in modern JavaScript.

---

## The Spread Operator (in expressions)

The **spread operator** expands an iterable (array, string, Set) or an object's properties inline.

### Copying an Array

```js
const original = [1, 2, 3];
const copy = [...original];

copy.push(4);
console.log(original); // [1, 2, 3] — unchanged
console.log(copy);     // [1, 2, 3, 4]
```

Without spread, `copy = original` assigns the reference — modifying `copy` would modify `original` too.

### Merging Arrays

```js
const fruits = ['apple', 'banana'];
const veggies = ['carrot', 'broccoli'];
const food = [...fruits, ...veggies];

console.log(food); // ['apple', 'banana', 'carrot', 'broccoli']
```

### Inserting Elements While Copying

```js
const nums = [1, 2, 3];
const withZero = [0, ...nums, 4, 5]; // [0, 1, 2, 3, 4, 5]
```

### Passing Arrays as Function Arguments

```js
const nums = [3, 1, 4, 1, 5, 9];
console.log(Math.max(...nums)); // 9 — same as Math.max(3, 1, 4, 1, 5, 9)
```

---

## Spread with Objects

Spread also works with objects — it copies all **enumerable own properties**:

### Copying an Object

```js
const user = { name: 'Alice', age: 30 };
const userCopy = { ...user };
```

### Merging Objects

```js
const defaults = { theme: 'light', lang: 'en', fontSize: 16 };
const userPrefs = { theme: 'dark', fontSize: 18 };

const settings = { ...defaults, ...userPrefs };
// { theme: 'dark', lang: 'en', fontSize: 18 }
// userPrefs properties override defaults for matching keys
```

### Updating a Single Property (immutable update)

```js
const state = { count: 0, loading: false, error: null };

// Create a new object with count incremented — don't mutate state
const newState = { ...state, count: state.count + 1 };
```

This pattern is the foundation of immutable state management in React.

> **⚠️ Warning:** Object spread is **shallow**. Nested objects are not deep-copied — they remain as references. If `user.address` is an object, `{ ...user }` still shares the same `address` reference.

---

## Rest Parameters (in function definitions)

**Rest parameters** collect all remaining arguments into an array:

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15
```

### Named Parameters + Rest

```js
function greetAll(greeting, ...names) {
  return names.map(name => `${greeting}, ${name}!`);
}

console.log(greetAll('Hello', 'Alice', 'Bob', 'Carol'));
// ['Hello, Alice!', 'Hello, Bob!', 'Hello, Carol!']
```

The rest parameter **must be last** in the parameter list.

### vs. the Legacy `arguments` Object

Before rest parameters, functions used `arguments` — a special array-like object. Rest parameters replaced it:

```js
// Old way — arguments is not a real array
function oldSum() {
  return Array.from(arguments).reduce((t, n) => t + n, 0);
}

// Modern way — numbers IS a real array
function newSum(...numbers) {
  return numbers.reduce((t, n) => t + n, 0);
}
```

Rest parameters produce real arrays; `arguments` is array-like but lacks array methods. Rest parameters do not exist in arrow functions.

---

## Spread in Destructuring

Spread can appear inside a destructuring pattern to collect remaining elements or properties:

```js
// Array: collect remaining elements
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(rest); // [3, 4, 5]

// Object: collect remaining properties
const { name, ...otherProps } = { name: 'Alice', age: 30, city: 'London' };
console.log(otherProps); // { age: 30, city: 'London' }
```

---

## Key Takeaways

- `...` in an expression context **spreads** — copies or merges values.
- Array spread: `[...arr]` copies; `[...arr1, ...arr2]` merges.
- Object spread: `{...obj}` copies; `{...obj1, ...obj2}` merges (later keys win).
- `...` in a **function parameter list** is a rest parameter — collects remaining arguments into a real array.
- The rest parameter must always be last.
- Spread copies are shallow — nested objects share references.

---

## Challenge

Given these two arrays and a base config object:

```js
const frontendDevs = ['Alice', 'Bob'];
const backendDevs = ['Carol', 'Dave'];
const baseConfig = { timeout: 3000, retries: 3, debug: false };
```

Using only spread syntax (no `concat`, no `Object.assign`):

1. Create `allDevs` — a merged array of both developer arrays
2. Create `devTeam` — `allDevs` with `'Eve'` inserted at the beginning and `'Frank'` at the end
3. Create `devConfig` — `baseConfig` with `retries` overridden to `5` and a new `team` property set to `devTeam`

---

## Research Questions

> **🔬 Research Question:** What happens when you spread a `Set` into an array? Is `[...new Set([1, 2, 2, 3, 3])]` valid? What does it produce and why is it useful?

> **🔬 Research Question:** Can you spread a `Map` directly into an object? Try `{ ...new Map([['key', 'value']]) }`. What happens and why?

## Optional Resources

- [MDN — Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN — Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
