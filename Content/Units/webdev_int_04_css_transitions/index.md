---
type: unit
title: "CSS Transitions & Animations"
description: "transition, transform, @keyframes, and animation — adding motion to interfaces without JavaScript, and doing it accessibly."
domain: "WebDev"
difficulty: "Intermediate"
estimated_hours: 4
tags:
  - css
  - transitions
  - animations
  - transforms
  - keyframes
  - accessibility
  - prefers-reduced-motion
prerequisites:
  - "CSS — Box Model, Flexbox, Grid, and Responsive Design (FrontEndBasic course)"
learning_objectives:
  - "Apply CSS transitions to animate property changes triggered by state"
  - "Use CSS transforms (translate, scale, rotate) for GPU-accelerated visual effects"
  - "Define keyframe animations with @keyframes and control them with the animation shorthand"
  - "Respect user motion preferences using the prefers-reduced-motion media query"
references:
  - type: lesson
    slug: webdev_int_04_css_transitions_01_transitions
  - type: lesson
    slug: webdev_int_04_css_transitions_02_transforms
  - type: lesson
    slug: webdev_int_04_css_transitions_03_animations
  - type: lesson
    slug: webdev_int_04_css_transitions_04_accessibility
---

# CSS Transitions & Animations

> **Unit Summary:** Motion is a core dimension of modern UI design — it communicates state changes, guides attention, and makes interfaces feel alive. This unit teaches you to add motion using only CSS, understand which properties are GPU-accelerated (and why it matters), and build animations that are respectful of users who prefer reduced motion.

## Learning Objectives

By the end of this unit, you will be able to:

- Apply CSS transitions to animate property changes triggered by state
- Use CSS transforms (`translate`, `scale`, `rotate`) for GPU-accelerated visual effects
- Define keyframe animations with `@keyframes` and control them with the `animation` shorthand
- Respect user motion preferences using the `prefers-reduced-motion` media query

## Prerequisites

- **CSS Basics** — comfortable with the box model, Flexbox, pseudo-classes (`:hover`, `:focus`), and custom properties

## Lessons in this Unit

1. [Transitions](../../Lessons/webdev_int_04_css_transitions_01_transitions.md)
2. [Transforms](../../Lessons/webdev_int_04_css_transitions_02_transforms.md)
3. [Keyframe Animations](../../Lessons/webdev_int_04_css_transitions_03_animations.md)
4. [Animation Accessibility](../../Lessons/webdev_int_04_css_transitions_04_accessibility.md)

## Core Terminology

**`transition`**
A CSS property that smoothly interpolates between two values of another property when that property changes. Triggered by state changes (`:hover`, class addition via JavaScript).

**`transform`**
A CSS property that applies geometric transformations — translate, scale, rotate, skew — to an element without affecting document flow. Runs on the GPU compositor layer.

**`@keyframes`**
An at-rule that defines the intermediate steps of a CSS animation, specifying styles at specific percentage points through the animation duration.

**`animation`**
A CSS shorthand property that applies a `@keyframes` animation to an element, controlling duration, delay, timing function, iteration count, and fill mode.

**GPU compositor layer**
A separate rendering layer processed by the graphics card. `opacity` and `transform` animate on this layer — they do not trigger layout or paint, making them highly performant.

**`prefers-reduced-motion`**
A CSS media query that detects whether the user has requested less motion in their system settings. An accessibility requirement for vestibular disorder and motion sensitivity users.

---

## Unit Challenge

Build an animated UI component library (no JavaScript — CSS only):

**Goal:** Create a single HTML file demonstrating four CSS animation patterns.

**Requirements:**
- **Card hover effect:** On `:hover`, the card lifts (`translateY(-4px)`) and casts a deeper shadow — using `transition`
- **Loading spinner:** A rotating circular indicator using `@keyframes` and `transform: rotate()`
- **Fade-in on load:** Three cards that fade and slide up sequentially on page load using `animation-delay`
- **Attention pulse:** A "New" badge that pulses its `box-shadow` using `@keyframes` and `animation: pulse 2s infinite`
- **Accessibility:** All animations are suppressed when `prefers-reduced-motion: reduce` is detected

**Success Criteria:**
- [ ] All four animations work correctly in Chrome and Firefox
- [ ] The loading spinner is a pure CSS circle (no `<img>`, no SVG)
- [ ] `prefers-reduced-motion: reduce` suppresses all animation (test in browser settings)
- [ ] No JavaScript used in the solution

> **💡 Hint:** Use `:root { --duration: 0.3s; }` and override to `--duration: 0s` inside the `prefers-reduced-motion` query for a clean single-point-of-control approach.

---

> **Unit Insight:** Good animation is invisible. Users should feel that the interface responds naturally — not notice that it is "animated." The goal is always clarity, never spectacle.
