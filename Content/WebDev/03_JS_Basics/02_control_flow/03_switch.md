---
title: "Switch Statements"
lesson_plan: "JS — Control Flow"
order: 3
duration_minutes: 20
sidebar_position: 3
tags:
  - javascript
  - switch
  - control-flow
  - fall-through
---

# Switch Statements

> **Lesson Summary:** The `switch` statement compares a single expression against multiple fixed values using strict equality. It can be cleaner than a long `if/else if` chain when you're branching on many possible values of the same variable — but its fall-through behaviour is a common source of bugs.

---

## Syntax

```js
switch (expression) {
  case value1:
    // runs when expression === value1
    break;
  case value2:
    // runs when expression === value2
    break;
  default:
    // runs when no case matches
}
```

---

## Basic Example

```js
const day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of the work week.");
    break;
  case "Friday":
    console.log("Last day before the weekend.");
    break;
  case "Saturday":
  case "Sunday":
    console.log("Weekend!");
    break;
  default:
    console.log("Midweek.");
}
// Output: Start of the work week.
```

---

## How `break` Works

Without `break`, JavaScript **falls through** to the next `case` and continues executing until it hits a `break` or the end of the `switch`. This is almost always unintentional.

```js
const status = 2;

switch (status) {
  case 1:
    console.log("Pending");
    // No break — FALLS THROUGH
  case 2:
    console.log("Active");
    // No break — FALLS THROUGH
  case 3:
    console.log("Inactive");
    break;
  default:
    console.log("Unknown");
}
// Output:
// Active     ← matched case 2
// Inactive   ← fell through to case 3 (unintentional!)
```

> **⚠️ Rule:** Always add `break` at the end of every `case` unless you have a deliberate reason to fall through. Omitting `break` by accident is one of the most common bugs in JavaScript.

---

## Intentional Fall-Through

Stacking cases without `break` between them is a legitimate pattern — it lets multiple values share the same handler:

```js
const month = 4; // April

switch (month) {
  case 1:
  case 3:
  case 5:
  case 7:
  case 8:
  case 10:
  case 12:
    console.log("31 days");
    break;
  case 4:
  case 6:
  case 9:
  case 11:
    console.log("30 days");
    break;
  case 2:
    console.log("28 or 29 days");
    break;
}
// Output: 30 days
```

---

## The `default` Case

`default` is optional but strongly recommended as a safety net. It runs when no case matches and is the equivalent of the final `else` in an `if/else if` chain.

```js
const command = "restart";

switch (command) {
  case "start":
    console.log("Starting…");
    break;
  case "stop":
    console.log("Stopping…");
    break;
  default:
    console.log(`Unknown command: "${command}"`);
}
// Output: Unknown command: "restart"
```

> **💡 Tip:** Put `default` last. Although JavaScript allows it anywhere, last is the convention and avoids fall-through into it from above.

---

## Switch Uses Strict Equality

`switch` compares using `===` — type matters:

```js
switch ("1") {
  case 1:
    console.log("Number one");
    break;
  case "1":
    console.log("String one"); // This matches
    break;
}
// Output: String one
```

---

## When to Use `switch` vs. `if/else if`

| Situation | Prefer |
| :--- | :--- |
| A single variable with many fixed values | `switch` |
| Complex conditions or ranges (`> 50`, `< 20`) | `if/else if` |
| Values of different types | `if/else if` |
| Early return / guard clause patterns | `if` |
| Simple 2-branch decision | Ternary |

---

## Key Takeaways

- `switch` compares one expression against many fixed values using strict equality (`===`).
- **Always `break` after each case** unless you deliberately want fall-through.
- Stack cases with no `break` between them to share a handler across multiple values.
- `default` is optional but good practice as a catch-all.
- Prefer `if/else if` when comparing ranges or mixing types.

---

## Research Questions

> **🔬 Research Question:** ES2021+ introduced a proposal for **pattern matching** (`match` expression) to JavaScript as a replacement for both `switch` and complex `if/else` chains. Research the status of the TC39 proposal and look at the syntax. Does it solve the fall-through problem?
>
> *Hint: Search "TC39 pattern matching JavaScript proposal".*

> **🔬 Research Question:** Some codebases replace `switch` with **lookup objects** (also called dispatch tables). Find an example of this pattern and explain why it might be preferable in some situations.
>
> *Hint: Search "JavaScript replace switch statement with object".*
