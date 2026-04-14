---
type: lesson
title: "Scope & Closures"
description: "Scope defines where a variable is accessible. JavaScript has three levels — global, function, and block. Closures are a natural consequence of how scope works: a function \"closes over\" the variable..."
duration_minutes: 25
tags:
  - javascript
  - scope
  - closures
  - block-scope
  - lexical-scope
---

# Scope & Closures

> **Lesson Summary:** Scope defines where a variable is accessible. JavaScript has three levels — global, function, and block. Closures are a natural consequence of how scope works: a function "closes over" the variables of its outer scope and can access them even after that outer function has returned.

---

## What Is Scope?

**Scope** is the region of code where a variable can be read and written. If you try to access a variable outside its scope, JavaScript throws a `ReferenceError`.

---

## Global Scope

Variables declared outside any function or block are in the **global scope** — accessible everywhere in your script.

```js
const appName = "IT Learning Hub"; // global

function showTitle() {
  console.log(appName); // ✅ accessible from any function
}

showTitle(); // "IT Learning Hub"
```

> **⚠️ Minimise globals.** Global variables can be overwritten by any code on the page (including third-party scripts). Declare variables as locally as possible.

---

## Function Scope

Variables declared inside a function are in **function scope** — they only exist while the function is executing.

```js
function calculate() {
  const result = 42; // function-scoped
  console.log(result); // ✅
}

calculate();
console.log(result); // ❌ ReferenceError: result is not defined
```

Each function call creates a **new, independent scope**. Two calls to the same function get their own separate variables.

---

## Block Scope

`let` and `const` are **block-scoped** — they only exist within the `{}` block they are declared in (e.g., inside an `if`, `for`, or any curly-brace block).

```js
if (true) {
  const message = "Inside the block";
  console.log(message); // ✅
}

console.log(message); // ❌ ReferenceError
```

```js
for (let i = 0; i < 3; i++) {
  // i only exists here
}

console.log(i); // ❌ ReferenceError — i is block-scoped to the for loop
```

`var`, by contrast, is **function-scoped** and leaks out of blocks — which is exactly why it causes bugs:

```js
for (var i = 0; i < 3; i++) {}
console.log(i); // 3 — var leaks out of the for loop (unexpected!)
```

> This is one of the main reasons to never use `var`.

---

## Lexical Scope (Scope Chain)

JavaScript uses **lexical** (static) scoping — a function's scope is determined by where it is *written* in the code, not where it is *called from*.

When JavaScript looks up a variable, it starts in the current scope, then looks outward through parent scopes until it reaches the global scope. This "looking outward" is the **scope chain**.

```js
const greeting = "Hello";

function outer() {
  const name = "Alice";

  function inner() {
    console.log(`${greeting}, ${name}!`); // inner looks up the scope chain
  }

  inner();
}

outer(); // Hello, Alice!
```

`inner` has access to `name` (from `outer`'s scope) and `greeting` (from global scope) because they are in its scope chain.

---

## Closures

A **closure** is what happens when a function retains access to its lexical scope even after the outer function has returned.

```js
function makeCounter() {
  let count = 0; // count is in makeCounter's scope

  return function () {
    count++; // the returned function closes over count
    console.log(count);
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
```

After `makeCounter()` returns, you might expect `count` to be garbage-collected — but it isn't, because the returned function still holds a **reference** to it. That lingering reference is the closure.

### Why Closures Matter

Closures let you create **private state**:

```js
function makeAccount(initialBalance) {
  let balance = initialBalance; // private — not accessible from outside

  return {
    deposit(amount)  { balance += amount; },
    withdraw(amount) { balance -= amount; },
    getBalance()     { return balance; },
  };
}

const account = makeAccount(100);
account.deposit(50);
account.withdraw(30);
console.log(account.getBalance()); // 120
console.log(account.balance);      // undefined — not accessible directly ✅
```

The `balance` variable is invisible from the outside world — it can only be manipulated through the returned methods. This is closure-based encapsulation.

---

## Common Closure Trap in Loops

A classic beginner mistake: using `var` in a loop alongside a callback.

```js
// ❌ Bug — all callbacks share the same 'i' (var is function-scoped)
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 3 / 3 / 3

// ✅ Fixed — let creates a new binding per iteration (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 0 / 1 / 2
```

This is another concrete example of why `let` is safer than `var`.

---

## Key Takeaways

- **Global scope** — accessible anywhere; minimise globals.
- **Function scope** — variables live inside the function that declares them.
- **Block scope** — `let` and `const` only exist within the `{}` block they are declared in.
- `var` leaks out of blocks and into function scope — one more reason to avoid it.
- **Closure** — a function retains access to its outer scope even after that scope has returned.
- Closures enable private state, factory functions, and many common JavaScript patterns.

---

## Research Questions

> **🔬 Research Question:** What is the **temporal dead zone (TDZ)**? It explains why you cannot access a `let` or `const` variable before its declaration, even though the variable *is* technically in scope. *Hint: Search "JavaScript temporal dead zone let const".*

> **🔬 Research Question:** Closures are the mechanism behind the "module pattern" in pre-ES6 JavaScript. Research the classic IIFE-based module pattern — how does it use closures to create private variables and expose a public API? *Hint: Search "JavaScript IIFE module pattern".*
