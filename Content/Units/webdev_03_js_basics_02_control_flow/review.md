---
title: "Sub-unit Review — Control Flow"
lesson_plan: "JS — Control Flow"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Control Flow

> Work through this without looking back at the lessons.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **`if` statement** | Executes a block only when its condition is truthy |
| **`else if`** | An additional condition checked when the preceding `if` is falsy |
| **`else`** | A catch-all block that runs when all preceding conditions are falsy |
| **Truthy** | Any value that coerces to `true` in a boolean context |
| **Falsy** | `false`, `0`, `-0`, `""`, `null`, `undefined`, `NaN` |
| **Ternary operator** | `condition ? a : b` — compact inline two-branch expression |
| **`for` loop** | Loop with explicit initialiser, condition, and update |
| **`while` loop** | Loop that repeats while a condition is truthy |
| **`for...of`** | Iterates over the *values* of an iterable (array, string, etc.) |
| **`for...in`** | Iterates over the *keys* of an object |
| **`break`** | Immediately exits the current loop or switch |
| **`continue`** | Skips the rest of the current iteration, moves to next |
| **`switch`** | Compares one expression to many fixed values using `===` |
| **Fall-through** | What happens when a `switch` case has no `break` — execution continues into the next case |
| **`default`** | The catch-all case in a `switch` — runs when no case matches |

---

## Quick Check

1. What is the difference between `if/else if/else` and a `switch` statement? Give an example of when you would clearly prefer one over the other.

2. What is the result of `if (0)` and `if ([])` ? Explain why.

3. Rewrite this `if/else` as a ternary:
   ```js
   let message;
   if (unreadCount > 0) {
     message = `You have ${unreadCount} unread messages.`;
   } else {
     message = "All caught up!";
   }
   ```

4. What is the output of this code, and why?
   ```js
   for (let i = 0; i < 10; i++) {
     if (i % 3 === 0) continue;
     if (i === 7) break;
     console.log(i);
   }
   ```

5. Explain the difference between `for...of` and `for...in`. Which would you use to iterate over an array of names? Which would you use to iterate over the properties of a configuration object?

6. What is fall-through in a `switch` statement? Write an example where fall-through is **intentional** and useful.

7. A colleague wrote:
   ```js
   while (true) {
     const input = getNextInput();
     processInput(input);
   }
   ```
   This is an infinite loop. What would you need to add to make it safe, and where?
