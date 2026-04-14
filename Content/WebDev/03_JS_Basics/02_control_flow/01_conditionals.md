---
title: "Conditionals"
lesson_plan: "JS — Control Flow"
order: 1
duration_minutes: 25
sidebar_position: 1
tags:
  - javascript
  - conditionals
  - if-else
  - truthy-falsy
  - ternary
---

# Conditionals

> **Lesson Summary:** Conditionals let your program make decisions. The `if`/`else` construct evaluates a condition — any expression that produces a truthy or falsy value — and executes different code depending on the result. The ternary operator gives you a compact way to express simple two-branch decisions inline.

---

## The `if` Statement

```js
if (condition) {
  // runs when condition is truthy
}
```

```js
const temperature = 28;

if (temperature > 25) {
  console.log("It's warm today.");
}
// Output: It's warm today.
```

---

## `if` / `else`

```js
if (condition) {
  // runs when truthy
} else {
  // runs when falsy
}
```

```js
const isLoggedIn = false;

if (isLoggedIn) {
  console.log("Welcome back!");
} else {
  console.log("Please log in.");
}
// Output: Please log in.
```

---

## `if` / `else if` / `else`

Chain multiple conditions by using `else if`. JavaScript checks each condition from top to bottom and executes the first block whose condition is truthy. The `else` block is a catch-all.

```js
const score = 74;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else if (score >= 60) {
  console.log("D");
} else {
  console.log("F");
}
// Output: C
```

> **💡 Tip:** Only one block ever executes, even if multiple conditions would be true. JavaScript stops checking as soon as it finds the first match.

---

## Truthy and Falsy in Conditions

Any value can be used as a condition — it does not need to be a literal `true` or `false`. The browser coerces the value to a boolean:

```js
const username = "";

if (username) {
  console.log(`Hello, ${username}`);
} else {
  console.log("No username provided."); // Empty string is falsy — this runs
}
```

```js
const items = [1, 2, 3];

if (items.length) {
  console.log(`You have ${items.length} items.`); // Non-zero number is truthy — this runs
}
```

This pattern is extremely common. When you see `if (someValue)`, the developer is checking "does this value exist and is it non-empty?"

---

## Comparison in Conditions

```js
const age = 17;
const hasTicket = true;

if (age >= 18 && hasTicket) {
  console.log("Entry granted.");
} else if (age >= 18 && !hasTicket) {
  console.log("Please buy a ticket.");
} else {
  console.log("Sorry, under 18.");
}
// Output: Sorry, under 18.
```

---

## The Ternary Operator

The ternary operator is a compact, inline conditional. It takes three operands and is ideal for assigning a value based on a condition.

```
condition ? valueIfTrue : valueIfFalse
```

```js
const age = 20;
const access = age >= 18 ? "granted" : "denied";
console.log(access); // "granted"
```

```js
const items = 1;
const label = `${items} ${items === 1 ? "item" : "items"} in cart`;
console.log(label); // "1 item in cart"
```

**When to use ternary:**
- Assigning one of two values based on a condition
- Embedded inside a template literal
- Simple two-outcome decisions

**When NOT to use ternary:**
- When you need to run multiple statements (use `if/else`)
- When nesting ternaries (it becomes unreadable fast)

```js
// ❌ Nested ternary — very hard to read
const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";

// ✅ Prefer if/else if for multi-branch logic
```

---

## Key Takeaways

- `if`/`else if`/`else` executes the **first** matching block only.
- Any value can be a condition — JavaScript coerces it to a boolean using truthy/falsy rules.
- `&&` and `||` let you combine multiple conditions.
- The ternary `condition ? a : b` is clean for simple two-outcome assignments; prefer `if/else` for anything more complex.

---

## Research Questions

> **🔬 Research Question:** JavaScript's `if` statements do not require curly braces `{}` for a single statement. However, most style guides mandate them always. Find out why omitting braces is considered dangerous. (Hint: search "Apple SSL goto fail bug" for a famous real-world example.)

> **🔬 Research Question:** What is **guard clause** style (also called "early return")? How does it reduce deeply nested `if/else` chains and improve readability? Find a refactoring example online.
