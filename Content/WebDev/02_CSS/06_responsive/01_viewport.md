---
title: "The Viewport & Meta Tag"
lesson_plan: "CSS — Responsive Design"
order: 1
duration_minutes: 15
sidebar_position: 1
tags:
  - css
  - responsive
  - viewport
  - meta-tag
  - mobile
---

# The Viewport & Meta Tag

> **Lesson Summary:** Before CSS responsive techniques can work, the browser must be told to use the device's actual pixel width — not simulate a desktop. That job belongs to a single HTML `<meta>` tag. Without it, even a perfectly written responsive stylesheet looks wrong on a phone.

## What Is the Viewport?

The **viewport** is the visible area of the browser window. On a desktop browser, it equals the window width. On a mobile device, it is the width of the screen.

**The problem without the viewport meta tag:** Mobile browsers historically rendered pages at approximately 980px wide (simulating a desktop) and then scaled the entire render down to fit the screen. This made desktop-era websites look readable but tiny. But it completely breaks responsive designs — your media queries are comparing against 980px, not the actual 375px screen width.

---

## The Viewport Meta Tag

Add this to `<head>` on every page:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

| Attribute | Value | Meaning |
| :--- | :--- | :--- |
| `width` | `device-width` | Use the actual device pixel width as the viewport width |
| `initial-scale` | `1` | Start at 1:1 zoom — don't scale to fit |

With this tag, a 375px-wide iPhone renders at 375px. Your `@media (max-width: 768px)` breakpoints will fire correctly.

```html
<!-- Complete minimal responsive <head> -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>My Page</title>
  <link rel="stylesheet" href="style.css" />
</head>
```

---

## What to Avoid

```html
<!-- ❌ Prevents user zoom — accessibility violation -->
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

<!-- ❌ Prevents user zoom — same problem -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
```

Never disable user zoom. Many users (including low-vision users who don't use separate assistive tech) rely on pinch-zoom to read content. Disabling it is an accessibility failure and violated WCAG 1.4.4.

---

## CSS Viewport Units

Once the viewport is correctly configured, CSS viewport units are accurate:

```css
/* Relative to the viewport dimensions */
width: 100vw;      /* 100% of viewport width */
height: 100vh;     /* 100% of viewport height */
width: 50vw;       /* 50% of viewport width */
min-height: 100vh; /* At least full screen height — common for full-page sections */

/* Modern dynamic viewport units (for mobile browser chrome) */
height: 100dvh;    /* Dynamic — accounts for mobile browser toolbar appearing/disappearing */
height: 100svh;    /* Small viewport — assumes toolbar is visible (most conservative) */
height: 100lvh;    /* Large viewport — assumes toolbar is hidden */
```

> **💡 Tip:** Use `100dvh` for full-page hero sections on mobile. The old `100vh` notoriously caused issues on iOS Safari because it didn't account for the browser chrome height.

---

## Key Takeaways

- The viewport meta tag is mandatory for responsive design — without it, mobile browsers simulate a desktop viewport.
- `width=device-width` = use the actual screen width. `initial-scale=1` = start at 1:1 zoom.
- Never add `user-scalable=no` or `maximum-scale=1` — disabling zoom violates accessibility standards.
- Use `100dvh` instead of `100vh` for full-height sections to handle mobile browser chrome correctly.

## Research Questions

> **🔬 Research Question:** What are "CSS pixels" vs "device pixels"? What is the `devicePixelRatio` and why is it not 1:1 on Retina/HiDPI screens?
>
> *Hint: Search "CSS pixels vs device pixels devicePixelRatio MDN" and "Retina display CSS pixel".*

> **🔬 Research Question:** What is the difference between `100vw` and `100%` width on a block element? Hint: consider the scrollbar.
>
> *Hint: Search "CSS 100vw vs 100% horizontal scroll scrollbar width".*
