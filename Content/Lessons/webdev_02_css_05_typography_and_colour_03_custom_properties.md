---
type: lesson
title: "Custom Properties"
description: "CSS custom properties (often called CSS variables) let you define a value once and reference it throughout a stylesheet. They are dynamic — they participate in the cascade and inheritance, change a..."
duration_minutes: 20
tags:
  - css
  - custom-properties
  - variables
  - theming
  - dark-mode
  - design-tokens
---

# Custom Properties

> **Lesson Summary:** CSS custom properties (often called CSS variables) let you define a value once and reference it throughout a stylesheet. They are dynamic — they participate in the cascade and inheritance, change at runtime, and are the foundation of any serious CSS design system. They are not the preprocessor variables you have seen in Sass; they are fundamentally different and more powerful.

![Diagram showing a custom property declared on :root and referenced by multiple components](../../../../Assets/Images/webdev/css/diagram_custom_properties.svg)

## Declaring Custom Properties

Custom properties start with `--` and are declared like any other property:

```css
:root {
  --color-brand: #3b82f6;
  --color-text: #1e293b;
  --color-surface: #ffffff;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --radius-sm: 4px;
  --radius-md: 8px;
  --font-base: 1rem;
}
```

`:root` is the `<html>` element — declaring here makes properties available everywhere.

---

## Using Custom Properties

Reference with `var()`:

```css
.btn {
  background: var(--color-brand);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: white;
}

.card {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
```

### Fallback Value

```css
/* If --color-brand is not defined, use #000 */
color: var(--color-brand, #000);

/* Fallback can be another custom property */
color: var(--color-accent, var(--color-brand, #3b82f6));
```

---

## Cascade and Inheritance

Unlike preprocessor variables, CSS custom properties **participate in the cascade and are inherited**:

```css
:root { --color-text: #1e293b; }

.dark-section {
  --color-text: #f8fafc;  /* Overrides for this element and all its children */
}

p { color: var(--color-text); }
/* p inside .dark-section: white */
/* p outside: dark */
```

This is the key advantage over preprocessor variables — the value resolves to what the cascade says at runtime, not at compile time.

---

## Dark Mode Theming

The most powerful CSS variables use case:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1e293b;
  --color-surface: #f8fafc;
  --color-brand: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-text: #f8fafc;
    --color-surface: #1e293b;
    --color-brand: #60a5fa;
  }
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

All components use the variables — none of them need to change when the theme switches. Only the `:root` values change.

You can also toggle theme with a class:

```css
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f8fafc;
}
```

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## Runtime Mutation with JavaScript

Custom properties can be read and set via JavaScript — static CSS cannot:

```javascript
const root = document.documentElement;

// Read
const brand = getComputedStyle(root).getPropertyValue('--color-brand');

// Write — all var(--color-brand) references update immediately
root.style.setProperty('--color-brand', '#ef4444');
```

This enables runtime theming, animated colour transitions, and user preference persistence without reloading the page.

---

## Custom Properties vs. Preprocessor Variables

| | CSS Custom Properties | Sass/Less Variables |
| :--- | :--- | :--- |
| Resolved | At runtime | At compile time |
| Cascade | Yes — inherit, override | No — static |
| Readable in JS | Yes | No (compiled away) |
| Dynamic updates | Yes | No |
| Browser support | All modern browsers | Requires build step |

---

## Key Takeaways

- Declare custom properties with `--name: value;` — typically on `:root`.
- Reference with `var(--name)` or `var(--name, fallback)`.
- Custom properties **inherit and cascade** — they can be scoped and overridden per element.
- Redeclaring on a parent element overrides for that element's entire subtree.
- The dark mode pattern: redefine `:root` variables inside `@media (prefers-color-scheme: dark)`.
- JavaScript can read and write custom properties for runtime theming.

## Research Questions

> **🔬 Research Question:** CSS custom properties can be used in `calc()`. How would you use a `--spacing-unit` variable to build a consistent spacing scale using multiplication?
>
> *Hint: Search "CSS custom properties calc() spacing scale" and "CSS calc var".*

> **🔬 Research Question:** What are "CSS Design Tokens" and how do custom properties implement them? What tools like Style Dictionary or Theo are used to manage design tokens at scale?
>
> *Hint: Search "CSS design tokens custom properties" and "Style Dictionary open-props".*
