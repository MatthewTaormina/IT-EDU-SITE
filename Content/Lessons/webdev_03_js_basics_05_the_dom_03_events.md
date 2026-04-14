---
type: lesson
title: "Events"
description: "JavaScript makes pages interactive by *listening* for events — user actions like clicks, key presses, and form submissions — and running code in response. This lesson covers `addEventListener`, the..."
duration_minutes: 30
tags:
  - javascript
  - events
  - addEventListener
  - event-object
  - event-delegation
  - preventDefault
---

# Events

> **Lesson Summary:** JavaScript makes pages interactive by *listening* for events — user actions like clicks, key presses, and form submissions — and running code in response. This lesson covers `addEventListener`, the event object, the most common event types, preventing default behaviour, and the powerful event delegation pattern.

---

## What Are Events?

An event is a signal that something has happened — a click, a key press, a mouse move, a form submit. The browser fires events on elements, and JavaScript can react by registering **event listeners** — functions that run when a specific event fires on a specific element.

---

## `addEventListener()`

```js
element.addEventListener(eventType, handler);
```

- **`eventType`** — a string naming the event: `"click"`, `"input"`, `"submit"`, etc.
- **`handler`** — a function (callback) that runs when the event fires.

```js
const button = document.querySelector("#submit-btn");

button.addEventListener("click", function () {
  console.log("Button was clicked!");
});
```

With an arrow function (more common in modern code):

```js
button.addEventListener("click", () => {
  console.log("Button was clicked!");
});
```

With a named function (cleaner for complex handlers or when you need to remove the listener later):

```js
function handleClick() {
  console.log("Button was clicked!");
}

button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick); // requires the same function reference
```

---

## The Event Object

The browser automatically passes an **event object** as the first argument to every event handler. It contains information about the event that occurred.

```js
button.addEventListener("click", (event) => {
  console.log(event.type);   // "click"
  console.log(event.target); // the element that was clicked
  console.log(event.clientX, event.clientY); // mouse position
});
```

### Useful Event Properties

| Property | Description |
| :--- | :--- |
| `event.type` | The event type (`"click"`, `"keydown"`, etc.) |
| `event.target` | The element that triggered the event |
| `event.currentTarget` | The element the listener is attached to |
| `event.key` | The key pressed (for keyboard events: `"Enter"`, `"a"`, etc.) |
| `event.clientX / clientY` | Mouse position relative to the viewport |
| `event.preventDefault()` | Cancels the browser's default action |
| `event.stopPropagation()` | Stops the event from bubbling up the DOM tree |

---

## Common Event Types

### Mouse Events

```js
el.addEventListener("click",      handler); // single click
el.addEventListener("dblclick",   handler); // double click
el.addEventListener("mouseenter", handler); // cursor enters element (no bubbling)
el.addEventListener("mouseleave", handler); // cursor leaves element (no bubbling)
el.addEventListener("mouseover",  handler); // cursor over element (bubbles)
```

### Keyboard Events

```js
document.addEventListener("keydown", (event) => {
  console.log(event.key); // "Enter", "Escape", "a", "ArrowUp", etc.

  if (event.key === "Escape") {
    closeModal();
  }
});
```

> **💡 Tip:** Use `keydown` for most keyboard interactions. The deprecated `keyCode` property (a number) should not be used — use `event.key` (a string) instead.

### Form Events

```js
const input = document.querySelector("#search");

// Fires on every keystroke
input.addEventListener("input", (event) => {
  console.log(event.target.value); // current value of the input
});

// Fires when input loses focus
input.addEventListener("blur", handler);
input.addEventListener("focus", handler);

// Fires on form submission
const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);
```

---

## `event.preventDefault()`

The browser has default behaviours for many events — clicking a link navigates, submitting a form reloads the page. `preventDefault()` cancels these defaults so you can handle them in JavaScript instead.

```js
const form = document.querySelector("#login-form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading

  const email    = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  console.log("Submitting:", email, password);
  // validate, then send via fetch()
});
```

```js
const link = document.querySelector("a.ajax-link");

link.addEventListener("click", (event) => {
  event.preventDefault(); // stop navigation
  loadPageContent(link.href); // load with AJAX instead
});
```

---

## Event Bubbling

When an event fires on an element, it **bubbles up** through all its ancestors — the parent, grandparent, and so on up to `document`. Each ancestor can have its own listener for the same event.

```html
<div id="outer">
  <div id="inner">
    <button id="btn">Click me</button>
  </div>
</div>
```

```js
document.querySelector("#btn").addEventListener("click",   () => console.log("button"));
document.querySelector("#inner").addEventListener("click", () => console.log("inner"));
document.querySelector("#outer").addEventListener("click", () => console.log("outer"));
```

Clicking the button logs:
```
button
inner
outer
```

Use `event.stopPropagation()` inside a handler to prevent further bubbling.

---

## Event Delegation

Instead of attaching a listener to every individual element, attach **one listener to a common parent** and check `event.target` to identify which child was clicked.

```js
const list = document.querySelector("#task-list");

list.addEventListener("click", (event) => {
  if (event.target.matches("button.delete")) {
    event.target.closest("li").remove(); // remove the parent <li>
  }
});
```

**Why event delegation is powerful:**
- **Works for dynamically added elements** — listeners on the parent catch events from children that didn't exist when the page loaded
- **More efficient** — one listener instead of dozens
- **Cleaner code** — one place to manage interaction logic for a list

---

## Removing Event Listeners

```js
function onResize() {
  // ...
}

window.addEventListener("resize", onResize);
window.removeEventListener("resize", onResize); // same reference needed
```

For anonymous functions or arrow functions, you cannot remove the listener — another reason to prefer named handlers for anything you might need to clean up.

---

## Key Takeaways

- `addEventListener(type, handler)` registers a function to run when an event fires.
- The event object provides context: `event.target`, `event.key`, `event.clientX`, etc.
- `event.preventDefault()` cancels the browser's default action.
- Events **bubble** up the DOM tree — `stopPropagation()` halts them.
- **Event delegation** — listening on a parent and checking `event.target` — is the right pattern for dynamic lists and efficient interfaces.

---

## Research Questions

> **🔬 Research Question:** What is the difference between `event.target` and `event.currentTarget`? Under what circumstances are they different?
>
> *Hint: Add a listener to a `<div>` and click a child `<p>` inside it — which element is each property on?*

> **🔬 Research Question:** What is **event capturing** (the third argument to `addEventListener`: `{ capture: true }`)? How does it differ from bubbling, and when would you ever use it?
