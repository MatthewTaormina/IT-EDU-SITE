---
type: unit
title: "Browser DevTools"
description: "The Elements panel, Console, Network tab, Sources debugger, and Performance panel — your primary environment for debugging HTML, CSS, JavaScript, and network issues."
domain: "WebDev"
difficulty: "Intermediate"
estimated_hours: 4
tags:
  - devtools
  - debugging
  - network
  - performance
  - chrome
  - firefox
prerequisites:
  - "Asynchronous JavaScript (Unit 01 of this course) — Network panel coverage requires knowledge of HTTP requests"
learning_objectives:
  - "Inspect and live-edit HTML and CSS in the Elements panel"
  - "Use the Console to log, inspect, and execute JavaScript"
  - "Analyze HTTP requests in the Network panel, including timing and response inspection"
  - "Set breakpoints, step through code, and inspect variables in the Sources panel debugger"
references:
  - type: lesson
    slug: webdev_int_05_devtools_01_elements_panel
  - type: lesson
    slug: webdev_int_05_devtools_02_console
  - type: lesson
    slug: webdev_int_05_devtools_03_network_panel
  - type: lesson
    slug: webdev_int_05_devtools_04_sources_and_debugger
---

# Browser DevTools

> **Unit Summary:** Browser developer tools are the single most powerful learning and debugging environment available to a front-end developer. Every professional web developer lives in DevTools. This unit teaches you to use them fluently — inspecting elements, debugging JavaScript, analyzing network requests, and profiling performance.

## Learning Objectives

By the end of this unit, you will be able to:

- Inspect and live-edit HTML and CSS in the Elements panel
- Use the Console to log, inspect, and execute JavaScript
- Analyze HTTP requests in the Network panel, including timing and response inspection
- Set breakpoints, step through code, and inspect variables in the Sources panel debugger

## Prerequisites

- **Asynchronous JavaScript** — Unit 01 of this course; the Network panel lesson requires understanding of HTTP requests and responses

## Lessons in this Unit

1. [The Elements Panel](../../Lessons/webdev_int_05_devtools_01_elements_panel.md)
2. [The Console](../../Lessons/webdev_int_05_devtools_02_console.md)
3. [The Network Panel](../../Lessons/webdev_int_05_devtools_03_network_panel.md)
4. [The Sources Panel & Debugger](../../Lessons/webdev_int_05_devtools_04_sources_and_debugger.md)

## Core Terminology

**DevTools**
A suite of web developer tools built into every modern browser. Accessed via `F12`, `Cmd+Option+I` (Mac), or right-click → "Inspect."

**Elements panel**
The panel showing the live DOM tree and computed CSS. Changes made here are applied immediately but are not saved — they reset on refresh.

**Console**
An interactive JavaScript REPL (Read-Eval-Print Loop) with access to the page's JavaScript context. Also aggregates errors, warnings, and `console.log` output.

**Network panel**
Records all HTTP requests made by the page — resources, API calls, WebSocket connections. Shows request/response headers, body, timing, and status codes.

**Sources panel**
Shows the page's source files. The debugger tab lets you set breakpoints, step through code, inspect variables, and view the call stack.

**Breakpoint**
A marker on a line of source code that pauses JavaScript execution when that line is reached, giving you a frozen snapshot of the program's state to inspect.

**Call stack**
The list of active function calls at the current breakpoint. Displayed in the Debugger panel. The stack shows the full execution path from the outermost frame to the current function.

---

## Unit Challenge

Debug a broken web app using nothing but DevTools:

**Goal:** You are given a URL to a page with exactly six deliberate bugs. Find and fix all six using DevTools — without editing the source files in your editor.

**The six bugs (types, not spoilers):**
1. A CSS rule that is not applying — specificity issue
2. A misaligned flex layout — a missing `flex` property
3. A JavaScript TypeError — accessing a property on undefined
4. A 404 network request — an API call with a wrong URL
5. A `console.error` message that gives a clue about a missing `data-` attribute
6. A `localStorage` value that is not being parsed correctly

**Requirements:**
- Document each bug: what the symptom was, what you found in DevTools, and what the fix was
- Screenshot the relevant DevTools panel for each fix

**Success Criteria:**
- [ ] All six bugs identified and explained
- [ ] The CSS bug is fixed using the Elements panel's computed styles view
- [ ] The JavaScript bug is found by setting a breakpoint, not by reading source code
- [ ] The network bug is found using the Network panel filter, not by guessing

> **💡 Hint:** Start with the Console. It almost always tells you what is wrong first.

---

> **Unit Insight:** Every minute you invest in becoming fluent with DevTools returns an hour of debugging time saved. The developers who seem magical at bug fixes are not smarter — they are faster because their tools are sharper.
