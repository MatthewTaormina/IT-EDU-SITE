---
title: "Loops"
lesson_plan: "JS — Control Flow"
order: 2
duration_minutes: 25
sidebar_position: 2
tags:
  - javascript
  - loops
  - for
  - while
  - for-of
  - break
  - continue
---

# Loops

> **Lesson Summary:** Loops repeat a block of code. JavaScript provides several loop constructs: the `for` loop gives you precise control over the iteration counter, `while` runs while a condition holds, and `for...of` iterates over the values in any iterable (like an array). `break` and `continue` let you exit or skip iterations early.

---

## The `for` Loop

The classic `for` loop has three parts — initialiser, condition, and update — separated by semicolons.

```js
for (initialiser; condition; update) {
  // body
}
```

```js
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 0
// 1
// 2
// 3
// 4
```

### Anatomy

| Part | Example | Purpose |
| :--- | :--- | :--- |
| Initialiser | `let i = 0` | Runs once before the loop starts |
| Condition | `i < 5` | Checked before each iteration; loop stops when falsy |
| Update | `i++` | Runs after each iteration |

### Iterating an array by index

```js
const fruits = ["apple", "banana", "cherry"];

for (let i = 0; i < fruits.length; i++) {
  console.log(`${i}: ${fruits[i]}`);
}
// 0: apple
// 1: banana
// 2: cherry
```

---

## The `while` Loop

`while` is simpler — it just checks a condition and runs as long as it is truthy.

```js
let count = 10;

while (count > 0) {
  console.log(count);
  count -= 3;
}
// 10
// 7
// 4
// 1
```

**When to prefer `while`:** When you don't know in advance how many iterations you need — e.g., polling until a condition changes, or reading user input until valid.

> **⚠️ Warning: Infinite loops.** If the condition never becomes falsy, the loop runs forever and freezes the browser tab. Always ensure your loop has a path to termination. `while (true)` is valid syntax but must have a `break` statement inside.

---

## The `for...of` Loop

`for...of` iterates over the **values** of any *iterable* — most commonly an array. It is cleaner than index-based `for` when you don't need the index.

```js
const colours = ["red", "green", "blue"];

for (const colour of colours) {
  console.log(colour);
}
// red
// green
// blue
```

```js
// Works on strings too — iterates over characters
for (const char of "hello") {
  console.log(char);
}
// h / e / l / l / o
```

> **💡 When you need both the index and the value**, use `Array.prototype.entries()`:
>
> ```js
> for (const [index, value] of fruits.entries()) {
>   console.log(`${index}: ${value}`);
> }
> ```

---

## `for...in` (Brief)

`for...in` iterates over the **keys** of an object. It is not for arrays (use `for...of` for arrays).

```js
const person = { name: "Alice", age: 30, role: "admin" };

for (const key in person) {
  console.log(`${key}: ${person[key]}`);
}
// name: Alice
// age: 30
// role: admin
```

---

## `break` — Exit a Loop Early

`break` immediately terminates the current loop.

```js
const numbers = [3, 7, 2, 9, 1, 5];

for (const num of numbers) {
  if (num === 9) {
    console.log("Found 9! Stopping.");
    break;
  }
  console.log(num);
}
// 3
// 7
// 2
// Found 9! Stopping.
```

---

## `continue` — Skip an Iteration

`continue` skips the rest of the current iteration and jumps to the next one.

```js
for (let i = 0; i < 8; i++) {
  if (i % 2 === 0) continue; // skip even numbers
  console.log(i);
}
// 1
// 3
// 5
// 7
```

---

## Choosing the Right Loop

| Situation | Best loop |
| :--- | :--- |
| Known number of iterations (count) | `for` |
| Iterating array values | `for...of` |
| Iterating array with index needed | `for` with `i` |
| Iterating object keys | `for...in` |
| Run until condition changes | `while` |

---

## Key Takeaways

- `for` loops give full control: initialiser, condition, update.
- `while` loops check a condition; ensure the condition eventually becomes false.
- `for...of` is the cleanest way to iterate array values — prefer it over indexed `for` when you don't need `i`.
- `break` exits the loop; `continue` skips to the next iteration.

---

## Research Questions

> **🔬 Research Question:** Arrays have a `.forEach()` method that also iterates over values. What is the difference between `for...of` and `.forEach()`? In particular, does `break` work inside `.forEach()`?
>
> *Hint: Try `[1,2,3].forEach(n => { if (n === 2) break; })` in the console and note the error.*

> **🔬 Research Question:** What is a `do...while` loop? How does it differ from `while`, and when would you reach for it over a standard `while`?
