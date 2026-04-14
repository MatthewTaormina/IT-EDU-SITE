---
title: "Unit Review — CSS Transitions & Animations"
type: "review"
sidebar_position: 999
sidebar_label: "Review"
---

# Unit Review — CSS Transitions & Animations

> Work through this without looking back at the lessons. If you cannot answer a question, that is the lesson to revisit.

---

## What You Covered

| Lesson | Summary |
| :--- | :--- |
| Transitions | `transition` shorthand; transitioning specific properties; timing functions and easing curves; triggering transitions with state changes |
| Transforms | `translateX/Y/Z`, `scale`, `rotate`, `skew`; GPU compositor layer; combining transforms; `transform-origin` |
| Keyframe Animations | `@keyframes` syntax; `animation` shorthand; `animation-iteration-count`, `animation-direction`, `animation-fill-mode`; pausing with `animation-play-state` |
| Animation Accessibility | `prefers-reduced-motion` media query; WCAG 2.1 Success Criterion 2.3.3; patterns for providing reduced-motion alternatives |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **`transition`** | CSS shorthand that smoothly interpolates between two values of a property: `transition: property duration easing delay` |
| **Timing function** | The easing curve controlling the rate of change during a transition: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`, `cubic-bezier()` |
| **`transform`** | A CSS property applying geometric transformations without affecting document flow |
| **`translateX/Y`** | Moves an element along the X or Y axis by a length or percentage |
| **`scale()`** | Resizes an element proportionally (or non-proportionally with `scaleX`/`scaleY`) |
| **`rotate()`** | Rotates an element by an angle (`deg`, `turn`, `rad`) |
| **GPU compositor layer** | A rendering layer processed by the graphics card; `opacity` and `transform` animate here — no layout or paint cost |
| **`@keyframes`** | An at-rule defining the CSS values at each percentage step of an animation |
| **`animation`** | CSS shorthand applying a `@keyframes` animation to an element |
| **`animation-fill-mode`** | Controls styles before the animation starts (`backwards`) and after it ends (`forwards`, `both`) |
| **`prefers-reduced-motion`** | A CSS media feature detecting the user's OS-level "reduce motion" preference |

---

## Quick Check

1. Write the `transition` declaration that animates `opacity` and `transform` simultaneously, each over 300ms with an ease-out curve.

2. What is the performance advantage of animating `transform` and `opacity` over animating `width`, `height`, or `top`?

3. Write a `@keyframes` rule called `fadeInUp` that starts with `opacity: 0; transform: translateY(20px)` and ends with `opacity: 1; transform: translateY(0)`.

4. A card must only animate on hover — not on page load. Should you use `transition` or `@keyframes`? Why?

5. Write the `prefers-reduced-motion` media query that sets `--duration: 0s` and `--delay: 0s` for all animations.

6. What does `animation-fill-mode: both` do? Give a concrete scenario where it matters.

7. Why is `transform: translateY(-4px)` preferred over `position: relative; top: -4px` for a hover lift effect?

---

## Common Misconceptions

**"Transitions and animations do the same thing."**
Transitions react to a state change (`:hover`, class toggle) — they have a start and an end state defined elsewhere. Animations (`@keyframes`) run independently of state changes and can loop, reverse, and define intermediate steps.

**"You need JavaScript to animate on scroll."**
The Intersection Observer API (covered in Unit 03) combined with a CSS class toggle and `@keyframes` or `transition` produces scroll-triggered animations entirely without JavaScript animation libraries.

**"Disabling animation for `prefers-reduced-motion` means removing all motion."**
The WCAG guideline is to not *require* animation for understanding or to avoid animation that can trigger vestibular disorders. Subtle, slow fades are generally acceptable. The goal is to remove large-scale parallax, rapid flashing, and spinning — not all motion.

---

## What Comes Next

Unit 05 — DevTools will teach you to debug and inspect everything you have built. You will use the Elements panel to tweak `animation` and `transition` values live, and the Performance panel to verify your transforms are composited (not causing paint or layout).

---

## Further Reading

- [MDN — Using CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [MDN — Using CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [Josh W Comeau — An Interactive Guide to CSS Transitions](https://www.joshwcomeau.com/animation/css-transitions/) — Excellent visual explainer
- [Smashing Magazine — Designing With Reduced Motion For Motion Sensitivities](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/)
