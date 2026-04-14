---
type: lesson
title: "Objects"
description: "An object is an unordered collection of **key-value pairs** (called properties). Objects model real-world entities — a user, a product, a configuration — by grouping related data under named keys. ..."
duration_minutes: 25
tags:
  - javascript
  - objects
  - destructuring
  - spread
  - dot-notation
  - bracket-notation
---

# Objects

> **Lesson Summary:** An object is an unordered collection of **key-value pairs** (called properties). Objects model real-world entities — a user, a product, a configuration — by grouping related data under named keys. JavaScript objects are extremely flexible: keys are strings (or Symbols), and values can be anything, including functions and other objects.

---

## Creating an Object

```js
const person = {
  name: "Alice",
  age: 30,
  role: "Developer",
};
```

The `const` keyword means the variable `person` cannot be **reassigned** to a different object, but the object's properties can still be changed freely.

---

## Accessing Properties

### Dot Notation (preferred when key is known)

```js
console.log(person.name); // "Alice"
console.log(person.age);  // 30
```

### Bracket Notation (required for dynamic keys)

```js
console.log(person["role"]); // "Developer"

const key = "name";
console.log(person[key]);    // "Alice" — evaluated at runtime
```

Use bracket notation when the key is stored in a variable, when the key contains spaces or special characters, or when it starts with a number.

---

## Adding, Updating, and Deleting Properties

```js
const car = { make: "Toyota", model: "Corolla" };

// Add new property
car.year = 2022;

// Update existing property
car.model = "Camry";

// Delete a property
delete car.year;

console.log(car); // { make: "Toyota", model: "Camry" }
```

---

## Checking Property Existence

```js
const config = { theme: "dark", language: "en" };

"theme" in config;       // true
"timeout" in config;     // false

config.timeout !== undefined; // false — also works but can be misleading
                              // if timeout is explicitly set to undefined
```

---

## Methods — Functions as Object Properties

When a function is a value on an object, it is called a **method**:

```js
const calculator = {
  value: 0,

  add(n) {
    this.value += n;
    return this; // return this for chaining
  },

  subtract(n) {
    this.value -= n;
    return this;
  },

  result() {
    return this.value;
  },
};

console.log(calculator.add(10).add(5).subtract(3).result()); // 12
```

Inside a method, `this` refers to the object the method is called on.

---

## Object Destructuring

Destructuring extracts properties from an object into named variables:

```js
const user = { name: "Alice", age: 30, role: "admin" };

const { name, age } = user;
console.log(name); // "Alice"
console.log(age);  // 30
```

### Rename on Destructure

```js
const { name: userName, role: userRole } = user;
console.log(userName); // "Alice"
```

### Default Values

```js
const { name, country = "Unknown" } = user;
console.log(country); // "Unknown" — property wasn't on the object
```

### Destructuring in Function Parameters

This is extremely common in modern JavaScript — instead of accessing `options.timeout` inside a function, destructure in the signature:

```js
function connect({ host = "localhost", port = 3000, timeout = 5000 } = {}) {
  console.log(`Connecting to ${host}:${port} (timeout: ${timeout}ms)`);
}

connect({ port: 8080 }); // Connecting to localhost:8080 (timeout: 5000ms)
connect();               // Connecting to localhost:3000 (timeout: 5000ms)
```

---

## The Spread Operator with Objects

Just like with arrays, `...` can spread object properties into a new object:

```js
const defaults = { theme: "light", language: "en", timeout: 5000 };
const userPrefs = { theme: "dark", language: "fr" };

// Merge — later properties override earlier ones
const settings = { ...defaults, ...userPrefs };
// { theme: "dark", language: "fr", timeout: 5000 }
```

This is the standard pattern for immutable updates — you create a new object instead of mutating the original.

---

## Shorthand Property Syntax

When the variable name matches the key name, you can use shorthand:

```js
const name = "Alice";
const age  = 30;

// Long form
const user1 = { name: name, age: age };

// Shorthand
const user2 = { name, age }; // equivalent

console.log(user2); // { name: "Alice", age: 30 }
```

---

## Computed Property Names

Bracket notation works inside object literals too:

```js
const fieldName = "score";
const obj = {
  [fieldName]: 100,          // property name is the value of the variable
  [`${fieldName}_label`]: "Score", // expressions work too
};
// { score: 100, score_label: "Score" }
```

---

## Key Takeaways

- Objects are collections of named properties (key-value pairs).
- Use **dot notation** for known keys; use **bracket notation** for dynamic keys.
- Properties can be added, updated, and deleted after creation.
- Functions on objects are called **methods**; `this` inside a method refers to the object.
- **Destructuring** pulls properties into local variables cleanly.
- The **spread** operator (`{...obj}`) copies/merges objects without mutating the originals.

---

## Research Questions

> **🔬 Research Question:** What are `Object.keys()`, `Object.values()`, and `Object.entries()`? Write a snippet using each to iterate over the properties of an object.
>
> *Hint: `Object.entries(person).forEach(([key, val]) => console.log(key, val))`*

> **🔬 Research Question:** JavaScript also has a `Map` data structure — similar to an object but with distinct differences. When would you choose a `Map` over a plain object? What advantages does it offer?
