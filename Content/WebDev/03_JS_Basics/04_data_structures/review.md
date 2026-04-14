---
title: "Sub-unit Review — Data Structures"
lesson_plan: "JS — Data Structures"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — Data Structures

> Work through this without looking back at the lessons.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Array** | An ordered, zero-indexed list of values |
| **Index** | The numerical position of an element in an array (starts at `0`) |
| **`push` / `pop`** | Add to / remove from the end of an array (mutating) |
| **`shift` / `unshift`** | Remove from / add to the start of an array (mutating) |
| **`splice`** | Insert, remove, or replace elements at any position (mutating) |
| **`map`** | Returns a new array where every element has been transformed |
| **`filter`** | Returns a new array containing only elements that pass a test |
| **`find`** | Returns the first element that passes a test, or `undefined` |
| **`reduce`** | Reduces an array to a single accumulated value |
| **Spread operator (`...`)** | Expands an array or object's contents into a new array/object |
| **Array destructuring** | `const [a, b] = arr` — extracts values into variables by position |
| **Object** | An unordered collection of key-value pairs (properties) |
| **Property** | A key-value pair on an object |
| **Dot notation** | `obj.key` — access a property with a literal key name |
| **Bracket notation** | `obj["key"]` — access a property with a dynamic key |
| **Method** | A function that is a value on an object |
| **`this`** | Inside a method, refers to the object the method was called on |
| **Object destructuring** | `const { a, b } = obj` — extracts properties into named variables |
| **JSON** | JavaScript Object Notation — a text format for structured data |
| **`JSON.stringify()`** | Converts a JS value to a JSON string |
| **`JSON.parse()`** | Converts a JSON string to a JS value |

---

## Quick Check

1. What is the difference between `map` and `filter`? What do they each return?

2. Given `const arr = [10, 20, 30]`, what is the value of `arr[arr.length - 1]`?

3. Write a one-liner using `reduce` that sums all values in `[5, 10, 15, 20]`.

4. What is the difference between `arr.slice(1, 3)` and `arr.splice(1, 2)`?

5. Create an object `book` with properties `title`, `author`, and `year`. Then add a `summary()` method that returns a formatted string using template literals.

6. What is the difference between dot notation and bracket notation for property access? Give an example where bracket notation is the **only** option.

7. Destructure the following without accessing each property individually:
   ```js
   const response = { status: 200, data: { user: "Alice", role: "admin" } };
   ```
   Extract `status`, `user`, and `role` into separate variables.

8. List three rules that make JSON stricter than a JavaScript object literal.

9. What does `JSON.parse` throw if given invalid JSON? How should you handle it?

10. Why can't `JSON.stringify` represent a function? What happens when you try?
