---
type: lesson
title: "Optional Chaining & Nullish Coalescing"
description: "Navigate deeply nested data safely with optional chaining (?.) and provide fallbacks for null/undefined values with nullish coalescing (??)."
duration_minutes: 25
tags:
  - javascript
  - optional-chaining
  - nullish-coalescing
  - es2020
  - null-safety
---

# Optional Chaining & Nullish Coalescing

> **Lesson Summary:** Two operators introduced in ES2020 that eliminate the most common `TypeError` in JavaScript: `Cannot read properties of null`. Optional chaining (`?.`) short-circuits to `undefined` instead of throwing. Nullish coalescing (`??`) provides a fallback only for `null` and `undefined` — unlike `||`, it respects `0`, `''`, and `false` as valid values.

---

## The Problem: Accessing Nested Data

API responses are often deeply nested, and any level of the tree might be `null` or `undefined`:

```js
const user = null; // API returned no user

// Without safety checks — throws TypeError:
console.log(user.address.city); // TypeError: Cannot read properties of null
```

The traditional fix was verbose:

```js
const city = user && user.address && user.address.city;
```

With optional chaining, this becomes:

```js
const city = user?.address?.city; // undefined — no error
```

---

## Optional Chaining (`?.`)

`?.` short-circuits the expression to `undefined` if the left side is `null` or `undefined`, instead of throwing a `TypeError`.

### Property Access

```js
const user = {
  name: 'Alice',
  address: null,
};

console.log(user?.name);          // 'Alice'
console.log(user?.address?.city); // undefined (address is null — no throw)
console.log(user?.phone?.mobile); // undefined (phone doesn't exist — no throw)
```

### Method Calls

`?.()` calls the method only if it exists:

```js
const plugin = {
  init: () => console.log('initialized'),
};

plugin.init?.();    // 'initialized'
plugin.destroy?.(); // undefined — destroy doesn't exist, no error
```

### Array / Bracket Access

`?.[index]` accesses an element only if the array exists:

```js
const tags = null;

console.log(tags?.[0]); // undefined — no TypeError
```

### Chaining Multiple Levels

```js
const response = {
  data: {
    users: [
      { name: 'Alice', settings: { theme: 'dark' } },
      { name: 'Bob' }, // no settings
    ],
  },
};

// Safe multi-level access
const firstUserTheme = response?.data?.users?.[0]?.settings?.theme;
// 'dark'

const secondUserTheme = response?.data?.users?.[1]?.settings?.theme;
// undefined — no error even though settings doesn't exist on Bob
```

---

## The `||` Operator vs. `??`

`||` returns the right operand when the left is **falsy** — which includes `null`, `undefined`, `0`, `''`, and `false`:

```js
const count = 0;
console.log(count || 'no count'); // 'no count' — WRONG! 0 is a valid count

const name = '';
console.log(name || 'anonymous'); // 'anonymous' — WRONG if empty string is intentional
```

This catches many developers off guard. `0` is a legitimate value for a counter. `''` might be a deliberately empty string.

---

## Nullish Coalescing (`??`)

`??` returns the right operand only when the left is **`null` or `undefined`** — it ignores all other falsy values:

```js
const count = 0;
console.log(count ?? 'no count'); // 0 — correct! 0 is not null/undefined

const name = '';
console.log(name ?? 'anonymous'); // '' — correct! empty string is not null/undefined

const title = null;
console.log(title ?? 'Untitled'); // 'Untitled' — null triggers the fallback

const subtitle = undefined;
console.log(subtitle ?? 'No subtitle'); // 'No subtitle'
```

---

## Combining `?.` and `??`

These two operators are designed to be used together:

```js
const user = null;

const displayName = user?.profile?.displayName ?? 'Guest';
// If user is null → user?.profile?.displayName is undefined → ?? returns 'Guest'
```

```js
const config = {
  maxRetries: 0, // 0 is a valid value
  timeout: null, // null means "use default"
};

const retries = config?.maxRetries ?? 3; // 0 — respects 0 as valid
const timeout = config?.timeout ?? 5000; // 5000 — null triggers fallback
```

---

## Optional Assignment with `??=`

The nullish assignment operator assigns only if the target is `null` or `undefined`:

```js
let cache = null;
cache ??= fetchData(); // assigns if null/undefined; skips if already set

let existing = 'cached-value';
existing ??= fetchData(); // 'cached-value' — NOT reassigned
```

---

## Key Takeaways

- `?.` short-circuits to `undefined` when accessing properties on `null` or `undefined` — prevents `TypeError`.
- `?.` works for property access (`obj?.prop`), method calls (`obj.method?.()`), and array access (`arr?.[i]`).
- `??` returns the fallback only for `null` or `undefined` — unlike `||`, it respects `0`, `''`, and `false`.
- Combine them: `data?.nested?.value ?? 'default'` — safe access with a clean fallback.
- `??=` performs nullish assignment — only assigns if the target is `null` or `undefined`.

---

## Challenge

Given this unpredictable API response (some fields are null, some are absent):

```js
const apiUser = {
  id: 42,
  profile: null,
  stats: {
    posts: 0,
    followers: null,
    views: undefined,
  },
};
```

Using `?.` and `??`, extract:
- `displayName` — from `apiUser.profile.displayName`, defaulting to `'Anonymous'`
- `avatarUrl` — from `apiUser.profile.avatar.url`, defaulting to `'/default-avatar.png'`
- `postCount` — from `apiUser.stats.posts`, defaulting to `0` (must keep `0` as a valid value — do not use `||`)
- `followerCount` — from `apiUser.stats.followers`, defaulting to `0`

---

## Research Questions

> **🔬 Research Question:** Can you use optional chaining in assignment position? For example: `user?.address.city = 'London'`. Try it. What happens, and why?

> **🔬 Research Question:** What is the `||=` operator (logical OR assignment) and how does it differ from `??=`? Give a concrete example where you would choose `??=` over `||=`.

## Optional Resources

- [MDN — Optional chaining (?.)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN — Nullish coalescing operator (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
