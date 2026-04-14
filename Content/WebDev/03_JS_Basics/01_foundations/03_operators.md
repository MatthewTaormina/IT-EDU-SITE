---
title: "Operators & Expressions"
lesson_plan: "JS — Foundations"
order: 3
duration_minutes: 25
sidebar_position: 3
tags:
  - javascript
  - operators
  - expressions
  - template-literals
  - comparison
  - logical
---

# Operators & Expressions

> **Lesson Summary:** An *expression* is any piece of JavaScript that produces a value. Operators are the symbols that combine values into expressions: arithmetic operators produce numbers, comparison operators produce booleans, and logical operators combine booleans. Template literals let you embed expressions directly inside strings.

---

## Arithmetic Operators

```js
10 + 3   // 13  — addition
10 - 3   // 7   — subtraction
10 * 3   // 30  — multiplication
10 / 3   // 3.3333… — division (always floating point)
10 % 3   // 1   — modulo (remainder after division)
10 ** 3  // 1000 — exponentiation (10 to the power of 3)
```

### Increment and Decrement

```js
let count = 5;

count++;   // count is now 6 (post-increment — returns old value, then increments)
count--;   // count is now 5 (post-decrement)
++count;   // count is now 6 (pre-increment — increments first, then returns)
```

> **💡 Tip:** For clarity, prefer `count += 1` over `count++` in most situations — it eliminates any ambiguity about pre vs. post.

---

## Assignment Operators

| Operator | Example | Equivalent |
| :--- | :--- | :--- |
| `=` | `x = 5` | assigns 5 |
| `+=` | `x += 3` | `x = x + 3` |
| `-=` | `x -= 3` | `x = x - 3` |
| `*=` | `x *= 3` | `x = x * 3` |
| `/=` | `x /= 3` | `x = x / 3` |
| `%=` | `x %= 3` | `x = x % 3` |
| `**=` | `x **= 3` | `x = x ** 3` |

---

## Comparison Operators

Comparison operators always produce a **boolean** (`true` or `false`).

```js
5 === 5      // true  — strict equality (same value AND same type)
5 === "5"    // false — number vs. string
5 !== 5      // false — strict inequality
5 !== "5"    // true

5 > 3        // true
5 < 3        // false
5 >= 5       // true
5 <= 4       // false
```

> **⚠️ Rule: Always use `===` and `!==`.** The loose equality operators (`==` and `!=`) perform type coercion — they silently convert types before comparing. `0 == false` is `true`, `"" == false` is `true`, and `null == undefined` is `true`. These surprises make bugs very hard to find.

---

## Logical Operators

Logical operators combine boolean values (or any truthy/falsy values).

### `&&` — AND (both must be truthy)

```js
true && true    // true
true && false   // false
false && true   // false
```

**Short-circuit:** If the left operand is falsy, the right operand is **never evaluated**.

```js
const user = null;
const name = user && user.name; // null — doesn't crash accessing .name on null
```

### `||` — OR (at least one must be truthy)

```js
true || false   // true
false || false  // false
```

**Short-circuit:** If the left operand is truthy, the right operand is **never evaluated**.

```js
const displayName = username || "Guest"; // uses "Guest" if username is falsy
```

### `!` — NOT (inverts a boolean)

```js
!true   // false
!false  // true
!0      // true  (0 is falsy, so its inverse is true)
!""     // true
!"hi"   // false
```

---

## Nullish Coalescing Operator `??`

`??` is similar to `||`, but it only falls back to the right side when the left side is `null` or `undefined` — **not** when it's `0`, `""`, or `false`.

```js
const volume = 0;
const displayVolume = volume || 50;  // 50 — 0 is falsy, falls back (probably wrong!)
const safeVolume   = volume ?? 50;  // 0  — 0 is not null/undefined, keeps it ✅
```

Use `??` when a value of `0` or `""` is legitimately meaningful and should not trigger a fallback.

---

## Template Literals

Template literals (backtick strings) allow you to embed expressions directly inside a string using `${...}` placeholders.

```js
const name = "Alice";
const score = 42;

// Old way (string concatenation — messy)
const msg1 = "Hello, " + name + "! You scored " + score + " points.";

// Modern way (template literal — clean)
const msg2 = `Hello, ${name}! You scored ${score} points.`;

console.log(msg2); // Hello, Alice! You scored 42 points.
```

Any JavaScript **expression** can go inside `${}`:

```js
const a = 10;
const b = 3;

console.log(`${a} plus ${b} equals ${a + b}.`);     // 10 plus 3 equals 13.
console.log(`${a} is ${a > b ? "greater" : "less"} than ${b}.`); // ternary inside!
```

Template literals also support **multi-line strings** natively:

```js
const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>Score: ${score}</p>
  </div>
`;
```

---

## Operator Precedence (Brief)

Like mathematics, JavaScript operators follow a precedence order. Multiplication happens before addition; parentheses override everything.

```js
2 + 3 * 4    // 14 — multiplication first
(2 + 3) * 4  // 20 — parentheses override
```

> **💡 Tip:** When in doubt, use parentheses. Your future self will thank you, and there is zero performance cost.

---

## Key Takeaways

- Arithmetic operators produce numbers; `%` gives the remainder.
- **Always use `===` and `!==`** — never `==` and `!=`.
- `&&` short-circuits on the first falsy; `||` short-circuits on the first truthy.
- `??` is safer than `||` when `0` or `""` are valid meaningful values.
- Template literals (`` `Hello, ${expr}` ``) are cleaner than concatenation for building strings.

---

## Research Questions

> **🔬 Research Question:** What is **operator precedence** in full? MDN has a complete precedence table. Identify where logical `&&` sits relative to `||` — does `true || false && false` short-circuit differently than you might expect?
>
> *Hint: Search "MDN JavaScript operator precedence table".*

> **🔬 Research Question:** JavaScript has an **optional chaining operator** (`?.`). What problem does it solve, and how does it relate to the `&&` short-circuit pattern shown in this lesson?
>
> *Hint: Try `const user = null; console.log(user?.name)` in the console.*
