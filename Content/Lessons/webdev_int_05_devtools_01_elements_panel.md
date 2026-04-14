---
type: lesson
title: "The Elements Panel"
description: "Inspect and live-edit HTML and CSS using the Elements panel — understanding the live DOM, the Styles tab, the Computed tab, and the Box Model visualizer."
duration_minutes: 30
tags:
  - devtools
  - elements-panel
  - css-debugging
  - dom
  - computed-styles
---

# The Elements Panel

> **Lesson Summary:** The Elements panel shows the live DOM — the browser's current internal model of the page — and lets you inspect and modify HTML and CSS in real time. Changes are immediate but not permanent; they reset on refresh. This panel is where you debug CSS specificity battles, inspect computed styles, and prototype layout fixes.

---

## Opening DevTools

| Browser | Keyboard Shortcut | Right-click Method |
| :--- | :--- | :--- |
| Chrome / Edge | `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows) | Right-click → Inspect |
| Firefox | `F12` or `Cmd+Option+I` | Right-click → Inspect |
| Safari | `Cmd+Option+I` (Enable first in Preferences → Advanced) | Right-click → Inspect Element |

> **💡 Tip:** `Cmd+Shift+C` (Mac) / `Ctrl+Shift+C` (Windows) opens DevTools with the element picker active — click any element on the page to jump directly to it in the Elements panel.

---

## The DOM Tree

The left side of the Elements panel shows the **live DOM tree** — not the raw HTML source.

The DOM can differ from the source HTML when:
- JavaScript has added, removed, or modified elements
- The browser has corrected invalid HTML (e.g., auto-closed tags)
- A template or framework has rendered dynamic content

```
▶ <html>
  ▶ <head>
  ▼ <body>
    ▶ <header>
    ▼ <main>
        <h1>Hello</h1>
        ▼ <div class="card">
            <p>Content</p>
          </div>
```

Click the `▶` triangle to expand a node. Click `▶` again to collapse.

### Editing the DOM

- **Double-click** any element's tag name, attribute, or text to edit it inline
- **Delete key** removes a selected node
- Drag nodes to reorder them
- Right-click a node for more options: Copy, Cut, Paste, Add Attribute, Force State

---

## The Styles Tab

The right side of the Elements panel shows CSS rules applied to the selected element.

```
element.style { }                         ← inline styles (highest priority)
.card { color: red; }        style.css:42 ← your stylesheet
div { color: blue; }          ~~style.css:18~~ ← overridden rule (strikethrough)
user agent stylesheet { }               ← browser defaults
```

**Struck-through declarations** are overridden — another rule with higher specificity or order is winning. The winning rule appears at the top.

### Common Debugging Pattern

1. Select the element in question (right-click → Inspect)
2. In the Styles tab, find the struck-through property you expected to apply
3. Hover over the rule's filename to open it; or check the specificity — the winning rule is listed above it

---

## The Computed Tab

The Computed tab shows **final resolved values** after all cascade, inheritance, and specificity resolution:

- `color: rgb(255, 0, 0)` — the actual computed color (in `rgb()`, not the original keyword or hex)
- `margin-top: 16px` — computed from `1rem` at the page's base font size
- `display: block` — inherited or applied by the browser default

**Use the Computed tab to:**
- See what value a property actually resolved to (especially useful for `em`/`rem` calculations)
- Determine where an inherited property is coming from (click the arrow next to any property)
- Debug unexpected layout behavior by checking `display`, `position`, and `box-sizing`

---

## The Box Model Visualizer

At the bottom of the Computed tab (Chrome) or in the Layout panel (Firefox) is a visual representation of the element's box model:

```
┌─────────────────────── margin ──────────────────────────┐
│  ┌────────────────────── border ─────────────────────┐  │
│  │  ┌──────────────────── padding ─────────────────┐ │  │
│  │  │                                              │ │  │
│  │  │              content (width × height)        │ │  │
│  │  │                                              │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

Hover over each zone to highlight it in the viewport. Click a value to edit it in place.

---

## Forcing Element States

Some styles only apply in states that are hard to maintain (`:hover`, `:focus`, `:active`). Force these states in DevTools:

1. Select the element
2. Click the `:hov` button at the top of the Styles tab
3. Check `:hover`, `:focus`, `:active`, `:visited`, or `:focus-within`

The element behaves as if it is in that state permanently — you can inspect the hover styles without holding your mouse over it.

---

## Editing CSS Live

Click any property value in the Styles tab to edit it. Press Tab to move to the next property. Press Enter to apply. Press Escape to cancel.

**Add new properties:** Click at the end of any declaration block — a new property field appears.

**Disable/enable a property:** Click the checkbox next to a declaration.

> **💡 Tip:** Use the arrow keys on a numeric value to increment/decrement it: ↑ by 1, Shift+↑ by 10, Alt+↑ (Option+↑ on Mac) by 0.1.

---

## Key Takeaways

- The Elements panel shows the live DOM, not the raw HTML source.
- Struck-through declarations in the Styles tab are overridden — look above them for the winning rule.
- The Computed tab shows final resolved values — use it for `em`/`rem` calculations and debugging inheritance.
- The Box Model visualizer shows every spacing layer visually — hover to highlight in the viewport.
- Force element states (`:hover`, `:focus`) with the `:hov` button to inspect state-specific styles without user interaction.

---

## Challenge: CSS Detective

Go to any live website you find visually interesting. Using only the Elements panel:

1. Find a heading element and identify the exact `font-size` (in `px`) using the Computed tab
2. Find a CSS rule that is being overridden (struck through) and explain which rule is winning and why
3. Force a button's `:hover` state and screenshot the hover styles
4. Find an element where `box-sizing: border-box` is set and verify the difference in the Box Model visualizer
5. Make a visible live edit: change a color, font size, or layout property to something obviously different

---

## Research Questions

> **🔬 Research Question:** What is the "Accessibility" tab or pane in DevTools? What does it show about an element's accessible name, role, and state?

> **🔬 Research Question:** How do you use the CSS Grid and Flexbox inspectors in Chrome/Firefox DevTools? What visual overlays do they provide, and how do they help debug alignment issues?

## Optional Resources

- [Chrome DevTools — Elements panel](https://developer.chrome.com/docs/devtools/elements/)
- [Firefox DevTools — Examine and edit HTML](https://firefox-source-docs.mozilla.org/devtools-user/page_inspector/how_to/examine_and_edit_html/index.html)
