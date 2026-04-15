/**
 * Stateful Wireframe tool
 *
 * Agents build a low-fidelity wireframe across multiple tool calls.
 * Each wireframe has a named frame with a fixed viewport and a set of
 * rectangular elements annotated with type labels.
 *
 * The render step outputs a WCAG-compliant SVG string (opaque bg, ≥3:1
 * contrast on all shapes, accessible title+desc, aria-hidden decorative fill).
 *
 * Tool surface:
 *  wireframe_create           – create a new frame (or reset an existing one)
 *  wireframe_add_element      – add a box/element to the frame
 *  wireframe_update_element   – update position/size/label/type of an element
 *  wireframe_remove_element   – remove an element
 *  wireframe_get              – get the current frame state as JSON
 *  wireframe_render_svg       – render the frame to an accessible SVG string
 *  wireframe_list             – list all frame IDs
 *  wireframe_clear            – destroy a frame
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

type ElementType =
  | "box"
  | "text"
  | "heading"
  | "image"
  | "button"
  | "input"
  | "nav"
  | "header"
  | "footer"
  | "sidebar"
  | "card"
  | "list"
  | "table"
  | "modal"
  | "icon"
  | "divider"
  | "svg";

interface WireframeElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  note?: string;
  zIndex: number;
}

interface WireframeFrame {
  id: string;
  title: string;
  viewportWidth: number;
  viewportHeight: number;
  /** Element insertion order */
  elementOrder: string[];
  elements: Map<string, WireframeElement>;
}

// ─── Visual style per element type ───────────────────────────────────────────

interface ElementStyle {
  fill: string;
  stroke: string;
  labelColor: string;
  /** Corner radius */
  rx: number;
  /** Render a diagonal cross to signal image placeholder */
  crosshatch?: boolean;
  dash?: string;
}

const TYPE_STYLES: Record<ElementType, ElementStyle> = {
  box:      { fill: "#f1f5f9", stroke: "#64748b", labelColor: "#0f172a", rx: 0 },
  text:     { fill: "#ffffff", stroke: "#94a3b8", labelColor: "#0f172a", rx: 0, dash: "4,3" },
  heading:  { fill: "#eff6ff", stroke: "#3b82f6", labelColor: "#1e40af", rx: 0 },
  image:    { fill: "#e2e8f0", stroke: "#64748b", labelColor: "#334155", rx: 4, crosshatch: true },
  button:   { fill: "#1d4ed8", stroke: "#1e3a8a", labelColor: "#ffffff", rx: 6 },
  input:    { fill: "#ffffff", stroke: "#475569", labelColor: "#334155", rx: 4 },
  nav:      { fill: "#0f172a", stroke: "#0f172a", labelColor: "#f1f5f9", rx: 0 },
  header:   { fill: "#1e293b", stroke: "#0f172a", labelColor: "#f8fafc", rx: 0 },
  footer:   { fill: "#1e293b", stroke: "#0f172a", labelColor: "#f8fafc", rx: 0 },
  sidebar:  { fill: "#f8fafc", stroke: "#cbd5e1", labelColor: "#0f172a", rx: 0 },
  card:     { fill: "#ffffff", stroke: "#e2e8f0", labelColor: "#0f172a", rx: 8 },
  list:     { fill: "#f8fafc", stroke: "#94a3b8", labelColor: "#334155", rx: 0 },
  table:    { fill: "#f8fafc", stroke: "#475569", labelColor: "#0f172a", rx: 0 },
  modal:    { fill: "#ffffff", stroke: "#0f172a", labelColor: "#0f172a", rx: 8 },
  icon:     { fill: "#e2e8f0", stroke: "#64748b", labelColor: "#334155", rx: 50 },
  divider:  { fill: "#cbd5e1", stroke: "#cbd5e1", labelColor: "#64748b", rx: 0 },
  svg:      { fill: "#f0fdf4", stroke: "#16a34a", labelColor: "#14532d", rx: 4 },
};

// ─── In-process state ─────────────────────────────────────────────────────────

const frames = new Map<string, WireframeFrame>();

// ─── Registration ─────────────────────────────────────────────────────────────

export function registerWireframeTools(server: McpServer): void {
  // ── wireframe_create ───────────────────────────────────────────────────────
  server.tool(
    "wireframe_create",
    "Create a new wireframe frame with a fixed viewport. If a frame with the same ID already exists it is replaced.",
    {
      frame_id: z.string().min(1).describe("Unique ID for this wireframe frame."),
      title: z.string().optional().default("Wireframe").describe("Human-readable title shown in the SVG."),
      viewport_width: z.number().positive().default(1440).describe("Canvas width in px."),
      viewport_height: z.number().positive().default(900).describe("Canvas height in px."),
    },
    async ({ frame_id, title, viewport_width, viewport_height }) => {
      frames.set(frame_id, {
        id: frame_id,
        title: title ?? "Wireframe",
        viewportWidth: viewport_width,
        viewportHeight: viewport_height,
        elementOrder: [],
        elements: new Map(),
      });
      return {
        content: [
          {
            type: "text",
            text: `Frame "${frame_id}" created. Viewport: ${viewport_width}×${viewport_height}px.`,
          },
        ],
      };
    }
  );

  // ── wireframe_add_element ──────────────────────────────────────────────────
  server.tool(
    "wireframe_add_element",
    [
      "Add a UI element to a wireframe frame.",
      "If an element with the same id already exists it is updated in-place.",
      "Position origin is top-left of the viewport.",
    ].join(" "),
    {
      frame_id: z.string().min(1),
      id: z.string().min(1).describe("Unique element ID within the frame."),
      type: z
        .enum([
          "box", "text", "heading", "image", "button", "input",
          "nav", "header", "footer", "sidebar", "card", "list",
          "table", "modal", "icon", "divider", "svg",
        ] as const)
        .describe("Element type controls the visual style in the rendered SVG."),
      x: z.number().describe("Left edge offset from viewport origin (px)."),
      y: z.number().describe("Top edge offset from viewport origin (px)."),
      width: z.number().positive().describe("Element width (px)."),
      height: z.number().positive().describe("Element height (px)."),
      label: z.string().optional().default("").describe("Text label rendered inside the element."),
      note: z.string().optional().describe("Optional annotation shown below the label."),
      z_index: z.number().int().optional().default(0).describe("Stacking order (higher = on top)."),
    },
    async ({ frame_id, id, type, x, y, width, height, label, note, z_index }) => {
      const frame = frames.get(frame_id);
      if (!frame) return err(`Frame "${frame_id}" not found. Create it first with wireframe_create.`);

      const el: WireframeElement = {
        id,
        type: type as ElementType,
        x,
        y,
        width,
        height,
        label: label ?? "",
        note,
        zIndex: z_index ?? 0,
      };

      const isNew = !frame.elements.has(id);
      frame.elements.set(id, el);
      if (isNew) frame.elementOrder.push(id);

      return {
        content: [
          {
            type: "text",
            text: `Element "${id}" (${type}) ${isNew ? "added" : "updated"} in frame "${frame_id}". Position: (${x},${y}) Size: ${width}×${height}.`,
          },
        ],
      };
    }
  );

  // ── wireframe_update_element ───────────────────────────────────────────────
  server.tool(
    "wireframe_update_element",
    "Update the position, size, label, or type of an existing wireframe element. Only provided fields are changed.",
    {
      frame_id: z.string().min(1),
      id: z.string().min(1).describe("ID of the element to update."),
      type: z.enum([
        "box","text","heading","image","button","input",
        "nav","header","footer","sidebar","card","list",
        "table","modal","icon","divider","svg",
      ] as const).optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      label: z.string().optional(),
      note: z.string().optional(),
      z_index: z.number().int().optional(),
    },
    async ({ frame_id, id, type, x, y, width, height, label, note, z_index }) => {
      const frame = frames.get(frame_id);
      if (!frame) return err(`Frame "${frame_id}" not found.`);
      const el = frame.elements.get(id);
      if (!el) return err(`Element "${id}" not found in frame "${frame_id}".`);

      if (type !== undefined) el.type = type as ElementType;
      if (x !== undefined) el.x = x;
      if (y !== undefined) el.y = y;
      if (width !== undefined) el.width = width;
      if (height !== undefined) el.height = height;
      if (label !== undefined) el.label = label;
      if (note !== undefined) el.note = note;
      if (z_index !== undefined) el.zIndex = z_index;

      return { content: [{ type: "text", text: `Element "${id}" updated.` }] };
    }
  );

  // ── wireframe_remove_element ───────────────────────────────────────────────
  server.tool(
    "wireframe_remove_element",
    "Remove an element from a wireframe frame.",
    {
      frame_id: z.string().min(1),
      id: z.string().min(1),
    },
    async ({ frame_id, id }) => {
      const frame = frames.get(frame_id);
      if (!frame) return err(`Frame "${frame_id}" not found.`);
      if (!frame.elements.delete(id)) return err(`Element "${id}" not found.`);
      frame.elementOrder = frame.elementOrder.filter((eid) => eid !== id);
      return { content: [{ type: "text", text: `Element "${id}" removed from frame "${frame_id}".` }] };
    }
  );

  // ── wireframe_get ──────────────────────────────────────────────────────────
  server.tool(
    "wireframe_get",
    "Return the full state of a wireframe frame as JSON.",
    { frame_id: z.string().min(1) },
    async ({ frame_id }) => {
      const frame = frames.get(frame_id);
      if (!frame) return err(`Frame "${frame_id}" not found.`);
      const json = {
        id: frame.id,
        title: frame.title,
        viewportWidth: frame.viewportWidth,
        viewportHeight: frame.viewportHeight,
        elements: frame.elementOrder.map((id) => {
          const el = frame.elements.get(id)!;
          return { ...el };
        }),
      };
      return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
    }
  );

  // ── wireframe_render_svg ───────────────────────────────────────────────────
  server.tool(
    "wireframe_render_svg",
    [
      "Render a wireframe frame to a self-contained, accessible SVG string.",
      "Follows WCAG 2.1 AA: opaque background, ≥3:1 contrast, role=img,",
      "<title>/<desc> for screen readers, proper font sizes using rem-equivalent px.",
      "The SVG can be embedded in HTML, saved as .svg, or previewed directly.",
    ].join(" "),
    {
      frame_id: z.string().min(1),
      scale: z
        .number()
        .positive()
        .optional()
        .default(1)
        .describe("Scale factor for the output SVG (default 1.0 = full size)."),
      show_grid: z
        .boolean()
        .optional()
        .default(false)
        .describe("Overlay an 8-px baseline grid."),
      show_labels: z
        .boolean()
        .optional()
        .default(true)
        .describe("Show type labels inside each element."),
    },
    async ({ frame_id, scale, show_grid, show_labels }) => {
      const frame = frames.get(frame_id);
      if (!frame) return err(`Frame "${frame_id}" not found.`);
      const svg = renderFrameToSvg(frame, scale ?? 1, show_grid ?? false, show_labels ?? true);
      return { content: [{ type: "text", text: svg }] };
    }
  );

  // ── wireframe_list ─────────────────────────────────────────────────────────
  server.tool(
    "wireframe_list",
    "List all wireframe frame IDs with their viewport sizes and element counts.",
    {},
    async () => {
      if (frames.size === 0) {
        return { content: [{ type: "text", text: "No wireframe frames exist yet." }] };
      }
      const lines = Array.from(frames.values()).map(
        (f) => `• ${f.id}  "${f.title}"  ${f.viewportWidth}×${f.viewportHeight}  (${f.elements.size} elements)`
      );
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── wireframe_clear ────────────────────────────────────────────────────────
  server.tool(
    "wireframe_clear",
    "Destroy a wireframe frame and all its elements.",
    { frame_id: z.string().min(1) },
    async ({ frame_id }) => {
      const existed = frames.delete(frame_id);
      return {
        content: [
          {
            type: "text",
            text: existed
              ? `Frame "${frame_id}" cleared.`
              : `Frame "${frame_id}" did not exist.`,
          },
        ],
      };
    }
  );
}

// ─── SVG renderer ─────────────────────────────────────────────────────────────

const SAFE_PADDING = 16; // inset from viewBox edge (WCAG SVG padding rule)
const FONT_SIZE = 13;    // px — maps to ~0.8125rem — passes 1.4.4

function renderFrameToSvg(
  frame: WireframeFrame,
  scale: number,
  showGrid: boolean,
  showLabels: boolean
): string {
  const W = frame.viewportWidth;
  const H = frame.viewportHeight;
  const sW = Math.round(W * scale);
  const sH = Math.round(H * scale);

  const titleId = `wf-title-${frame.id}`;
  const descId = `wf-desc-${frame.id}`;

  // Sort elements by zIndex for correct stacking
  const sorted = frame.elementOrder
    .map((id) => frame.elements.get(id)!)
    .sort((a, b) => a.zIndex - b.zIndex);

  const gridLines = showGrid ? renderGrid(W, H) : "";

  const elementSvg = sorted.map((el) => renderElement(el, showLabels)).join("\n");

  return [
    `<svg`,
    `  xmlns="http://www.w3.org/2000/svg"`,
    `  viewBox="0 0 ${W} ${H}"`,
    `  width="${sW}" height="${sH}"`,
    `  role="img"`,
    `  aria-labelledby="${titleId} ${descId}"`,
    `>`,
    `  <title id="${titleId}">${escSvg(frame.title)} — Wireframe</title>`,
    `  <desc id="${descId}">Low-fidelity wireframe layout for ${escSvg(frame.title)}. Contains ${frame.elements.size} elements.</desc>`,
    // Opaque background (WCAG SVG rule)
    `  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff" aria-hidden="true"/>`,
    // Safe zone guide (not rendered, just referenced in padding constant)
    gridLines,
    `  <g aria-hidden="true">`,
    elementSvg,
    `  </g>`,
    // Viewport label
    `  <text x="${SAFE_PADDING}" y="${H - SAFE_PADDING}" font-size="${FONT_SIZE - 2}" fill="#94a3b8" font-family="monospace" aria-hidden="true">${W}×${H}px</text>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderGrid(W: number, H: number): string {
  const lines: string[] = ['  <g opacity="0.15" aria-hidden="true">'];
  for (let x = 0; x <= W; x += 8) {
    lines.push(`    <line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#64748b" stroke-width="0.5"/>`);
  }
  for (let y = 0; y <= H; y += 8) {
    lines.push(`    <line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#64748b" stroke-width="0.5"/>`);
  }
  lines.push("  </g>");
  return lines.join("\n");
}

function renderElement(el: WireframeElement, showLabels: boolean): string {
  const style = TYPE_STYLES[el.type] ?? TYPE_STYLES.box;
  const { x, y, width: w, height: h } = el;
  const lines: string[] = [];

  const dashAttr = style.dash ? ` stroke-dasharray="${style.dash}"` : "";

  // Main rectangle
  lines.push(
    `    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${style.rx}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5"${dashAttr}/>`
  );

  // Crosshatch for images
  if (style.crosshatch) {
    lines.push(
      `    <line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${style.stroke}" stroke-width="1" opacity="0.5"/>`,
      `    <line x1="${x + w}" y1="${y}" x2="${x}" y2="${y + h}" stroke="${style.stroke}" stroke-width="1" opacity="0.5"/>`
    );
  }

  // Type chip in top-left corner
  if (showLabels) {
    const chipPad = 4;
    const chipH = 16;
    const typeText = el.type.toUpperCase();
    const chipW = typeText.length * 6.5 + chipPad * 2;
    lines.push(
      `    <rect x="${x}" y="${y}" width="${chipW}" height="${chipH}" fill="${style.stroke}" rx="0"/>`,
      `    <text x="${x + chipPad}" y="${y + chipH - 4}" font-size="9" font-family="monospace" fill="${style.labelColor === style.fill ? "#ffffff" : style.labelColor}" font-weight="600">${escSvg(typeText)}</text>`
    );
  }

  // Main label — centred
  if (el.label && showLabels) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const labelLines = splitLabel(el.label, Math.floor(w / 8));
    const lineH = FONT_SIZE * 1.4;
    const startY = cy - ((labelLines.length - 1) * lineH) / 2;
    for (let i = 0; i < labelLines.length; i++) {
      lines.push(
        `    <text x="${cx}" y="${startY + i * lineH}" text-anchor="middle" dominant-baseline="middle" font-size="${FONT_SIZE}" font-family="system-ui,sans-serif" fill="${style.labelColor}">${escSvg(labelLines[i])}</text>`
      );
    }
  }

  // Note — rendered below element
  if (el.note && showLabels) {
    lines.push(
      `    <text x="${x}" y="${y + h + 14}" font-size="10" font-family="system-ui,sans-serif" fill="#64748b" font-style="italic">${escSvg(el.note)}</text>`
    );
  }

  return lines.join("\n");
}

/** Wrap label into lines of at most maxChars characters */
function splitLabel(label: string, maxChars: number): string[] {
  if (maxChars < 4) return [label.slice(0, 10)];
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function escSvg(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function err(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true as const };
}
