---
type: lesson
title: "Destructuring"
description: "Unpack array elements and object properties into named variables — including nested structures, default values, and renaming."
duration_minutes: 35
tags:
  - javascript
  - es6
  - destructuring
  - arrays
  - objects
---

# Destructuring

> **Lesson Summary:** Destructuring is a syntax for extracting values from arrays and properties from objects into distinct variables in a single, readable statement. It eliminates repetitive `const name = obj.name` patterns and is used everywhere in modern JavaScript — especially when working with API responses.

---

## The Problem It Solves

Without destructuring:

```js
const user = { name: 'Alice', age: 30, city: 'London' };

const name = user.name;
const age = user.age;
const city = user.city;
```

With destructuring:

```js
const { name, age, city } = user;
```

Same result; one line.

---

## Object Destructuring

```js
const { property1, property2 } = object;
```

### Basic Usage

```js
const repo = {
  name: 'react',
  owner: 'facebook',
  stars: 220000,
  language: 'JavaScript',
};

const { name, stars } = repo; // only extract what you need
console.log(name);  // 'react'
console.log(stars); // 220000
```

### Renaming

Rename the variable using `:`:

```js
const { name: repoName, stars: starCount } = repo;
console.log(repoName);  // 'react'
console.log(starCount); // 220000
// 'name' and 'stars' are not defined as variables
```

### Default Values

Provide a fallback if the property is `undefined`:

```js
const { description = 'No description provided' } = repo;
console.log(description); // 'No description provided' (repo has no description property)
```

Rename and default together:

```js
const { description: desc = 'No description' } = repo;
```

### Nested Destructuring

```js
const user = {
  name: 'Alice',
  address: {
    city: 'London',
    country: 'UK',
  },
};

const { name, address: { city, country } } = user;
console.log(city);    // 'London'
console.log(country); // 'UK'
// Note: 'address' is NOT a variable here — only city and country are
```

### In Function Parameters

Destructure directly in the parameter list — very common in React and event handlers:

```js
function renderCard({ name, stars, language = 'Unknown' }) {
  return `<div>${name} — ⭐${stars} — ${language}</div>`;
}

renderCard(repo);
```

---

## Array Destructuring

```js
const [first, second, ...rest] = array;
```

### Basic Usage

```js
const colors = ['red', 'green', 'blue'];

const [primary, secondary, tertiary] = colors;
console.log(primary);   // 'red'
console.log(secondary); // 'green'
```

### Skipping Elements

```js
const [, , third] = colors; // skip first two
console.log(third); // 'blue'
```

### Default Values

```js
const [a = 1, b = 2] = [10];
console.log(a); // 10
console.log(b); // 2 (default, since index 1 is undefined)
```

### Swapping Variables

```js
let x = 1;
let y = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1
```

---

## Destructuring in Loops

Very useful when iterating over arrays of objects:

```js
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
];

for (const { name, role } of users) {
  console.log(`${name} is ${role}`);
}
```

And with `Object.entries()`:

```js
const config = { host: 'localhost', port: 3000 };

for (const [key, value] of Object.entries(config)) {
  console.log(`${key}: ${value}`);
}
```

---

## Destructuring API Responses

In real code, destructuring shines when processing API responses:

```js
const response = await fetch('https://api.github.com/users/torvalds');
const { name, login, public_repos, followers } = await response.json();

console.log(`${name} (@${login}) — ${public_repos} repos — ${followers} followers`);
```

---

## Key Takeaways

- Object destructuring: `const { prop, prop2 } = obj` — extracts named properties.
- Rename: `const { prop: newName } = obj`.
- Default: `const { prop = fallback } = obj`.
- Array destructuring: `const [a, b] = arr` — extracts by position.
- Skip elements: `const [, , third] = arr`.
- Nested destructuring: `const { address: { city } } = user`.
- Use destructuring in function parameters to document exactly what a function needs.

---

## Challenge

Given this API response object:

```js
const apiData = {
  status: 'ok',
  data: {
    user: {
      id: 42,
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true,
      },
    },
    stats: [120, 85, 200, 45],
  },
};
```

Using a single destructuring statement, extract:
- `status`
- `fullName` renamed to `name`
- `email`
- `theme` from preferences
- The second element of `stats` as `secondStat`
- `timezone` from preferences, defaulting to `'UTC'`

---

## Research Questions

> **🔬 Research Question:** What happens when you try to destructure `null` or `undefined`? Try `const { name } = null`. Why does this throw? How does optional chaining (`?.`) interact with destructuring?

> **🔬 Research Question:** How does destructuring work with `Map` objects? Try `const [first] = new Map([['key', 'value']])`. What do you get?

## Optional Resources

- [MDN — Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
