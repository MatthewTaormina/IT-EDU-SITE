---
type: lesson
title: "CSS Transitions"
description: "Smoothly animate property changes triggered by state using the transition property — duration, timing functions, delays, and which properties can be transitioned."
duration_minutes: 30
tags:
  - css
  - transitions
  - animation
  - hover
  - easing
---

# CSS Transitions

> **Lesson Summary:** CSS transitions interpolate between two values of a CSS property when that property changes — triggered by a state change like `:hover`, `:focus`, or a JavaScript class toggle. This lesson covers the `transition` shorthand, timing functions, transitioning multiple properties, and which properties are safe to animate.

---

## What Is a Transition?

Without a transition, a state change is instant:

```css
.button {
  background-color: blue;
}

.button:hover {
  background-color: darkblue; /* instant — no animation */
}
```

With a transition, the change is animated:

```css
.button {
  background-color: blue;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: darkblue; /* animated over 0.3s */
}
```

The `transition` property is set on the **original state** (not the `:hover` state) so it applies both ways — on hover and on hover-out.

---

## The `transition` Shorthand

```css
transition: property duration timing-function delay;
```

| Part | Description | Example |
| :--- | :--- | :--- |
| `property` | Which CSS property to animate | `opacity`, `transform`, `all` |
| `duration` | How long the transition takes | `0.3s`, `300ms` |
| `timing-function` | The easing curve | `ease`, `ease-in-out`, `linear` |
| `delay` | Wait before starting | `0s`, `100ms` |

The duration is required; all other parts are optional (defaults: `ease`, `0s`).

---

## Timing Functions (Easing)

Timing functions control the rate of change through the transition:

| Value | Behavior |
| :--- | :--- |
| `ease` | Starts fast, slows down at the end (default) |
| `linear` | Constant rate throughout |
| `ease-in` | Starts slow, accelerates |
| `ease-out` | Starts fast, decelerates |
| `ease-in-out` | Slow start and end, fast middle |
| `cubic-bezier(x1, y1, x2, y2)` | Custom curve |

For UI interactions, `ease-out` typically feels the most natural — things arrive quickly and decelerate gently, like objects in the real world.

> **💡 Tip:** Use [easings.net](https://easings.net/) to visualize and copy `cubic-bezier()` values for any easing curve you can imagine.

---

## Transitioning Multiple Properties

Comma-separate multiple transitions:

```css
.card {
  transition:
    transform 0.3s ease-out,
    box-shadow 0.3s ease-out,
    opacity 0.2s ease;
}
```

Using `transition: all 0.3s ease` transitions every animatable property — this is convenient but can have unintended side effects (e.g., animating `height: auto` is problematic).

> **⚠️ Warning:** Avoid `transition: all`. It animates everything that changes, including layout properties you may not want to animate. Explicitly list the properties you want to animate.

---

## Performance: Which Properties to Animate

Not all CSS properties are equal. Changing some properties triggers layout recalculation (expensive); others only trigger compositing (cheap).

| Category | Properties | Cost |
| :--- | :--- | :--- |
| 🟢 **Compositor** | `opacity`, `transform` | Cheapest — runs on the GPU, no layout or paint |
| 🟡 **Paint** | `color`, `background-color`, `box-shadow`, `border` | Moderate — repaints but no layout |
| 🔴 **Layout** | `width`, `height`, `margin`, `padding`, `top`, `left` | Expensive — recalculates the position of elements |

**Rule:** Animate `transform` and `opacity` whenever possible. If you need a lift effect, use `transform: translateY(-4px)` instead of `margin-top: -4px`.

---

## Common UI Transition Patterns

### Hover Lift (Card)

```css
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
```

### Fade on Focus (Input)

```css
.input {
  border-color: #d1d5db;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
```

### Dropdown Reveal

```css
.dropdown {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease,
    transform 0.2s ease;
}

.dropdown.is-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

> **⚠️ Warning:** Do not use `display: none` ↔ `display: block` in transitions — transitions cannot animate between `display` values. Use `opacity` + `visibility` instead. `visibility: hidden` makes the element invisible and non-interactive; `visibility: visible` shows it. Opacity alone keeps the element interactive even when invisible.

---

## JavaScript-Triggered Transitions

Transitions work with any CSS change — including JavaScript class toggles:

```js
const dropdown = document.getElementById('dropdown');

document.getElementById('menu-button').addEventListener('click', () => {
  dropdown.classList.toggle('is-open');
});
```

The CSS transition kicks in automatically when the class is added or removed.

---

## Key Takeaways

- `transition: property duration timing-function delay` — set on the base state, not the hover/active state.
- `ease-out` feels most natural for most UI interactions.
- Animate `transform` and `opacity` — they are GPU-composited and never trigger layout.
- Avoid `transition: all` — it animates unintended properties.
- Use `opacity` + `visibility` to hide/show with transitions; never use `display: none`.

---

## Challenge: UI Component Polish Pass

Take a static HTML page (your portfolio or any previous project) and add transitions to three elements:

1. **Navigation links** — `color` fade on `:hover` and `::after` underline expand
2. **Cards/items** — lift effect (`translateY`) + box-shadow on `:hover`
3. **A button** — background-color and scale change on `:hover` and `:active`

All transitions must use `transform` or `opacity` for the primary effect.

---

## Research Questions

> **🔬 Research Question:** Can you transition `height: auto` to a specific pixel value with CSS alone? What workaround exists for animated expandable sections, and what is the `max-height` trick? What are its limitations?

> **🔬 Research Question:** What is the `will-change` CSS property? When should you use it, and why can overusing it actually hurt performance?

## Optional Resources

- [Josh W Comeau — An Interactive Guide to CSS Transitions](https://www.joshwcomeau.com/animation/css-transitions/) — The best visual explainer for transitions
- [Easings.net](https://easings.net/) — Visual cubic-bezier reference
