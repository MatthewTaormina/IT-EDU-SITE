---
type: lesson
title: "Animation Accessibility"
description: "Build inclusive animations by respecting the prefers-reduced-motion media query and applying WCAG 2.1 Success Criterion 2.3.3 — Motion Actuation."
duration_minutes: 25
tags:
  - css
  - accessibility
  - animations
  - prefers-reduced-motion
  - wcag
  - vestibular
---

# Animation Accessibility

> **Lesson Summary:** For users with vestibular disorders, epilepsy, or motion sensitivity, excessive animation can cause nausea, disorientation, or seizures. The browser exposes a user preference — `prefers-reduced-motion` — that your CSS and JavaScript should respect. This lesson covers how to detect and honor that preference, and how to think about animation from an inclusive design perspective.

---

## The Problem

Approximately 35% of adults over 40 have some form of vestibular disorder. Large-scale parallax effects, spinning animations, and rapid transitions can trigger symptoms ranging from mild disorientation to severe nausea.

The WCAG 2.1 Success Criterion 2.3.3 (Level AAA) states that motion animation triggered by interaction can be disabled unless the animation is essential to the functionality.

Operating systems now expose a "Reduce Motion" preference:
- **macOS / iOS:** System Preferences → Accessibility → Reduce Motion
- **Windows:** Settings → Ease of Access → Display → Show animations in Windows (turn off)
- **Android:** Settings → Accessibility → Remove animations

---

## The `prefers-reduced-motion` Media Query

The browser exposes the user's OS setting via this media query:

```css
@media (prefers-reduced-motion: reduce) {
  /* styles for users who prefer less motion */
}
```

Two values:
- `no-preference` — the user has not requested reduced motion (or has not set a preference)
- `reduce` — the user has requested reduced motion

---

## Implementation Patterns

### Pattern 1: Override Animations Globally

Add this to your global stylesheet — it resets all animations and transitions for users who have opted in:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

> **💡 Tip:** `0.01ms` instead of `0` ensures that JavaScript `animationend` and `transitionend` events still fire (some UI logic depends on them). Setting to exactly `0` can break event-driven component logic.

### Pattern 2: Design Reduced-Motion Alternatives

Rather than removing animation entirely, provide a better alternative:

```css
/* Animated version for users who are OK with motion */
@keyframes slide-in-from-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

.notification {
  animation: slide-in-from-right 0.4s ease-out forwards;
}

/* Simplified version for reduced-motion users */
@media (prefers-reduced-motion: reduce) {
  .notification {
    animation: fade-in 0.3s ease-out forwards; /* simple fade instead */
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

This approach is better than a complete removal — the UI still communicates the appearance of a new element, just without the slide.

### Pattern 3: CSS Custom Properties Toggle

Use a custom property to centralize animation control:

```css
:root {
  --animation-duration: 0.4s;
  --transition-duration: 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-duration: 0s;
    --transition-duration: 0s;
  }
}

.card {
  transition: transform var(--transition-duration) ease-out;
}

.fade-in {
  animation: fadeInUp var(--animation-duration) ease-out both;
}
```

---

## Detecting in JavaScript

Use `matchMedia()` to check the preference from JavaScript:

```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReduced.matches) {
  // User prefers reduced motion — skip or simplify animations
  initWithoutAnimations();
} else {
  initWithAnimations();
}

// Respond to changes (user changes OS setting while page is open)
prefersReduced.addEventListener('change', (event) => {
  if (event.matches) {
    disableAnimations();
  } else {
    enableAnimations();
  }
});
```

This is important for JavaScript-driven animations (canvas, Web Animations API, GSAP):

```js
function animateCard(card) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    card.style.opacity = '1'; // just show it instantly
    return;
  }

  card.animate(
    [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 400, easing: 'ease-out', fill: 'forwards' }
  );
}
```

---

## What to Animate vs. What Not to

| 🟢 Generally safe | 🔴 Can cause problems |
| :--- | :--- |
| Simple fades (opacity) | Large-scale parallax scrolling |
| Short position transitions (< 500ms) | Rapidly flashing elements |
| Scale effects that are small (< 10%) | Spinning/orbiting elements |
| Loading indicators (if stoppable) | Auto-playing background videos with motion |
| Focus indicators | Zooming or camera movement effects |

---

## Essential vs. Decorative Animation

An animation is **essential** if removing it would destroy the functionality:
- A loading spinner that indicates async work is in progress → essential
- A card that slides in as decoration → not essential

WCAG does not require removing essential animations for `prefers-reduced-motion`. It requires that non-essential animation can be disabled.

---

## Key Takeaways

- `prefers-reduced-motion: reduce` indicates the user has opted for less motion in their OS settings.
- Use the global reset pattern (or custom property pattern) as a baseline in every project.
- Provide reduced-motion alternatives (simple fades) rather than simply disabling all animation.
- Check `window.matchMedia()` for JavaScript-driven animations.
- Animation is decorative by default — essential animation is the rare exception, not the rule.

---

## Challenge: Accessibility Audit

Revisit the animated card component from Lesson 3 (Keyframe Animations):

1. Add the global `prefers-reduced-motion: reduce` reset to your stylesheet
2. Verify that your cards no longer animate when your OS "Reduce Motion" setting is enabled (test in browser settings or via DevTools → Rendering → Emulate prefers-reduced-motion)
3. For the notification slide animation: replace the disabled slide with a simple `opacity` fade instead of no animation at all
4. For the infinite spinner: keep it running under reduced motion (loading state must still be communicated) but reduce its speed to half

---

## Research Questions

> **🔬 Research Question:** What is the Web Animations API (`element.animate(...)`)? How does it differ from CSS animations, and does `prefers-reduced-motion` automatically apply to Web Animations API animations?

> **🔬 Research Question:** WCAG 2.1 SC 2.3.1 is about "Three Flashes or Below Threshold." What is the specific technical definition, and why does it specifically mention photosensitive seizures?

## Optional Resources

- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Smashing Magazine — Designing With Reduced Motion For Motion Sensitivities](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/)
- [A List Apart — Designing Safer Web Animations for Motion Sensitivity](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)
