---
title: "Arrow Functions"
lesson_plan: "JS — Functions"
order: 2
duration_minutes: 20
sidebar_position: 2
tags:
  - javascript
  - arrow-functions
  - es6
  - implicit-return
  - this
---

# Arrow Functions

> **Lesson Summary:** Arrow functions — introduced in ES6 — are a more compact syntax for writing functions. They are the dominant style in modern JavaScript for callbacks, array methods, and short utility functions. Their key difference from regular functions is how they handle the `this` keyword.

---

## Basic Syntax

```js
// Regular function declaration
function add(a, b) {
  return a + b;
}

// Equivalent arrow function
const add = (a, b) => {
  return a + b;
};
```

Arrow functions are always *expressions* — they must be assigned to a variable (or passed directly as an argument).

---

## Implicit Return

When the function body is a **single expression**, you can omit the curly braces and the `return` keyword. The expression's value is returned automatically:

```js
const add = (a, b) => a + b;

console.log(add(3, 7)); // 10
```

This is called an **implicit return** and is one of the main reasons arrow functions are popular — they reduce boilerplate dramatically.

```js
const square = (n) => n * n;
const double = (n) => n * 2;
const greet  = (name) => `Hello, ${name}!`;
```

> **⚠️ Returning an object literal** requires wrapping it in parentheses, otherwise the `{}` is interpreted as a function body:
>
> ```js
> // ❌ Wrong — {} is treated as function body, undefined returned
> const makePoint = (x, y) => { x, y };
>
> // ✅ Correct — () wraps the object literal
> const makePoint = (x, y) => ({ x, y });
> ```

---

## Single Parameter Shorthand

When there is exactly **one parameter**, the parentheses around it are optional:

```js
const double = n => n * 2;
const shout  = msg => msg.toUpperCase() + "!";
```

When there are **zero parameters**, empty parentheses are required:

```js
const getRandom = () => Math.random();
```

---

## Arrow Functions in Array Methods

Arrow functions excel as inline callbacks — they are concise and don't need a `function` keyword or a `return` statement for simple operations:

```js
const numbers = [1, 2, 3, 4, 5];

// Filter — keep only even numbers
const evens  = numbers.filter(n => n % 2 === 0);       // [2, 4]

// Map — multiply each by 10
const scaled = numbers.map(n => n * 10);               // [10, 20, 30, 40, 50]

// Find — first number above 3
const first  = numbers.find(n => n > 3);               // 4

// Reduce — sum all numbers
const sum    = numbers.reduce((acc, n) => acc + n, 0); // 15
```

This pattern — passing an arrow function directly to an array method — is the most common use of arrow functions you'll encounter.

---

## `this` Behaviour

This is the most important difference between arrow functions and regular functions.

**Regular functions** define their own `this` — it depends on *how the function is called*:

```js
const counter = {
  count: 0,
  start: function () {
    setInterval(function () {
      this.count++; // ❌ 'this' here is the global object (or undefined in strict mode)
      console.log(this.count);
    }, 1000);
  },
};
```

**Arrow functions** do not have their own `this` — they inherit `this` from the *surrounding lexical scope* at the time they are defined:

```js
const counter = {
  count: 0,
  start: function () {
    setInterval(() => {
      this.count++; // ✅ 'this' is the counter object — inherited from start()
      console.log(this.count);
    }, 1000);
  },
};
```

> **Rule for beginners:** Inside methods on objects, use regular functions for the method itself. Use arrow functions for callbacks *inside* those methods.

---

## When to Use Each

| Situation | Use |
| :--- | :--- |
| Short callback (array method, event handler, timer) | Arrow function |
| Object method that needs `this` to refer to the object | Regular function |
| Recursive function (needs to reference itself by name) | Regular function declaration |
| Top-level utility function | Either — often arrow if it's a one-liner |

---

## Key Takeaways

- Arrow functions: `const fn = (params) => expression` or `const fn = (params) => { body }`.
- **Implicit return**: a single-expression body without `{}` automatically returns the value.
- Single-parameter shorthand: `n => n * 2` (parentheses optional).
- Arrow functions are the first choice for callbacks and array method predicates.
- Arrow functions do **not** have their own `this` — they inherit it from the enclosing scope.

---

## Research Questions

> **🔬 Research Question:** Arrow functions cannot be used as **constructors** (you cannot call `new ArrowFn()`). Why not? What is a constructor function, and how does `new` work?
>
> *Hint: Search "JavaScript constructor function new keyword".*

> **🔬 Research Question:** What is the **rest parameter** syntax (`...args`), and how does it let a function accept any number of arguments? How does it differ from the `arguments` object available in regular functions?
