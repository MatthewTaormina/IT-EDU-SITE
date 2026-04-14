---
title: "Accessibility Basics"
lesson_plan: "HTML"
order: 11
duration_minutes: 20
sidebar_position: 11
tags:
  - html
  - accessibility
  - a11y
  - aria
  - keyboard-navigation
  - screen-reader
  - contrast
---

# Accessibility Basics

> **Lesson Summary:** Accessibility is not a feature you add at the end — it is a quality of the HTML you write from the start. Most of what makes a page accessible is simply correct semantic HTML, properly associated labels, and intact keyboard focus. This lesson covers the essentials. A full unit on accessibility will go deeper — but what is here is not optional.

![A web page with keyboard focus rings, screen reader icon, and contrast swatches on a dark background](../../../Assets/Images/webdev/html/html_accessibility.png)

## Why Accessibility Is Not Optional

Roughly **16% of the world's population** lives with some form of disability (WHO estimate). Web content that is inaccessible excludes them from information, services, and opportunities.

Beyond the ethical case:
- Many jurisdictions have **legal requirements** for web accessibility (WCAG compliance, ADA, EAA)
- Accessible HTML is better HTML — semantic structure, clear labels, and keyboard support benefit *all* users
- Accessibility and SEO overlap significantly — the techniques that help screen readers also help search crawlers

> **💡 Tip:** The most powerful accessibility tool is not a library or an audit tool — it is **correct semantic HTML**. Use the right element for the right job and you get accessible behaviour for free.

---

## Screen Readers and the Accessibility Tree

A **screen reader** is software that reads content aloud to users who are blind or have low vision. It does not read your HTML or look at your page — it reads the **accessibility tree**: a parallel representation of the page that the browser extracts from the DOM, exposing roles, names, states, and properties.

```
DOM element: <button type="submit">Create Account</button>
Accessibility tree: role=button, name="Create Account", state=enabled
```

The browser derives the accessibility tree automatically from semantic HTML. When you use correct elements with correct labels, screen reader users get accurate information. When you build fake UI out of `<div>` + JavaScript, the accessibility tree is empty — and those users get nothing.

---

## Keyboard Navigation

Every interactive element on a page must be operable **without a mouse** — using only the keyboard:

| Key | Default behaviour |
| :--- | :--- |
| `Tab` | Move focus to the next interactive element |
| `Shift+Tab` | Move focus to the previous interactive element |
| `Enter` | Activate a link or button |
| `Space` | Activate a button or checkbox |
| Arrow keys | Navigate within a widget (select, radio group) |

Elements that are natively keyboard-focusable: `<a href>`, `<button>`, `<input>`, `<select>`, `<textarea>`.

`<div>`, `<span>`, `<p>` — not focusable by default. If you use one of these as a clickable element, keyboard users cannot reach it.

> **⚠️ Warning:** Never use a `<div>` or `<span>` as a clickable button. Use `<button>`. The `<button>` element is keyboard-focusable by default, announced as a button by screen readers, and activatable with Enter and Space. A `<div onclick>` is none of these things.

---

## Focus and Focus Styles

When a keyboard user tabs to an element, the browser shows a **focus indicator** — typically a coloured outline or ring around the element. This is how the user knows where they are on the page.

```css
/* ❌ Never do this — it destroys keyboard usability */
:focus {
  outline: none;
}
```

Removing the focus outline is one of the most common accessibility failures. If you dislike the default browser outline, replace it with your own visible style — don't remove it.

```css
/* ✅ Custom focus style — visible but styled */
:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

Use `:focus-visible` rather than `:focus` to apply the style only for keyboard/sequential navigation — not mouse clicks.

---

## `alt` Text (In Context)

Covered in [Lesson 05](./05_images_and_media.md), but worth restating the rule:

```html
<!-- Content image — describe what it shows -->
<img src="dom-tree.png" alt="A DOM tree with html at the root, branching into head and body" />

<!-- Decorative image — empty alt, not omitted -->
<img src="decorative-border.svg" alt="" />

<!-- Never this — screen reader reads the filename -->
<img src="dom-tree.png" />
```

---

## Label Associations (In Context)

Every form input must have a `<label>` associated via `for`/`id`:

```html
<!-- ✅ Correctly associated -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" />

<!-- ❌ Placeholder only — disappears on input, not a label -->
<input type="email" placeholder="Email address" />
```

When the association is correct, clicking the label focuses the input — a larger click target on mobile — and screen readers announce the label when the input receives focus.

---

## Colour Contrast

Text must have sufficient **contrast ratio** against its background so users with low vision or colour blindness can read it.

**WCAG AA minimums** (the legal standard in most jurisdictions):
- Normal text: **4.5:1** contrast ratio against its background
- Large text (18px+ or 14px+ bold): **3:1**
- UI components (borders, icons): **3:1**

How to check: use the **browser's accessibility inspector** (DevTools → Accessibility or Computed → Color Contrast), or tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

> **💡 Tip:** Light grey text on a white background — extremely common in modern design — almost always fails 4.5:1 contrast ratio. Check every colour combination you use.

---

## Tab Order

The order in which focus moves as the user presses `Tab` should match the **visual reading order** of the page. For most documents this is automatic — focus follows DOM order.

Problems arise when CSS positions elements out of their DOM order, or when `tabindex` is misused:

```html
<!-- tabindex="0" — adds an element to natural tab order -->
<div tabindex="0">This div is now focusable (prefer <button> instead)</div>

<!-- tabindex="-1" — removes from tab order; can still be focused by script -->
<div tabindex="-1">Focus me with JavaScript only</div>

<!-- tabindex > 0 — creates a custom tab order; avoid this -->
<!-- It overrides natural DOM order and is almost always wrong -->
<input tabindex="3" />
<input tabindex="1" />
<input tabindex="2" />
```

Rule: **never use positive `tabindex` values**. Reorder the DOM instead.

---

## ARIA — A Brief Introduction

**ARIA** (Accessible Rich Internet Applications) is a set of HTML attributes that add accessibility information to elements when HTML alone is insufficient:

```html
<!-- Tell a screen reader this div is a button -->
<div role="button" tabindex="0" aria-pressed="false">Toggle</div>

<!-- Label an element that has no visible text -->
<button aria-label="Close dialog">✕</button>

<!-- Connect a description to a form field -->
<input type="password" aria-describedby="pw-hint" />
<p id="pw-hint">Must be 8+ characters with a number and symbol.</p>
```

> **⚠️ Warning:** The first rule of ARIA is "don't use ARIA if an HTML element can do the job." `<button>` is always better than `<div role="button">`. ARIA supplements semantic HTML — it does not replace it. A full unit on accessibility will cover ARIA in depth; for now, know that it exists and what it is for.

---

## Key Takeaways

- Accessibility is not optional — ~16% of users have a disability, and many jurisdictions have legal requirements.
- The most powerful accessibility tool is **correct semantic HTML** — it builds the accessibility tree automatically.
- Every interactive element must be **keyboard-operable**: use `<a>`, `<button>`, `<input>`, not `<div onclick>`.
- **Never remove focus outlines** — replace them with a visible custom style using `:focus-visible`.
- `alt` text on images, `<label>` associations on form inputs — covered earlier in this unit, required for accessibility.
- Colour contrast must meet WCAG AA minimums: **4.5:1** for normal text.
- ARIA supplements semantic HTML when needed — it does not replace it.

## Research Questions

> **🔬 Research Question:** What are the four principles of WCAG (Web Content Accessibility Guidelines)? What do WCAG 2.1 AA and AAA mean, and what level is required by most legal standards?
>
> *Hint: Search "WCAG POUR principles" and "WCAG 2.1 AA legal requirement".*

> **🔬 Research Question:** What is a "skip nav" link, and why do keyboard and screen reader users depend on it? Where does it appear in the DOM, and how is it typically hidden visually but available on focus?
>
> *Hint: Search "skip navigation link accessibility" and "skip to main content HTML pattern".*
