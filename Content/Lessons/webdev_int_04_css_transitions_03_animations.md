---
type: lesson
title: "Keyframe Animations"
description: "Define multi-step animations with @keyframes, control them with the animation shorthand, and create looping, reversing, and fill-mode animations."
duration_minutes: 35
tags:
  - css
  - animations
  - keyframes
  - animation-shorthand
  - fill-mode
---

# Keyframe Animations

> **Lesson Summary:** CSS keyframe animations let you define multi-step motion sequences with `@keyframes` and then apply them to elements with the `animation` property. Unlike transitions (which animate between two states), animations can have multiple intermediate states, loop, reverse, and play without any user interaction.

---

## Transitions vs. Animations

| Feature | `transition` | `@keyframes` + `animation` |
| :--- | :--- | :--- |
| Triggered by | State change (`:hover`, class toggle) | Automatically (or via class toggle) |
| Intermediate steps | No — just start and end | Yes — `0%`, `25%`, `50%`, etc. |
| Looping | No | Yes (`infinite`) |
| Reversing | Yes (on state exit) | Yes (`animation-direction: alternate`) |
| Best for | State-change feedback | Loading spinners, attention pulses, entrances |

---

## Defining Animations with `@keyframes`

An `@keyframes` rule defines the CSS values at each step of the animation:

```css
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

You can use percentage stops or the keywords `from` (0%) and `to` (100%):

```css
@keyframes pulse {
  from { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
  to   { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
}
```

Multiple intermediate steps:

```css
@keyframes bounce {
  0%   { transform: translateY(0); }
  40%  { transform: translateY(-20px); }
  60%  { transform: translateY(-10px); }
  80%  { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
```

---

## The `animation` Shorthand

```css
animation: name duration timing-function delay iteration-count direction fill-mode;
```

```css
.card {
  animation: fadeInUp 0.4s ease-out 0s 1 normal forwards;
}
```

The shorthand can be confusing — use the individual properties when any value is non-default:

| Property | Description | Example |
| :--- | :--- | :--- |
| `animation-name` | The `@keyframes` name | `fadeInUp` |
| `animation-duration` | How long one iteration takes | `0.4s` |
| `animation-timing-function` | Easing curve | `ease-out` |
| `animation-delay` | Wait before starting | `0.1s` |
| `animation-iteration-count` | Number of times to play | `1`, `infinite` |
| `animation-direction` | Play direction | `normal`, `reverse`, `alternate` |
| `animation-fill-mode` | Styles before/after the animation | `forwards`, `backwards`, `both` |
| `animation-play-state` | Running or paused | `running`, `paused` |

---

## `animation-fill-mode`

`fill-mode` solves a common problem: what styles apply before the animation starts and after it ends?

```css
@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

.panel {
  /* Without fill-mode, element flashes visible before and after the animation */
  animation: slideIn 0.3s ease-out forwards;
  /* forwards: after the animation ends, keep the styles from 100% (to) */
}
```

| Value | Behavior |
| :--- | :--- |
| `none` | Default — no fill outside the animation |
| `forwards` | After animation ends, keep the `to`/`100%` styles |
| `backwards` | Before animation starts, apply the `from`/`0%` styles (useful with delay) |
| `both` | Apply `forwards` AND `backwards` — usually what you want |

---

## `animation-iteration-count` and `animation-direction`

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

```css
.heartbeat {
  animation: scale-up 0.6s ease-in-out infinite alternate;
  /* alternate: plays forward, then backward, repeating */
}

@keyframes scale-up {
  to { transform: scale(1.2); }
}
```

---

## Sequential Animations with `animation-delay`

Stagger multiple elements by delaying each one:

```css
.card:nth-child(1) { animation: fadeInUp 0.4s ease-out both; }
.card:nth-child(2) { animation: fadeInUp 0.4s ease-out 0.1s both; }
.card:nth-child(3) { animation: fadeInUp 0.4s ease-out 0.2s both; }
.card:nth-child(4) { animation: fadeInUp 0.4s ease-out 0.3s both; }
```

With `animation-fill-mode: both` (or `backwards`), cards start invisible during their delay period — preventing a flash.

Using CSS custom properties for flexible staggering:

```css
.card {
  animation: fadeInUp 0.4s ease-out calc(var(--index, 0) * 0.1s) both;
}
```

```js
document.querySelectorAll('.card').forEach((card, i) => {
  card.style.setProperty('--index', i);
});
```

---

## Controlling Animations with JavaScript

```js
const el = document.querySelector('.spinner');

// Pause the animation
el.style.animationPlayState = 'paused';

// Resume it
el.style.animationPlayState = 'running';

// Restart by removing and re-adding the class
el.classList.remove('animated');
void el.offsetWidth; // force reflow to reset the animation
el.classList.add('animated');
```

---

## Key Takeaways

- `@keyframes` defines named animation steps with `0%`–`100%` (or `from`/`to`).
- The `animation` shorthand applies the animation: name, duration, timing, delay, iterations, direction, fill-mode.
- `animation-fill-mode: forwards` keeps final styles after the animation; `backwards` applies initial styles during the delay; `both` does both.
- `animation-iteration-count: infinite` with `animation-direction: alternate` creates seamless looping effects.
- Use CSS custom properties and `calc()` for declarative stagger delays.

---

## Challenge: Animated Notification System

Build a notification (toast) system:

1. A button that triggers a new notification
2. Each notification slides in from the right (`translateX(100%)` → `translateX(0)`)
3. After 3 seconds, the notification slides back out (`translateX(0)` → `translateX(100%)`) using a second animation or class
4. Notifications stack vertically; new ones appear below existing ones
5. Include a loading spinner on any notification with `type="loading"` using `animation: spin 0.8s linear infinite`

---

## Research Questions

> **🔬 Research Question:** Can you apply two different animations to the same element simultaneously? Try `animation: fadeIn 0.5s, spin 1s linear infinite`. Does it work?

> **🔬 Research Question:** What is the `animation-timeline` CSS property (Scroll-Driven Animations, now in modern browsers)? How does it connect a CSS animation's progress to the scroll position?

## Optional Resources

- [MDN — Using CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [Josh W Comeau — An Interactive Guide to CSS Keyframe Animations](https://www.joshwcomeau.com/animation/keyframe-animations/)
