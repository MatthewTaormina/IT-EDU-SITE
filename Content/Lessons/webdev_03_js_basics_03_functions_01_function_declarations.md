---
type: lesson
title: "Function Declarations"
description: "A function groups a set of statements under a name so they can be called (invoked) as many times as needed. Functions accept **parameters** as inputs and can produce an output via `return`. The `fu..."
duration_minutes: 25
tags:
  - javascript
  - functions
  - parameters
  - return
  - hoisting
  - default-parameters
---

# Function Declarations

> **Lesson Summary:** A function groups a set of statements under a name so they can be called (invoked) as many times as needed. Functions accept **parameters** as inputs and can produce an output via `return`. The `function` keyword also has a special property called hoisting that allows you to call a function before it is written in the file.

---

## Defining a Function

```js
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Alice")); // Hello, Alice!
console.log(greet("Bob"));   // Hello, Bob!
```

### Anatomy

```
function  greet       (name)     {
│         │            │          │
keyword   name         parameter  body
```

- **Parameters** — placeholder names listed in the declaration (zero or more)
- **Arguments** — the actual values passed when calling the function
- **`return`** — exits the function and produces a value

---

## Multiple Parameters

```js
function add(a, b) {
  return a + b;
}

console.log(add(3, 7)); // 10
```

Order matters — parameters are matched to arguments by position.

---

## Return Values

A function without `return` (or with a bare `return;`) returns `undefined`.

```js
function logMessage(msg) {
  console.log(msg); // side effect — doesn't return anything
}

const result = logMessage("Hi"); // "Hi" prints
console.log(result);              // undefined
```

A function exits immediately when `return` is reached — any code after it in the same function does not run:

```js
function classify(n) {
  if (n < 0) return "negative";  // exits here if n < 0
  if (n === 0) return "zero";    // exits here if n === 0
  return "positive";             // only reached for n > 0
}
```

This "early return" style is clearer than deeply nested `if/else` blocks.

---

## Default Parameters

Default parameters provide a fallback value when an argument is omitted or `undefined`:

```js
function greet(name = "stranger") {
  return `Hello, ${name}!`;
}

console.log(greet("Alice")); // Hello, Alice!
console.log(greet());        // Hello, stranger!
```

Defaults are only used when the argument is `undefined` — passing `null` does **not** trigger the default:

```js
console.log(greet(null)); // Hello, null!
```

---

## Hoisting

Function declarations are **hoisted** — the browser moves the entire function to the top of its scope before execution starts. This means you can call a function before it appears in the file:

```js
console.log(double(4)); // 8 — works, even though double is defined below!

function double(n) {
  return n * 2;
}
```

This is unique to the `function` keyword. Variables declared with `let` and `const`, and function *expressions* (including arrow functions), are **not** hoisted in the same way.

---

## Functions as Values

Functions in JavaScript are first-class values — they can be stored in variables, passed as arguments, and returned from other functions.

```js
function square(n) {
  return n * n;
}

const myFn = square; // store in a variable — no ()!
console.log(myFn(5)); // 25
```

```js
const numbers = [1, 2, 3, 4, 5];

function isEven(n) {
  return n % 2 === 0;
}

const evenNumbers = numbers.filter(isEven); // pass function as argument
console.log(evenNumbers); // [2, 4]
```

This idea — passing functions as values — is foundational to how DOM events, array methods, and almost all modern JavaScript APIs work.

---

## Key Takeaways

- `function name(params) { return value; }` is the basic function declaration syntax.
- Parameters receive arguments by position; default parameters provide fallbacks.
- `return` exits the function and produces a value; functions without `return` produce `undefined`.
- Function declarations are hoisted to the top of their scope.
- Functions are first-class values — they can be stored, passed, and returned.

---

## Research Questions

> **🔬 Research Question:** What is the difference between a **function declaration** and a **function expression**? Are function expressions hoisted?
>
> ```js
> // Declaration
> function foo() {}
>
> // Expression
> const bar = function() {};
> ```
>
> *Try calling `bar(5)` before the assignment line and see what happens.*

> **🔬 Research Question:** JavaScript has a special `arguments` object available inside regular functions. What is it? Does it work in arrow functions? Why might you prefer rest parameters (`...args`) over `arguments`?
