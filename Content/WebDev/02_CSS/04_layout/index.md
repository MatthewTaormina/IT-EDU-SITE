---
title: "Layout"
description: "The two modern CSS layout systems: Flexbox for one-dimensional layouts, Grid for two-dimensional layouts."
domain: "WebDev"
difficulty: "Intermediate"
prerequisites:
  - "The Box Model (all three lessons)"
learning_objectives:
  - "Build one-dimensional layouts using Flexbox"
  - "Build two-dimensional layouts using CSS Grid"
  - "Choose between Flexbox and Grid for any given layout problem"
sidebar_position: 0
sidebar_label: "Overview"
---

# Layout

> **Sub-unit Summary:** CSS has two purpose-built layout systems — Flexbox for arranging items along a single axis, and Grid for placing items in two dimensions simultaneously. Together they replace every layout hack that came before (floats, tables, inline-block). This sub-unit covers each system in depth, then shows how they are composed in real page layouts.

## Learning Objectives

By the end of this sub-unit, you will be able to:

- Build one-dimensional layouts using Flexbox (navbars, card rows, centred content)
- Build two-dimensional layouts using CSS Grid (page layout, card grids, named regions)
- Choose between Flexbox and Grid for any given layout problem

## Sub-topics

### Flexbox
Arrange items along a single axis — horizontal or vertical. The right tool for components: navbars, button groups, card rows, any layout where items flow in one direction.
→ [Start Flexbox](./01_flexbox/index.md)

### Grid
Place items in rows and columns simultaneously. The right tool for page-level layout and any design that requires two-dimensional control.
→ [Start Grid](./02_grid/index.md)

---

## Choosing Between Flexbox and Grid

| Flexbox | Grid |
| :--- | :--- |
| One direction at a time (row **or** column) | Two directions simultaneously (rows **and** columns) |
| Content-driven: items control size | Layout-driven: the container defines the structure |
| Great for components (navbars, cards, buttons) | Great for page layout (header/main/sidebar/footer) |
| Items can grow and shrink fluidly | Precise placement with line numbers or named areas |

They are frequently used together: Grid for the page layout, Flexbox for the components inside each grid area.
