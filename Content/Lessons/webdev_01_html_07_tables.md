---
type: lesson
title: "Tables"
description: "Tables are for **tabular data** — information that has meaning because of its row-and-column relationship. They are not for layout. This lesson covers the full table element set, spanning cells, pr..."
duration_minutes: 20
tags:
  - html
  - tables
  - table
  - thead
  - tbody
  - th
  - td
  - accessibility
---

# Tables

> **Lesson Summary:** Tables are for **tabular data** — information that has meaning because of its row-and-column relationship. They are not for layout. This lesson covers the full table element set, spanning cells, proper header markup, and why correct table structure is an accessibility requirement, not a style preference.

![A glowing HTML table grid with a highlighted header row and spanning cells on a dark background](../../Assets/Images/webdev/html/html_tables.png)

## Tables Are for Tabular Data

A table is appropriate when:
- Data has a relationship between rows and columns
- Removing a cell's row or column context would make it meaningless

It is **not** appropriate for:
- Laying out a page (navigation on the left, content on the right)
- Creating a multi-column visual grid for non-tabular content

> **⚠️ Warning:** Tables for layout were a widespread practice before CSS grid and flexbox existed. They still appear in legacy email HTML. Do not use them for layout in new work — they create serious accessibility problems and are deeply difficult to maintain.

---

## The Basic Table Structure

```html
<table>
  <thead>
    <tr>
      <th scope="col">Method</th>
      <th scope="col">Meaning</th>
      <th scope="col">Common use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET</td>
      <td>Retrieve a resource</td>
      <td>Loading a page or fetching data</td>
    </tr>
    <tr>
      <td>POST</td>
      <td>Submit data to the server</td>
      <td>Submitting a form, creating a record</td>
    </tr>
    <tr>
      <td>DELETE</td>
      <td>Remove a resource</td>
      <td>Deleting an account or record</td>
    </tr>
  </tbody>
</table>
```

### Element reference

| Element | Role |
| :--- | :--- |
| `<table>` | The container for the entire table |
| `<thead>` | Groups **header rows** (column labels) |
| `<tbody>` | Groups **body rows** (data) |
| `<tfoot>` | Groups **footer rows** (totals, summaries) |
| `<tr>` | A single **table row** |
| `<th>` | A **header cell** — identifies a column or row |
| `<td>` | A **data cell** |

`<thead>`, `<tbody>`, and `<tfoot>` are technically optional — the browser will add them implicitly if omitted. However, including them explicitly is best practice: they mark the semantic role of each row group and give browsers better information for rendering and accessibility.

---

## `<th>` vs `<td>`

`<th>` marks a **header cell** — it labels other cells. It is rendered bold and centred by default, but more importantly, it is announced differently by screen readers and provides context for the data cells it labels.

`<td>` marks a **data cell** — the actual content.

Never use `<td>` for header cells just to avoid the default bold rendering. Fix that with CSS.

---

## The `scope` Attribute

`scope` tells a screen reader which cells a header applies to:

```html
<th scope="col">Column header — applies to all cells below it</th>
<th scope="row">Row header — applies to all cells to its right</th>
```

| Value | Meaning |
| :--- | :--- |
| `scope="col"` | This header describes the column below it |
| `scope="row"` | This header describes the row to its right |
| `scope="colgroup"` | This header spans multiple columns |
| `scope="rowgroup"` | This header spans multiple rows |

A screen reader user navigating the table cell-by-cell will hear the associated header announced before the cell content — but only if `scope` is set correctly.

---

## Spanning Cells

### `colspan` — spanning columns

```html
<tr>
  <td colspan="2">This cell spans two columns</td>
  <td>Third column</td>
</tr>
```

### `rowspan` — spanning rows

```html
<tr>
  <td rowspan="2">This cell spans two rows</td>
  <td>Row 1, Column 2</td>
</tr>
<tr>
  <!-- No first cell here — it is occupied by the rowspan above -->
  <td>Row 2, Column 2</td>
</tr>
```

> **⚠️ Warning:** Spanning cells require careful counting. If you span a cell across 2 columns but only provide content for the remaining 1 column, the row totals correctly. But if you miscalculate, the browser fills in empty cells inconsistently. Always count cells after adding spans.

---

## `<caption>` — Table Title

```html
<table>
  <caption>HTTP Methods and Their Purposes</caption>
  <thead>…</thead>
  <tbody>…</tbody>
</table>
```

`<caption>` gives the table a visible title and is also read by screen readers before announcing the table. It goes as the **first child** of `<table>`.

---

## A Complete Table Example

```html
<table>
  <caption>HTTP Status Code Ranges</caption>
  <thead>
    <tr>
      <th scope="col">Range</th>
      <th scope="col">Category</th>
      <th scope="col">Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2xx</td>
      <td>Success</td>
      <td>200 OK, 201 Created</td>
    </tr>
    <tr>
      <td>3xx</td>
      <td>Redirection</td>
      <td>301 Moved Permanently, 304 Not Modified</td>
    </tr>
    <tr>
      <td>4xx</td>
      <td>Client Error</td>
      <td>400 Bad Request, 404 Not Found</td>
    </tr>
    <tr>
      <td>5xx</td>
      <td>Server Error</td>
      <td>500 Internal Server Error</td>
    </tr>
  </tbody>
</table>
```

---

## Key Takeaways

- Tables are for **tabular data** — not layout.
- Structure: `<table>` → `<thead>`/`<tbody>`/`<tfoot>` → `<tr>` → `<th>` or `<td>`.
- Use `<th>` for header cells; use `scope="col"` or `scope="row"` so screen readers can announce the right context.
- `colspan` spans a cell horizontally; `rowspan` spans it vertically.
- `<caption>` gives the table a visible, accessible title; it goes first inside `<table>`.

## Research Questions

> **🔬 Research Question:** Before CSS layout existed, how were complex page layouts built in HTML? Find an example of a "table-based layout" from the early web. What problems did it cause for accessibility and maintenance?
>
> *Hint: Search "table layout history web design 1990s" and "spacer GIF technique".*

> **🔬 Research Question:** The `headers` attribute on `<td>` is an alternative to `scope` for connecting data cells to header cells. When is `headers` necessary instead of `scope`? What kind of table structure requires it?
>
> *Hint: Search "HTML table headers attribute complex tables MDN".*
