---
title: "Client Brief & Wireframes"
sidebar_position: 1
sidebar_label: "Brief"
---

# Client Brief & Wireframes — GitHub Repository Explorer

---

## Client Overview

**Client:** DevTrack (fictional company)
**Product Manager:** Jamie Torres
**Project:** Internal developer discovery tool

---

## The Problem

DevTrack's engineering team spends 20–40 minutes per week searching GitHub for libraries and reference implementations. The current process involves multiple browser tabs, lost bookmarks, and no way to quickly compare tools.

They need a fast, simple search interface that lets engineers find GitHub repositories by keyword, bookmark the useful ones, and revisit their saved list at any time — all without creating a GitHub account or logging in.

---

## User Stories

| ID | As a... | I want to... | So that... |
| :-- | :-- | :-- | :-- |
| US-01 | Developer | Search GitHub repositories by keyword | I can find relevant libraries quickly |
| US-02 | Developer | See repo name, description, star count, language, and last-updated date | I can evaluate a repo without clicking into it |
| US-03 | Developer | Save a repository to my bookmarks | I can return to it later |
| US-04 | Developer | Unsave a repository | I can keep my bookmarks tidy |
| US-05 | Developer | View all saved repositories in a dedicated view | I can review my saved list without re-searching |
| US-06 | Developer | Share a search results URL with a teammate | They can see the same results without retyping |
| US-07 | Developer | Use the browser Back button between views | My navigation feels natural |
| US-08 | Developer | Load more results beyond the first page | I am not limited to 10 results per search |

---

## Wireframes

### View 1 — Search Results

```
┌────────────────────────────────────────────────────────────┐
│  ◉ Repo Explorer                                           │
│                                                            │
│  ┌────────────────────────────────┐  ┌──────────────┐     │
│  │  Search repositories...        │  │   Search  🔍  │     │
│  └────────────────────────────────┘  └──────────────┘     │
│                                                            │
│  [All Results (48)]  [Saved (3)]                           │
│  ─────────────────────────────────────────────────────     │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ facebook/react       │  │ vuejs/vue             │       │
│  │ ⭐ 220,000  JS       │  │ ⭐ 208,000  TypeScript│       │
│  │ A declarative,       │  │ The Progressive       │       │
│  │ efficient, and...    │  │ JavaScript Framework  │       │
│  │ Updated 2 days ago   │  │ Updated 3 days ago    │       │
│  │ ────────────────     │  │ ──────────────────    │       │
│  │ [🔖 Save]            │  │ [✓ Saved]             │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                            │
│  ⟳ Loading...                  [Load More (page 2 of 5)]  │
└────────────────────────────────────────────────────────────┘
```

### View 2 — Saved Repositories

```
┌────────────────────────────────────────────────────────────┐
│  ◉ Repo Explorer                                           │
│                                                            │
│  ┌────────────────────────────────┐  ┌──────────────┐     │
│  │  Search repositories...        │  │   Search  🔍  │     │
│  └────────────────────────────────┘  └──────────────┘     │
│                                                            │
│  [All Results]  [Saved (2)]                                │
│  ─────────────────────────────────────────────────────     │
│                                                            │
│  ┌──────────────────────────────────────────────────┐     │
│  │ vuejs/vue  ⭐ 208,000  TypeScript                │     │
│  │ The Progressive JavaScript Framework              │     │
│  │ Updated 3 days ago                               │     │
│  │ [✕ Unsave]                                       │     │
│  └──────────────────────────────────────────────────┘     │
│                                                            │
│  ┌──────────────────────────────────────────────────┐     │
│  │ torvalds/linux  ⭐ 180,000  C                    │     │
│  │ Linux kernel source tree                         │     │
│  │ Updated 1 day ago                                │     │
│  │ [✕ Unsave]                                       │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Loading State

```
┌──────────────────────┐  ┌──────────────────────┐
│ ████████████████████ │  │ ████████████████████ │  ← skeleton
│ ████████ ██████      │  │ ████████ ██████      │    placeholder
│ ████████████████     │  │ ████████████████     │    cards
│ ████████████         │  │ ████████████         │
│ ████████████████████ │  │ ████████████████████ │
└──────────────────────┘  └──────────────────────┘
```

---

## Design Specifications

| Token | Value |
| :-- | :-- |
| Background | `#f9fafb` |
| Surface (cards) | `#ffffff` |
| Border | `#e5e7eb` |
| Text — primary | `#111827` |
| Text — secondary | `#6b7280` |
| Accent — blue | `#3b82f6` |
| Success (saved) | `#10b981` |
| Border radius | `0.5rem` (8px) |
| Card shadow | `0 1px 3px rgba(0,0,0,0.1)` |
| Font | `system-ui, -apple-system, sans-serif` |

---

## Non-Goals

- No user authentication required
- No backend server required
- No dark mode required (optional extension)
- No mobile-specific layout required (responsive is a bonus)
