---
title: "Sub-unit Review — The DOM"
lesson_plan: "JS — The DOM"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Sub-unit Review — The DOM

> Work through this without looking back at the lessons.

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **DOM** | Document Object Model — the browser's live, in-memory tree of the HTML page |
| **`document`** | The global entry point to the DOM |
| **`querySelector(sel)`** | Returns the first element matching a CSS selector, or `null` |
| **`querySelectorAll(sel)`** | Returns a static NodeList of all matching elements |
| **`getElementById(id)`** | Returns the element with that id, or `null` |
| **NodeList** | Array-like collection of nodes — iterable with `for...of`; lacks array methods |
| **`textContent`** | Gets or sets an element's plain text content (HTML is escaped — XSS safe) |
| **`innerHTML`** | Gets or sets the HTML markup inside an element (XSS risk with untrusted input) |
| **`classList`** | API for adding, removing, toggling, and checking CSS classes |
| **`getAttribute / setAttribute`** | Read and write arbitrary HTML attributes |
| **`element.style.prop`** | Sets an inline style property — use for dynamic/calculated values only |
| **`createElement(tag)`** | Creates a new element node (not yet inserted in the document) |
| **`append / prepend`** | Insert nodes at the end/start of a parent element |
| **`element.remove()`** | Removes the element from the DOM |
| **Event** | A signal that something happened — `"click"`, `"input"`, `"keydown"`, etc. |
| **`addEventListener(type, fn)`** | Registers a handler function for an event on an element |
| **Event object** | Passed to every handler — contains `target`, `key`, `clientX/Y`, etc. |
| **`event.target`** | The element that originally triggered the event |
| **`event.preventDefault()`** | Cancels the browser's default action for the event |
| **Bubbling** | Events propagate up through ancestor elements after firing |
| **`stopPropagation()`** | Halts event bubbling at the current element |
| **Event delegation** | Attaching one listener to a parent and checking `event.target` to handle child events |

---

## Quick Check

1. What is the difference between `querySelector` and `querySelectorAll`? What does each return?

2. You have `const list = document.querySelectorAll("li")`. Can you call `list.map(...)` directly? Why or why not? How would you fix it?

3. What is the security risk of `innerHTML`? When is it safe to use, and what should you use instead for displaying user-supplied text?

4. Write the code to: select the button with id `"save-btn"`, change its `textContent` to `"Saving…"`, and add the class `"loading"`.

5. Using `classList`, write code that toggles a sidebar's `"open"` class every time a hamburger button is clicked.

6. What is `event.target`? In the context of event delegation, how do you check whether the clicked element is the one you care about?

7. A form should not submit and reload the page — the data should be handled with JavaScript instead. What single line inside the submit listener achieves this?

8. Explain event bubbling in plain English. Give an example of when stopping propagation with `event.stopPropagation()` would be necessary.

9. You add a `"click"` listener to a `<ul>` that dynamically renders `<li>` items. Why does delegation work for newly added items, while attaching the listener to each `<li>` would not?

10. Write the code to dynamically build and insert a `<div class="alert">` with the text `"Save successful!"` into the `#notifications` container.
