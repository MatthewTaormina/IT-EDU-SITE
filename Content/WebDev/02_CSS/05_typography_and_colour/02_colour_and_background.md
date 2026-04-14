---
title: "Colour & Background"
lesson_plan: "CSS — Typography & Colour"
order: 2
duration_minutes: 20
sidebar_position: 2
tags:
  - css
  - colour
  - background
  - hex
  - rgb
  - hsl
  - gradient
  - opacity
---

# Colour & Background

> **Lesson Summary:** CSS has five colour syntaxes, several background properties, and a gradient system that can produce almost any smooth transition. Understanding HSL in particular will make choosing and adjusting colours dramatically faster than hex guessing.

## Colour Syntaxes

```css
/* Named colours — limited, avoid in production */
color: red;
color: white;

/* Hex — most common; 3-digit is shorthand for 6-digit */
color: #3b82f6;
color: #38f;          /* shorthand — same as #3388ff */
color: #3b82f680;     /* 8-digit hex: last two digits = opacity (128/255 ≈ 50%) */

/* RGB */
color: rgb(59, 130, 246);
color: rgb(59 130 246 / 0.5);   /* modern syntax with opacity */

/* HSL — Hue (0–360°), Saturation (%), Lightness (%) */
color: hsl(217, 91%, 60%);
color: hsl(217 91% 60% / 0.5);  /* with opacity */

/* OKLCH — perceptually uniform, future-proof */
color: oklch(60% 0.2 250);
```

### Why HSL Is Better for Development

With hex, guessing adjusted colours requires a colour picker. With HSL:
- `hsl(217, 91%, 60%)` — blue
- `hsl(217, 91%, 40%)` — darker blue (just change lightness)
- `hsl(217, 91%, 80%)` — lighter blue
- `hsl(217, 40%, 60%)` — desaturated blue

You can build an entire colour palette by varying one or two axes.

---

## `color` and `opacity`

```css
color: #1e293b;           /* Text colour — also affects currentColor */
opacity: 0.5;             /* Entire element (including children) becomes 50% transparent */

/* Prefer per-property opacity over element-level opacity */
background-color: rgb(59 130 246 / 0.2);  /* Only affects the background */
```

> **⚠️ Warning:** `opacity` affects the entire element including all its children. If you only want a semi-transparent background, use `background-color: rgb(R G B / 0.5)` instead.

---

## `background-color`

```css
background-color: #f8fafc;
background-color: transparent;
background-color: hsl(217 91% 60% / 0.1);  /* Tinted background */
```

---

## `background-image`

```css
/* Image */
background-image: url('hero.jpg');
background-size: cover;          /* Fills the element, may crop */
background-size: contain;        /* Fits within the element, may letterbox */
background-position: center;     /* center | top | bottom | left | right | 50% 50% */
background-repeat: no-repeat;    /* no-repeat | repeat | repeat-x | repeat-y */
background-attachment: scroll;   /* scroll | fixed (parallax) */
```

### Background shorthand

```css
/* url position/size repeat attachment color */
background: url('hero.jpg') center / cover no-repeat #0f172a;
```

---

## Gradients

CSS gradients are generated images — they are used as `background-image` values:

```css
/* Linear gradient */
background: linear-gradient(135deg, #3b82f6, #8b5cf6);
background: linear-gradient(to right, #0f172a, #1e3a8a);

/* Multiple colour stops */
background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%);

/* Radial gradient */
background: radial-gradient(circle, #1e3a5f, #0f172a);
background: radial-gradient(ellipse at top, #3b82f6, transparent);

/* Conic gradient */
background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);

/* Multiple backgrounds — first listed is on top */
background:
  linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
  url('hero.jpg') center / cover no-repeat;
```

---

## `currentColor`

`currentColor` is a special keyword that references the element's current `color` value. Useful for icons and borders that should match text:

```css
.btn {
  color: #3b82f6;
  border: 2px solid currentColor;  /* border is always the same colour as text */
}

.icon {
  fill: currentColor;  /* SVG fill matches surrounding text colour */
}
```

---

## Key Takeaways

- HSL colour syntax gives intuitive control over lightness and saturation — much easier to adjust than hex.
- `opacity` affects the entire element including children — use per-property alpha instead.
- Gradients are `background-image` values — they can layer with actual images.
- Multiple `background` layers are comma-separated — first listed is rendered on top.
- `currentColor` makes icons and borders inherit the text colour automatically.

## Research Questions

> **🔬 Research Question:** What is OKLCH and how does it differ from HSL? Why is it considered "perceptually uniform" and why are some browsers and design tools moving toward it?
>
> *Hint: Search "CSS OKLCH color space MDN" and "OKLCH vs HSL perceptual uniformity".*

> **🔬 Research Question:** What is the CSS `mix-blend-mode` property? How does it let you layer elements with Photoshop-like blending modes?
>
> *Hint: Search "CSS mix-blend-mode MDN" and "CSS multiply screen overlay blend mode".*
