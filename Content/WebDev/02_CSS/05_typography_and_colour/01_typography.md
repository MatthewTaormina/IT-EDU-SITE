---
title: "Typography"
lesson_plan: "CSS — Typography & Colour"
order: 1
duration_minutes: 20
sidebar_position: 1
tags:
  - css
  - typography
  - font-family
  - font-size
  - line-height
  - google-fonts
  - rem
---

# Typography

> **Lesson Summary:** Typography is the arrangement of text to make it readable, legible, and visually appealing. In CSS, this means choosing fonts, setting sizes, managing line length, and controlling vertical rhythm. This lesson covers every significant typographic property, with practical values used in real projects.

## `font-family` — Choosing Typefaces

```css
/* Font stack: browser tries each in order; falls back if unavailable */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Serif stack */
font-family: 'Georgia', 'Times New Roman', serif;

/* Monospace stack */
font-family: 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
```

**Font stacks** always end with a generic family (`sans-serif`, `serif`, `monospace`, `cursive`, `fantasy`) — the browser's ultimate fallback.

### Loading Google Fonts

```html
<!-- In <head> — load before the stylesheet -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
```

```css
body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

`display=swap` uses the fallback font while Inter loads, then swaps — preventing invisible text during load.

> **⚠️ Warning:** Every font weight you load is a separate network request. `wght@400;500;700` loads regular, medium, and bold. Avoid loading weights you don't use — each adds to page load time.

---

## `font-size` — Setting Type Scale

```css
/* Root size — everything else relative to this */
html { font-size: 16px; }   /* Browser default; set explicitly for predictability */

/* Absolute units (avoid for body text — don't respect user preferences) */
font-size: 16px;

/* rem — relative to root font size */
font-size: 1rem;     /* = 16px if root is 16px */
font-size: 1.5rem;   /* = 24px */
font-size: 2rem;     /* = 32px */

/* em — relative to parent font size */
font-size: 1.25em;   /* 25% larger than parent element */

/* % — relative to parent font size */
font-size: 90%;
```

**Use `rem` for all font sizes.** It's predictable (relative to root, not parent), and it respects user browser preferences for text size — important for accessibility.

### A Practical Type Scale

```css
:root {
  --text-xs:   0.75rem;   /*  12px */
  --text-sm:   0.875rem;  /*  14px */
  --text-base: 1rem;      /*  16px */
  --text-lg:   1.125rem;  /*  18px */
  --text-xl:   1.25rem;   /*  20px */
  --text-2xl:  1.5rem;    /*  24px */
  --text-3xl:  1.875rem;  /*  30px */
  --text-4xl:  2.25rem;   /*  36px */
}
```

---

## `font-weight` — Thickness

```css
font-weight: 400;   /* normal */
font-weight: 500;   /* medium */
font-weight: 600;   /* semibold */
font-weight: 700;   /* bold */
font-weight: 800;   /* extrabold */

font-weight: normal; /* keyword: 400 */
font-weight: bold;   /* keyword: 700 */
```

Only use weights that are actually loaded in your font stack — an unloaded weight falls back, often looking identical to the nearest available weight.

---

## `line-height` — Vertical Spacing Between Lines

```css
/* Unitless values are preferred — relative to the element's own font size */
line-height: 1.5;    /* 150% of element's font-size — good for body text */
line-height: 1.2;    /* Tighter — good for headings */
line-height: 1.7;    /* Looser — good for long-form body text */

/* Avoid units for line-height — em and px don't inherit correctly */
/* ✅ */ line-height: 1.5;
/* ❌ */ line-height: 1.5em;  /* Can cause unexpected inheritance */
```

---

## `letter-spacing` and `word-spacing`

```css
letter-spacing: 0.05em;    /* Slightly expanded — good for uppercase labels */
letter-spacing: -0.02em;   /* Slightly condensed — good for large headings */
word-spacing: 0.1em;       /* Expand space between words */
```

---

## `text-transform`

```css
text-transform: uppercase;   /* ALL CAPS */
text-transform: lowercase;   /* all lowercase */
text-transform: capitalize;  /* First Letter Of Each Word */
text-transform: none;        /* Default */
```

---

## `text-decoration`

```css
text-decoration: none;           /* Remove underline from links */
text-decoration: underline;
text-decoration: line-through;   /* Strikethrough */
text-decoration-color: #3b82f6;  /* Colour the decoration independently */
text-decoration-thickness: 2px;
text-underline-offset: 3px;      /* Gap between text and underline */
```

---

## Readable Prose — Key Properties Combined

```css
body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #1e293b;
}

h1, h2, h3 {
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

p {
  max-width: 65ch;  /* ch = width of '0' character — limits line length for readability */
  margin-bottom: 1.25em;
}
```

`max-width: 65ch` — limiting prose to 60–70 characters per line dramatically improves readability.

---

## Key Takeaways

- Font stacks always end with a generic family (`sans-serif`, `serif`, `monospace`).
- Use `rem` for font sizes — predictable, accessible, respects user preferences.
- `line-height` should be unitless — `1.5` for body, `1.2` for headings.
- `letter-spacing: -0.02em` on large headings looks significantly more professional.
- `max-width: 65ch` on paragraphs is one of the most impactful readability improvements.

## Research Questions

> **🔬 Research Question:** What is a variable font (also called a "web font" with axis variations)? How does `font-variation-settings` work, and what does `wght` axis allow you to do?
>
> *Hint: Search "CSS variable fonts wght axis MDN" and "Google Fonts variable font Inter".*

> **🔬 Research Question:** What does `font-display: swap` do in a `@font-face` declaration? What are the other values (`block`, `optional`, `fallback`) and when would you choose each?
>
> *Hint: Search "CSS font-display swap block optional fallback MDN" and "font loading performance".*
