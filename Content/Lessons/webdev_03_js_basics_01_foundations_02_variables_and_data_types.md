---
type: lesson
title: "Variables & Data Types"
description: "A variable is a named container for a value. JavaScript has three keywords for declaring variables — `let`, `const`, and the legacy `var` — and five primitive data types that values can belong to. ..."
duration_minutes: 25
tags:
  - javascript
  - variables
  - let
  - const
  - data-types
  - primitives
---

# Variables & Data Types

> **Lesson Summary:** A variable is a named container for a value. JavaScript has three keywords for declaring variables — `let`, `const`, and the legacy `var` — and five primitive data types that values can belong to. Understanding both is essential before writing any logic.

---

## Declaring Variables

### `const` — constant binding (use by default)

```js
const siteName = "IT Learning Hub";
const maxScore = 100;
```

`const` declares a variable that **cannot be reassigned**. This is the right default choice. If you try to reassign a `const`, JavaScript throws a `TypeError` at runtime.

```js
const score = 10;
score = 20; // ❌ TypeError: Assignment to constant variable.
```

> **⚠️ Important:** `const` does *not* make a value deeply immutable. An array or object declared with `const` can still have its contents changed — only the *binding* (the variable pointing to the value) is constant.

### `let` — reassignable variable

```js
let userScore = 0;
userScore = userScore + 10; // ✅ Reassignment is fine
userScore += 10;            // ✅ Same thing, shorter
```

Use `let` when you know the variable's value will change over time (e.g., a counter, a user's current position, an accumulator in a loop).

### `var` — legacy (avoid)

```js
var oldStyle = "please don't use this";
```

`var` pre-dates `let` and `const` and has confusing scoping rules (function-scoped, not block-scoped). You will encounter it in old code and tutorials, but **never write new code with `var`**.

---

### Decision Rule

```
Does the binding ever need to change?
├─ No  → use const  (covers ~80% of cases)
└─ Yes → use let
```

---

## The Five Primitive Types

Primitives are the most basic data types — they represent a single, immutable value.

### 1. String

A sequence of characters enclosed in quotes.

```js
const greeting = "Hello, World!";
const name = 'Alice';                  // Single quotes work too
const multiline = `First line
Second line`;                          // Backtick (template literal) allows multiline
```

Useful string properties and methods:

```js
const str = "JavaScript";

str.length;           // 10 — number of characters
str.toUpperCase();    // "JAVASCRIPT"
str.toLowerCase();    // "javascript"
str.trim();           // removes leading/trailing whitespace
str.includes("Script"); // true
str.startsWith("Java"); // true
str.slice(0, 4);      // "Java" — characters from index 0 up to (not including) 4
str.indexOf("a");     // 1 — first occurrence
str.replace("Java", "Type"); // "TypeScript"
```

### 2. Number

JavaScript uses a single `Number` type for both integers and decimals (IEEE 754 double-precision floating point).

```js
const age = 25;
const price = 19.99;
const negative = -7;
const scientific = 1.5e6; // 1,500,000
```

Special number values:

```js
Infinity          // 1 / 0
-Infinity         // -1 / 0
NaN               // "Not a Number" — result of invalid arithmetic
```

```js
console.log(0 / 0);        // NaN
console.log("abc" * 2);    // NaN
console.log(isNaN(NaN));   // true

// Converting strings to numbers
parseInt("42px");      // 42 — stops at first non-numeric character
parseFloat("3.14em");  // 3.14
Number("42");          // 42
Number("42px");        // NaN — stricter than parseInt
```

> **⚠️ Floating point trap:** `0.1 + 0.2` does **not** equal `0.3` in JavaScript (or any language using IEEE 754). It returns `0.30000000000000004`. For financial calculations, multiply everything to integers first, or use a library like `decimal.js`.

### 3. Boolean

Exactly two values: `true` or `false`. Booleans are the foundation of all conditional logic.

```js
const isLoggedIn = true;
const hasPermission = false;

console.log(typeof true); // "boolean"
```

### 4. Undefined

A variable that has been declared but not yet assigned a value is `undefined`.

```js
let currentUser;
console.log(currentUser); // undefined
console.log(typeof currentUser); // "undefined"
```

`undefined` also appears as the return value of functions that do not explicitly return anything.

### 5. Null

`null` is an explicit, intentional absence of a value. It is typically assigned by the programmer to signal "no value here".

```js
let selectedItem = null; // nothing is selected yet
```

Unlike `undefined` (which means "not yet set"), `null` means "deliberately empty".

---

## Truthy and Falsy

Every value in JavaScript is either **truthy** (behaves like `true` in a boolean context) or **falsy** (behaves like `false`).

**The only falsy values:**

```js
false
0
-0
""           // empty string
null
undefined
NaN
```

**Everything else is truthy** — including `"0"`, `[]`, and `{}`.

```js
if ("hello") {
  console.log("Truthy!"); // This runs — non-empty string is truthy
}

if (0) {
  console.log("Never runs"); // 0 is falsy
}
```

You will use this constantly in control flow — we cover it in detail in Sub-unit 2.

---

## Key Takeaways

- Use `const` by default; use `let` when reassignment is needed; never use `var`.
- JavaScript has five primitive types: **string**, **number**, **boolean**, **undefined**, and **null**.
- `undefined` means "not yet assigned"; `null` means "intentionally empty".
- Every value is either truthy or falsy — knowing the falsy list by heart is essential.
- `typeof` returns a string describing a value's type (`"object"` for `null` is a known bug).

---

## Research Questions

> **🔬 Research Question:** JavaScript has two equality operators: `==` (loose equality) and `===` (strict equality). What is the difference, and why do most style guides (and linters) ban `==`?
>
> *Hint: Search "JavaScript == vs === type coercion" and try `0 == false` in the console.*

> **🔬 Research Question:** Beyond the five primitives, JavaScript has a sixth: `Symbol`. What is a Symbol, what problem does it solve, and where is it used in practice?
>
> *Hint: Search "JavaScript Symbol use cases" and "well-known symbols iterator".*
