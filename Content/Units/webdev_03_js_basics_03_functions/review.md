---
title: "Sub-unit Review — Functions"
lesson_plan: "JS — Functions"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Functions

> Work through this without looking back at the lessons.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Function declaration** | A named function defined with the `function` keyword: `function name(params) { }` |
| **Parameter** | A placeholder name in a function definition |
| **Argument** | The actual value passed when a function is called |
| **`return`** | Exits a function and produces a value; functions without return produce `undefined` |
| **Default parameter** | A fallback value used when an argument is omitted: `function f(x = 0)` |
| **Hoisting** | Function declarations are moved to the top of their scope — they can be called before they appear in code |
| **Arrow function** | Compact function syntax: `const fn = (params) => expression` |
| **Implicit return** | When an arrow function body is a single expression (no `{}`), it is automatically returned |
| **First-class function** | A function is a value — it can be stored, passed as an argument, or returned |
| **Global scope** | Variables declared outside any function — accessible everywhere |
| **Function scope** | Variables declared inside a function — accessible only within that function |
| **Block scope** | Variables declared with `let`/`const` inside `{}` — accessible only within that block |
| **Lexical scope** | Scope is determined by where code is *written*, not where it is *called* |
| **Scope chain** | The chain of parent scopes JavaScript searches when resolving a variable |
| **Closure** | A function that retains access to its outer scope even after that scope has returned |

---

## Quick Check

1. What does hoisting mean for function declarations? Does it apply to arrow functions assigned to `const`?

2. What does a function return if it has no `return` statement?

3. Write a function `multiply(a, b)` using a regular function declaration, then rewrite it as an arrow function with implicit return.

4. What is the difference between `const add = (a, b) => a + b` and `const add = (a, b) => { a + b }`? Which one returns a value?

5. Explain in plain English what a closure is. Write a function `makeMultiplier(factor)` that returns a new function — the returned function should multiply any number it receives by `factor`.

6. What is the difference in `this` behaviour between a regular function method and an arrow function? Give a scenario where using an arrow function *fixes* a `this` bug.

7. What will this log and why?
   ```js
   for (var i = 0; i < 3; i++) {
     setTimeout(() => console.log(i), 0);
   }
   ```
   How would you fix it?

8. What is block scope? Write a code snippet that demonstrates a `ReferenceError` caused by trying to access a `let` variable outside the block it was declared in.
