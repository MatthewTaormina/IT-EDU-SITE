---
type: lesson
title: "Intersection Observer"
description: "Efficiently trigger JavaScript when elements enter or exit the viewport — for lazy-loading images, infinite scroll, and scroll-triggered animations — without scroll event listeners."
duration_minutes: 30
tags:
  - browser-apis
  - intersection-observer
  - lazy-loading
  - performance
  - animations
  - scroll
---

# Intersection Observer

> **Lesson Summary:** The Intersection Observer API detects when an element enters or exits the browser's viewport (or another element). It replaces scroll event listeners for lazy loading and scroll-triggered animations — it is far more performant because it runs off the main thread and does not fire on every scroll pixel.

---

## The Problem with Scroll Events

The traditional approach to lazy loading used a scroll listener:

```js
window.addEventListener('scroll', () => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      img.src = img.dataset.src; // load the image
    }
  });
});
```

This code runs on *every scroll event* — potentially dozens of times per second, calling `getBoundingClientRect()` on every unloaded image, which forces the browser to recalculate layout each time. On a page with 100 images, this is a serious performance problem.

**Intersection Observer** solves this by letting the browser notify you when visibility changes — not on every scroll tick.

---

## Creating an Intersection Observer

```js
const observer = new IntersectionObserver(callback, options);
```

- **`callback`** — a function called when observed elements' visibility changes
- **`options`** — configuration (root, rootMargin, threshold)

### The Callback

```js
const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // element is now visible
      console.log(entry.target, 'entered the viewport');
    }
  });
};
```

Each `entry` is an `IntersectionObserverEntry`:

| Property | Description |
| :--- | :--- |
| `entry.target` | The observed DOM element |
| `entry.isIntersecting` | `true` if the element is currently intersecting the root |
| `entry.intersectionRatio` | Fraction of the element currently visible (0–1) |
| `entry.boundingClientRect` | The element's bounding rectangle |
| `entry.rootBounds` | The root container's bounding rectangle |

---

## The Options Object

```js
const options = {
  root: null,          // null = viewport; or a scrollable container element
  rootMargin: '0px',   // expand/shrink the root's bounding box (like CSS margin)
  threshold: 0,        // 0 = fire when any pixel is visible; 1 = fire when fully visible
};
```

### `threshold` Examples

```js
threshold: 0       // fire when the element first enters the viewport (default)
threshold: 0.5     // fire when 50% of the element is visible
threshold: 1.0     // fire when 100% of the element is visible
threshold: [0, 0.25, 0.5, 0.75, 1] // fire at each of these ratios
```

### `rootMargin` for Preloading

Use a positive `rootMargin` to start loading before an element is actually visible:

```js
rootMargin: '200px 0px'
// Element is considered "intersecting" 200px before it enters the viewport
// Gives images time to load before the user scrolls to them
```

---

## Observing Elements

```js
observer.observe(element);    // start observing
observer.unobserve(element);  // stop observing this element
observer.disconnect();        // stop observing ALL elements
```

---

## Lazy Loading Images

The most common use case:

```html
<img data-src="photo.jpg" alt="Mountain landscape" class="lazy">
```

```js
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;       // load the real image
      img.classList.remove('lazy');
      observer.unobserve(img);         // stop watching — already loaded
    }
  });
}, {
  rootMargin: '200px', // start loading 200px before visible
});

document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
```

---

## Scroll-Triggered Animations

Add an `is-visible` class when an element enters the viewport, triggering a CSS animation:

```css
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .fade-in { transition: none; }
  .fade-in.is-visible { opacity: 1; transform: none; }
}
```

```js
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => animationObserver.observe(el));
```

---

## Infinite Scroll

Trigger loading more content when a sentinel element at the bottom of the list becomes visible:

```js
const sentinel = document.querySelector('#load-more-sentinel');
let currentPage = 1;

const sentinelObserver = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting) {
    currentPage++;
    const newItems = await fetchPage(currentPage);
    appendItems(newItems);

    if (newItems.length === 0) {
      sentinelObserver.disconnect(); // no more pages
    }
  }
});

sentinelObserver.observe(sentinel);
```

---

## Key Takeaways

- Intersection Observer fires a callback when observed elements enter or exit the viewport.
- It is far more performant than scroll event listeners — no forced layout recalculations.
- `threshold` controls when the callback fires (0 = any pixel; 1 = fully visible).
- `rootMargin` expands the effective "viewport" for preloading.
- Call `observer.unobserve(el)` after acting on an element if you only need the first trigger.
- Always pair scroll animations with `prefers-reduced-motion` media query.

---

## Challenge

Apply lazy loading and scroll-triggered animations to the GitHub search results from Unit 01:

1. Wrap each result card in a container with class `fade-in`
2. Use Intersection Observer to add `is-visible` to each card as it enters the viewport
3. Create a CSS transition for `.fade-in` → `.is-visible` (fade up from 20px below)
4. Add `prefers-reduced-motion` support
5. Add a "Load More" sentinel element that triggers the next page fetch when scrolled into view

---

## Research Questions

> **🔬 Research Question:** Does Intersection Observer work when elements are inside a scrollable `div` rather than the page body? What `root` option do you need to set?

> **🔬 Research Question:** What is the `ResizeObserver` API? How does it differ from Intersection Observer, and what is it used for?

## Optional Resources

- [MDN — Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Google Web Fundamentals — Lazy loading images](https://web.dev/articles/lazy-loading-images) — Covers both the Intersection Observer approach and the native `loading="lazy"` attribute
