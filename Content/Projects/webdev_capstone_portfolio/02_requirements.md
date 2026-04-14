---
title: "Technical Requirements & Acceptance Criteria"
lesson_plan: "WebDev Basics — Capstone"
---

# Technical Requirements & Acceptance Criteria

> This is the full technical specification. Your project must meet every item in the Acceptance Criteria checklist before it is considered complete.

---

## Project Structure

You must deliver exactly the following file structure. No more, no less.

```
portfolio/
├── index.html      ← all HTML
├── style.css       ← all CSS (external file, linked from <head>)
├── app.js          ← all JavaScript (external file, loaded with defer)
└── README.md       ← project notes (see below)
```

**No exceptions:**
- No inline `<style>` blocks (except the tiny `<meta>` theme-color — that's fine)
- No inline `style="..."` attributes (except values your JavaScript sets dynamically)
- No `<script>` tags in the middle of the HTML body
- No external CSS frameworks (Bootstrap, Tailwind, etc.)
- No JavaScript libraries (jQuery, etc.)

---

## HTML Requirements

| Req | Requirement |
| :-- | :-- |
| `H-01` | The document must use `<!DOCTYPE html>` and `lang="en"` |
| `H-02` | `<head>` must contain a meaningful `<title>`, `<meta charset="UTF-8">`, and `<meta name="viewport" content="width=device-width, initial-scale=1.0">` |
| `H-03` | All six sections must use the appropriate semantic element: `<header>`, `<nav>`, `<section>`, or `<footer>` |
| `H-04` | Each section must have a unique `id` attribute for anchor navigation: `#about`, `#projects`, `#skills`, `#contact` |
| `H-05` | Every `<img>` must have a descriptive `alt` attribute |
| `H-06` | The contact form must use `<form>`, `<label>`, and `<input>` / `<textarea>` elements with matching `for` and `id` attributes |
| `H-07` | The page must have exactly one `<h1>` element (Maya's name in the hero) |
| `H-08` | Section headings use `<h2>`; card titles use `<h3>` |
| `H-09` | Project links must open in a new tab (`target="_blank"`) and include `rel="noopener noreferrer"` |
| `H-10` | The hamburger button must have `aria-label="Toggle navigation"` and `aria-expanded` managed by JavaScript |

---

## CSS Requirements

| Req | Requirement |
| :-- | :-- |
| `C-01` | All styles must be in `style.css` — no inline styles, no `<style>` blocks |
| `C-02` | CSS custom properties (variables) must be used for colours and/or font sizes, defined on `:root` |
| `C-03` | The navigation must be `position: sticky; top: 0` so it stays visible on scroll |
| `C-04` | The Projects section must use CSS Grid or Flexbox to lay out the three cards |
| `C-05` | The About section must use Flexbox or Grid for the two-column layout |
| `C-06` | Use **one breakpoint at 768px**. Below 768px = mobile layout. At 768px and above = desktop layout. The range 768px–1023px (tablets) uses the desktop layout — it will naturally compress; no third layout is needed for this project. |
| `C-07` | The site must work without horizontal scrolling at 375px, 768px, and 1280px viewport widths |
| `C-08` | The hamburger menu icon and the full nav links must each only appear at their respective breakpoints — not both at once |
| `C-09` | Focus styles must be visible on all interactive elements (do not `outline: none` without a replacement) |
| `C-10` | Body text must have a minimum contrast ratio of 4.5:1 against its background |
| `C-11` | A Google Font must be loaded and applied as the body font |

---

## JavaScript Requirements

| Req | Requirement |
| :-- | :-- |
| `J-01` | All JavaScript must be in `app.js`, loaded with `<script src="app.js" defer>` in `<head>` |
| `J-02` | The hamburger button must toggle the mobile navigation open and closed on click |
| `J-03` | The hamburger button must update `aria-expanded` on the `<button>` element: `"true"` when open, `"false"` when closed |
| `J-04` | Clicking a nav link while the mobile menu is open must close the menu |
| `J-05` | The "View My Work" hero button must scroll smoothly to `#projects` |
| `J-06` | The "Contact Me" hero button must scroll smoothly to `#contact` |
| `J-07` | The contact form must be validated with JavaScript before submission |
| `J-08` | Validation must check: Name is not empty; Email matches a valid email format (use regex); Message is not empty |
| `J-09` | If validation fails, an error message must appear next to the relevant field — **the form must not submit** |
| `J-10` | If validation passes, hide the form and display a success message in its place — **do not reload the page** (`event.preventDefault()`) |
| `J-11` | Error messages must be cleared when the user starts typing in the field again |
| `J-12` | No `alert()`, `confirm()`, or `prompt()` dialogs — all feedback must be in-page |

---

## Acceptance Criteria Checklist

When you believe your project is complete, go through this checklist. Every item must be ticked before you consider it done.

### Structure & Code Quality

- [ ] Files are named exactly: `index.html`, `style.css`, `app.js`, `README.md`
- [ ] No inline styles on any HTML element (except dynamically set by JS)
- [ ] No external frameworks or libraries loaded
- [ ] HTML validates with no errors at [validator.w3.org](https://validator.w3.org/)
- [ ] CSS validates with no errors at [jigsaw.w3.org/css-validator](https://jigsaw.w3.org/css-validator/)
- [ ] JavaScript console shows no errors on page load
- [ ] `README.md` includes: what you built, what you learned, any known issues

### Layout & Responsiveness

- [ ] All six sections (nav, hero, about, projects, skills, contact/footer) are present
- [ ] Nav is sticky — stays at top of viewport while scrolling
- [ ] About section is two-column on desktop, stacked on mobile
- [ ] Projects section shows three cards in a row on desktop, stacked on mobile
- [ ] No horizontal scroll bar appears at 375px or 768px viewport width
- [ ] Mobile nav links and desktop nav links are mutually exclusive (never both visible)

### Interactivity

- [ ] Hamburger icon appears only on mobile (<= 768px)
- [ ] Hamburger toggles the mobile nav open/closed on click
- [ ] `aria-expanded` on the hamburger button is updated correctly
- [ ] Clicking a mobile nav link closes the menu
- [ ] "View My Work" button scrolls to projects section
- [ ] "Contact Me" button scrolls to contact section
- [ ] All nav anchor links scroll to the correct section

### Contact Form Validation

- [ ] Submitting an empty form shows error messages on all three fields
- [ ] Submitting with an invalid email (e.g. `"not-an-email"`) shows an error on the email field
- [ ] Submitting with all fields correctly filled shows the success message
- [ ] The page does not reload on form submit
- [ ] No `alert()` dialogs are used for any validation feedback

### Accessibility & Quality

- [ ] Every `<img>` has a non-empty `alt` attribute
- [ ] All `<label>` elements are correctly associated with their `<input>` via `for`/`id`
- [ ] Focus is visible on nav links, buttons, and form fields when tabbing
- [ ] Project links open in a new tab with `rel="noopener noreferrer"`
- [ ] You can navigate the entire page using only a keyboard (Tab, Enter, Space)

---

## Hints (not solutions)

These hints point you to what you already know. They do not tell you the code.

| Challenge | Hint |
| :-- | :-- |
| Showing/hiding the mobile nav | Add/remove a CSS class with `classList.toggle()` — review [DOM Manipulation](../../Lessons/webdev_03_js_basics_05_the_dom_02_dom_manipulation.md) |
| Smooth scroll to a section | Look up `element.scrollIntoView({ behavior: "smooth" })` — or CSS `scroll-behavior: smooth` on `html` |
| Email format validation | You need a regular expression. A simple pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Showing error messages in-page | Create `<span>` elements near each field with a class like `.error-msg`; set their `textContent` and toggle a visible class |
| Hiding the form, showing success | Use `classList.add("hidden")` on the `<form>` and `classList.remove("hidden")` on a success `<div>` |
| Clearing errors on input | Use `addEventListener("input", ...)` on each field — review [Events](../../Lessons/webdev_03_js_basics_05_the_dom_03_events.md) |
| Preventing page reload | `event.preventDefault()` in the `submit` listener — review [Events](../../Lessons/webdev_03_js_basics_05_the_dom_03_events.md) |

---

## Stretch Goals

These are optional. Complete the acceptance criteria first.

- [ ] **Dark mode toggle** — a button in the nav that switches between light and dark themes using a class on `<html>` and CSS custom properties
- [ ] **Scroll-spy** — highlight the active nav link as the user scrolls past each section (requires `IntersectionObserver`)
- [ ] **Project filter** — add skill tags to each project card and a filter bar above the grid; clicking "Design" shows only design projects, etc.
- [ ] **Animated hero text** — the tagline types out character by character on page load using `setInterval`

---

## Submitting Your Work

When your project is complete:

1. Open `index.html` in your browser and run through the full acceptance criteria checklist above
2. Open DevTools → Console and confirm there are no errors
3. Resize the browser to 375px and verify mobile layout
4. Paste your HTML into the W3C validator and fix any errors
5. Zip your `portfolio/` folder and submit, or push it to a GitHub repository and share the link

> **Well done for getting this far.** Building a project from scratch with only a spec and your own knowledge is exactly what professional development feels like. The discomfort of not having a tutorial to follow is the skill you are developing.
