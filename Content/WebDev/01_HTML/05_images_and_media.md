---
title: "Images & Media"
lesson_plan: "HTML"
order: 5
duration_minutes: 15
sidebar_position: 5
tags:
  - html
  - images
  - img
  - alt-text
  - figure
  - media
  - video
  - audio
---

# Images & Media

> **Lesson Summary:** Images are one of the most common elements on the web — and one of the most commonly misused. The `<img>` element is simple on the surface, but `alt` text is a first-class accessibility and SEO obligation, not optional decoration. This lesson also introduces `<figure>`, `<video>`, and `<audio>` — how the browser embeds media with meaning.

![A web page layout showing an image frame, caption, video player, and audio waveform on a dark background](../../../Assets/Images/webdev/html/html_images_media.png)

## The `<img>` Element

`<img>` embeds an image into the document. It is a **void element** — no closing tag, no content.

```html
<img src="photo.jpg" alt="A golden retriever sitting in autumn leaves" />
```

Two attributes are required on every `<img>`:

| Attribute | Purpose |
| :--- | :--- |
| `src` | The URL of the image file (absolute or relative) |
| `alt` | A text description of the image |

---

## The `alt` Attribute — Not Optional

The `alt` attribute provides **alternative text** for the image. It is used by:

- **Screen readers** — they read the `alt` text aloud to users who cannot see the image
- **Search engines** — they index `alt` text to understand image content, which affects SEO
- **Broken image fallback** — if the image fails to load, the browser displays the `alt` text in its place

```html
<!-- ✅ Descriptive alt text -->
<img src="server-rack.jpg" alt="A server rack with 24 units, cable-managed, in a data centre" />

<!-- ❌ Useless alt text — identical to the filename -->
<img src="server-rack.jpg" alt="server-rack.jpg" />

<!-- ❌ Non-descriptive filler -->
<img src="server-rack.jpg" alt="image" />
```

### When to use an empty `alt`

If an image is **purely decorative** — it adds no information that isn't already conveyed by surrounding text — give it an empty `alt`:

```html
<img src="decorative-divider.svg" alt="" />
```

An empty `alt=""` tells screen readers: "skip this, it's not content." **Never omit the attribute entirely.** An absent `alt` attribute causes screen readers to read the filename instead — which is almost always useless.

---

## `width` and `height`

You should specify the natural dimensions of every image:

```html
<img src="photo.jpg" alt="Alt text here" width="800" height="600" />
```

**Why this matters:** When a browser loads a page, it lays out elements before images have finished downloading. Without `width` and `height`, it cannot reserve space for the image — so when the image loads, the layout shifts (sometimes dramatically). This is called **Cumulative Layout Shift (CLS)** and it is both a bad user experience and a ranking factor in search engines.

Setting `width` and `height` lets the browser reserve the right amount of space immediately.

> **💡 Tip:** Setting these attributes does not prevent CSS from resizing the image. Setting `width: 100%` in CSS will still make the image fill its container. The attributes inform the browser of the image's *aspect ratio* so it can reserve space correctly, even if the displayed size differs.

---

## `<figure>` and `<figcaption>`

When an image has a visible caption, use `<figure>` and `<figcaption>` to group them semantically:

```html
<figure>
  <img
    src="dom-tree.png"
    alt="A DOM tree showing the html root with head and body branches"
    width="800"
    height="500"
  />
  <figcaption>The DOM tree produced by parsing a basic HTML document.</figcaption>
</figure>
```

`<figure>` marks a self-contained piece of content — an image, code block, diagram, or chart — that is referenced from the main content but could be moved without breaking the flow. `<figcaption>` provides the visible caption.

> **💡 Tip:** `<figcaption>` and `alt` text serve different audiences. `alt` text describes the image for users who cannot see it. `<figcaption>` is a visible caption for *all* users. They can overlap in content but do not have to be identical.

---

## Image File Formats — a brief reference

| Format | Use case |
| :--- | :--- |
| **JPEG / JPG** | Photographs; lossy compression |
| **PNG** | Images with transparency; lossless |
| **SVG** | Logos, icons, diagrams; scales perfectly at any size |
| **WebP** | Modern format; smaller file size than JPEG/PNG for equivalent quality |
| **AVIF** | Newer, even more efficient; not yet universally supported |

> **💡 Tip:** For icons, logos, and UI graphics, prefer **SVG**. It scales without pixellation at any resolution and can be styled with CSS. For photos, **WebP** is now widely supported and should be your first choice over JPEG.

---

## `<video>`

Embeds a video directly in the page without a third-party player:

```html
<video controls width="640" height="360">
  <source src="intro.mp4" type="video/mp4" />
  <source src="intro.webm" type="video/webm" />
  <p>Your browser does not support the video element. <a href="intro.mp4">Download the video</a>.</p>
</video>
```

Key attributes:

| Attribute | Effect |
| :--- | :--- |
| `controls` | Shows the browser's native play/pause/volume controls |
| `autoplay` | Starts playing automatically (requires `muted` in most browsers) |
| `muted` | Mutes audio by default |
| `loop` | Loops the video |
| `poster` | URL of an image to show before the video plays |

Multiple `<source>` elements provide fallback formats — the browser picks the first one it can play.

---

## `<audio>`

Embeds an audio player:

```html
<audio controls>
  <source src="episode.mp3" type="audio/mpeg" />
  <source src="episode.ogg" type="audio/ogg" />
  <p>Your browser does not support the audio element.</p>
</audio>
```

The same `controls`, `autoplay`, `muted`, and `loop` attributes apply.

---

## Key Takeaways

- `<img>` requires both `src` and `alt` — always.
- `alt` text describes image content for screen readers, search engines, and broken-image fallback. Use `alt=""` for purely decorative images; never omit the attribute.
- Set `width` and `height` on every image to prevent Cumulative Layout Shift.
- Use `<figure>` + `<figcaption>` when an image has a visible caption.
- `<video>` and `<audio>` embed media natively; use multiple `<source>` elements for format fallbacks.

## Research Questions

> **🔬 Research Question:** What is the `<picture>` element and how does it differ from `<img>`? What problem does `srcset` solve on `<img>`, and what does `sizes` add on top of that?
>
> *Hint: Search "HTML picture element responsive images MDN" and "img srcset sizes".*

> **🔬 Research Question:** What is lazy loading for images (`loading="lazy"`)? How does it improve page performance, and are there cases where you should explicitly set `loading="eager"`?
>
> *Hint: Search "img loading lazy MDN" and "lazy loading above the fold".*
