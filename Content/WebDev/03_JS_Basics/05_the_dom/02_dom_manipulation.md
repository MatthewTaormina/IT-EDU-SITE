---
title: "DOM Manipulation"
lesson_plan: "JS — The DOM"
order: 2
duration_minutes: 30
sidebar_position: 2
tags:
  - javascript
  - dom
  - manipulation
  - classList
  - createElement
  - innerHTML
  - textContent
---

# DOM Manipulation

> **Lesson Summary:** Once you have selected an element, you can read and change everything about it: its text content, its HTML structure, its CSS classes, its attributes, and even its existence in the document. This lesson covers the full toolkit for reading and mutating the DOM.

---

## Reading and Writing Text Content

### `textContent` — Plain Text

`textContent` gets or sets the **plain text** content of an element and all its descendants. HTML tags are treated as literal text.

```js
const heading = document.querySelector("h1");

// Read
console.log(heading.textContent); // "Welcome to the Site"

// Write
heading.textContent = "Hello, Alice!";
// The <h1> now shows: Hello, Alice!
```

```js
// Setting textContent with HTML — the tags become visible text
heading.textContent = "<strong>Bold?</strong>";
// Renders: <strong>Bold?</strong>   (not bold — XSS safe ✅)
```

### `innerHTML` — HTML Content

`innerHTML` gets or sets the **HTML markup** inside an element. Tags are parsed and rendered.

```js
const container = document.querySelector(".card");

// Read
console.log(container.innerHTML); // "<h2>Title</h2><p>Body text.</p>"

// Write
container.innerHTML = "<h2>New Title</h2><p>New body.</p>";
```

> **⚠️ Security Warning:** Never set `innerHTML` with untrusted user input — this opens your page to **Cross-Site Scripting (XSS)** attacks. If a user can inject HTML through `innerHTML`, they can run arbitrary JavaScript. Use `textContent` for user-supplied strings, or sanitise carefully.

---

## Working with CSS Classes

`element.classList` provides methods for managing the element's CSS classes without touching the `className` string directly.

```js
const card = document.querySelector(".card");

card.classList.add("active");          // add a class
card.classList.remove("inactive");     // remove a class
card.classList.toggle("hidden");       // add if absent, remove if present
card.classList.contains("active");     // true/false — check if class exists
card.classList.replace("old", "new");  // replace one class with another
```

`classList.toggle` is particularly powerful for interactive elements:

```js
const menuBtn = document.querySelector("#menu-toggle");
const nav     = document.querySelector("#nav");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("open"); // toggles the open class on every click
});
```

---

## Reading and Writing Attributes

```js
const link = document.querySelector("a");

// Read
link.getAttribute("href");   // "/about"

// Write
link.setAttribute("href", "/contact");
link.setAttribute("target", "_blank");

// Remove
link.removeAttribute("target");

// Check existence
link.hasAttribute("href");   // true
```

### Common Element Properties (shorthand for getAttribute/setAttribute)

Most HTML attributes have corresponding **JavaScript properties** — these are the idiomatic way to read/write them:

```js
const input = document.querySelector("input");

input.value;            // current value of the input
input.value = "Alice";  // set it
input.placeholder;
input.disabled = true;  // disable the input
input.checked;          // for checkboxes

const img = document.querySelector("img");
img.src = "/new-image.jpg";
img.alt = "New description";
```

---

## Setting Inline Styles

```js
const box = document.querySelector(".box");

box.style.backgroundColor = "#1e40af"; // camelCase, not kebab-case
box.style.fontSize = "1.5rem";
box.style.display = "none"; // hide element
```

> **💡 Tip:** Setting inline styles via JavaScript is best reserved for values that are calculated at runtime (e.g., a draggable element's `left` position). For toggling visual states, **add/remove a CSS class** instead — that keeps styling in CSS where it belongs.

---

## Creating and Inserting Elements

### `document.createElement()`

```js
const li = document.createElement("li");
li.textContent = "New Item";
li.classList.add("list-item");
```

This creates the element but does **not** insert it into the page yet.

### Inserting Elements

```js
const list = document.querySelector("ul");

// Append to the end
list.appendChild(li);

// Append (modern — accepts strings and multiple nodes)
list.append(li);
list.append("Plain text too");

// Prepend to the start
list.prepend(li);

// Insert before a reference element
const referenceItem = list.querySelector("li:nth-child(2)");
list.insertBefore(li, referenceItem);

// Insert relative to the element (modern)
referenceItem.before(li);  // before the reference
referenceItem.after(li);   // after the reference
```

### Full Example — Dynamically Building a List

```js
const fruits = ["Apple", "Banana", "Cherry"];
const ul = document.querySelector("#fruit-list");

ul.innerHTML = ""; // clear existing items

fruits.forEach(fruit => {
  const li = document.createElement("li");
  li.textContent = fruit;
  ul.appendChild(li);
});
```

---

## Removing Elements

```js
const element = document.querySelector(".card");

// Modern (preferred)
element.remove();

// Legacy (still works)
element.parentNode.removeChild(element);
```

---

## Key Takeaways

- `textContent` — safe for plain text (user-supplied data); treats HTML as literal text.
- `innerHTML` — parses HTML markup; **never use with untrusted input** (XSS risk).
- `classList.add/remove/toggle/contains` — the right way to manage CSS classes.
- `getAttribute/setAttribute` — for arbitrary HTML attributes; most common attributes have direct JS properties.
- `document.createElement()` + `append/prepend/insertBefore` — the DOM-safe pattern for adding elements.
- `element.remove()` — the clean modern way to remove an element.

---

## Research Questions

> **🔬 Research Question:** What is **XSS (Cross-Site Scripting)**? Find a real-world example of an XSS vulnerability caused by unsanitised `innerHTML`. What is the `DOMPurify` library and how does it help?

> **🔬 Research Question:** What is `insertAdjacentHTML()`? How does it let you insert HTML relative to an element without replacing its entire content? What four positions does it support?
