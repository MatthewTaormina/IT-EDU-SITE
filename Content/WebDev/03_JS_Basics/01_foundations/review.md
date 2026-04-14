---
title: "Sub-unit Review — JS Foundations"
lesson_plan: "JS — Foundations"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — JS Foundations

> Work through this without looking back at the lessons.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **`<script src="..." defer>`** | Loads an external JS file in parallel with HTML parsing; executes after the DOM is ready |
| **`console.log()`** | Prints values to the browser DevTools console |
| **`typeof`** | Operator returning a string describing a value's type |
| **`const`** | Declares a variable whose binding cannot be reassigned — use by default |
| **`let`** | Declares a reassignable variable — use when the value must change |
| **`var`** | Legacy declaration keyword with function scope — do not use in new code |
| **String** | A sequence of characters — `"text"`, `'text'`, or `` `text` `` |
| **Number** | Any numeric value (integer or decimal) — includes `NaN` and `Infinity` |
| **Boolean** | Exactly `true` or `false` |
| **`undefined`** | A variable declared but not yet assigned a value |
| **`null`** | An intentionally empty value — assigned by the programmer |
| **Truthy** | Any value that evaluates to `true` in a boolean context |
| **Falsy** | The seven values that evaluate to `false`: `false`, `0`, `-0`, `""`, `null`, `undefined`, `NaN` |
| **`===`** | Strict equality — checks value *and* type; always prefer over `==` |
| **`!==`** | Strict inequality |
| **`&&`** | Logical AND — short-circuits on first falsy operand |
| **`\|\|`** | Logical OR — short-circuits on first truthy operand |
| **`??`** | Nullish coalescing — falls back only when left side is `null` or `undefined` |
| **Template literal** | Backtick string allowing embedded expressions: `` `Hello, ${name}!` `` |
| **`%` (modulo)** | Returns the remainder of division: `10 % 3 === 1` |

---

## Quick Check

1. What is the difference between placing `<script src="app.js">` at the end of `<body>` versus `<script src="app.js" defer>` in `<head>`? Which do most modern developers prefer and why?

2. Declare a variable `maxRetries` set to `3` that cannot be reassigned. Declare a variable `attempts` set to `0` that will be incremented. Which keyword do you use for each?

3. What does `typeof null` return, and why is it considered a bug?

4. What are all the **falsy** values in JavaScript? List them from memory.

5. Explain in one sentence what short-circuit evaluation means for `&&`. Give a practical example of when you would use it.

6. What is the output of `0 || "default"` and `0 ?? "default"`? Explain why they differ.

7. Rewrite this concatenation as a template literal:
   ```js
   const msg = "Welcome back, " + user + "! You have " + count + " messages.";
   ```

8. A colleague writes: `if (result == null)`. Is this the same as `if (result === null)`? When would the two behave differently?
