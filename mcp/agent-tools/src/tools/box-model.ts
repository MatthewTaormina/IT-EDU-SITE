import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ─── Zod schema ───────────────────────────────────────────────────────────────
//
// Children are accepted as `unknown` to avoid the recursive-type memory issue
// in the TypeScript compiler. Runtime validation is handled by `parseElement`.

const BoxModelElementSchema = z.object({
  label: z.string().optional().describe("Optional human-readable label for this element."),
  width: z.union([z.number().nonnegative(), z.literal("auto")]).describe(
    "CSS width in px or 'auto'. For border-box this includes padding and border."
  ),
  height: z.union([z.number().nonnegative(), z.literal("auto")]).optional().describe(
    "CSS height in px or 'auto' (default). For border-box this includes padding and border."
  ),
  padding: z.union([
    z.number().nonnegative(),
    z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
    z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]),
  ]).optional().describe("Padding shorthand (px): number, [v,h], or [top,right,bottom,left]."),
  paddingTop:    z.number().nonnegative().optional(),
  paddingRight:  z.number().nonnegative().optional(),
  paddingBottom: z.number().nonnegative().optional(),
  paddingLeft:   z.number().nonnegative().optional(),
  border: z.union([
    z.number().nonnegative(),
    z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
    z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]),
  ]).optional().describe("Border-width shorthand (px): number, [v,h], or [top,right,bottom,left]."),
  borderTop:    z.number().nonnegative().optional(),
  borderRight:  z.number().nonnegative().optional(),
  borderBottom: z.number().nonnegative().optional(),
  borderLeft:   z.number().nonnegative().optional(),
  margin: z.union([
    z.number().nonnegative(),
    z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
    z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]),
  ]).optional().describe("Margin shorthand (px): number, [v,h], or [top,right,bottom,left]."),
  marginTop:    z.number().nonnegative().optional(),
  marginRight:  z.number().nonnegative().optional(),
  marginBottom: z.number().nonnegative().optional(),
  marginLeft:   z.number().nonnegative().optional(),
  boxSizing: z.enum(["content-box", "border-box"]).optional()
    .describe("CSS box-sizing model (default: 'content-box')."),
  layout: z.enum(["block", "flex-column", "flex-row", "grid"]).optional()
    .describe("How children stack: block/flex-column=vertical, flex-row=horizontal, grid=not computed."),
  // Children accepted as unknown[] to avoid recursive Zod type inference
  children: z.array(z.unknown()).optional()
    .describe("Nested child element objects using the same schema. Auto-height is derived from children."),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoxModelInput {
  label?: string;
  width: number | "auto";
  height?: number | "auto";
  padding?: number | [number, number] | [number, number, number, number];
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  border?: number | [number, number] | [number, number, number, number];
  borderTop?: number;
  borderRight?: number;
  borderBottom?: number;
  borderLeft?: number;
  margin?: number | [number, number] | [number, number, number, number];
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  boxSizing?: "content-box" | "border-box";
  layout?: "block" | "flex-column" | "flex-row" | "grid";
  children?: BoxModelInput[];
}

interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface BoxModelResult {
  label?: string;
  boxSizing: "content-box" | "border-box";
  layout: string;
  padding: Edges;
  border: Edges;
  margin: Edges;
  contentWidth: number | "auto";
  contentHeight: number | "auto";
  paddingBoxWidth: number | "auto";
  paddingBoxHeight: number | "auto";
  borderBoxWidth: number | "auto";
  borderBoxHeight: number | "auto";
  marginBoxWidth: number | "auto";
  marginBoxHeight: number | "auto";
  children: BoxModelResult[];
}

// ─── Registration ─────────────────────────────────────────────────────────────

export function registerBoxModelTools(server: McpServer): void {
  server.tool(
    "box_model_calc",
    [
      "Compute the CSS box model for an element and its descendants.",
      "Given width, height, padding, border, margin, and box-sizing, returns:",
      "content/padding/border/margin box dimensions for each element.",
      "Pass children (same schema, nested) to see how they stack inside the parent's content area.",
      "All dimensions are in CSS pixels (px).",
    ].join(" "),
    { element: BoxModelElementSchema },
    async ({ element }) => {
      const parsed = parseElement(element);
      const result = calcElement(parsed);
      const text = formatTree(result, 0);
      return { content: [{ type: "text", text }] };
    }
  );
}

/** Recursively cast the loosely-typed input to BoxModelInput at runtime. */
function parseElement(raw: unknown): BoxModelInput {
  const el = raw as Record<string, unknown>;
  return {
    label:         typeof el.label === "string" ? el.label : undefined,
    width:         el.width === "auto" ? "auto" : Number(el.width ?? 0),
    height:        el.height === "auto" ? "auto" : el.height !== undefined ? Number(el.height) : undefined,
    padding:       parseEdgeValue(el.padding),
    paddingTop:    toNum(el.paddingTop),
    paddingRight:  toNum(el.paddingRight),
    paddingBottom: toNum(el.paddingBottom),
    paddingLeft:   toNum(el.paddingLeft),
    border:        parseEdgeValue(el.border),
    borderTop:     toNum(el.borderTop),
    borderRight:   toNum(el.borderRight),
    borderBottom:  toNum(el.borderBottom),
    borderLeft:    toNum(el.borderLeft),
    margin:        parseEdgeValue(el.margin),
    marginTop:     toNum(el.marginTop),
    marginRight:   toNum(el.marginRight),
    marginBottom:  toNum(el.marginBottom),
    marginLeft:    toNum(el.marginLeft),
    boxSizing:     el.boxSizing === "border-box" ? "border-box" : "content-box",
    layout:        (["block","flex-column","flex-row","grid"] as const).includes(el.layout as never)
                     ? el.layout as BoxModelInput["layout"]
                     : "block",
    children:      Array.isArray(el.children) ? el.children.map(parseElement) : undefined,
  };
}

function toNum(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function parseEdgeValue(v: unknown): BoxModelInput["padding"] {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "number") return v;
  if (Array.isArray(v)) {
    if (v.length === 2) return [Number(v[0]), Number(v[1])];
    if (v.length === 4) return [Number(v[0]), Number(v[1]), Number(v[2]), Number(v[3])];
  }
  return undefined;
}

// ─── Core calculation ─────────────────────────────────────────────────────────

function resolveEdges(
  shorthand: number | [number, number] | [number, number, number, number] | undefined,
  top: number | undefined,
  right: number | undefined,
  bottom: number | undefined,
  left: number | undefined
): Edges {
  let t = 0,
    r = 0,
    b = 0,
    l = 0;
  if (Array.isArray(shorthand)) {
    if (shorthand.length === 2) {
      t = b = shorthand[0];
      r = l = shorthand[1];
    } else {
      [t, r, b, l] = shorthand as [number, number, number, number];
    }
  } else if (typeof shorthand === "number") {
    t = r = b = l = shorthand;
  }
  return {
    top: top ?? t,
    right: right ?? r,
    bottom: bottom ?? b,
    left: left ?? l,
  };
}

function calcElement(el: BoxModelInput): BoxModelResult {
  const padding = resolveEdges(
    el.padding,
    el.paddingTop,
    el.paddingRight,
    el.paddingBottom,
    el.paddingLeft
  );
  const border = resolveEdges(
    el.border,
    el.borderTop,
    el.borderRight,
    el.borderBottom,
    el.borderLeft
  );
  const margin = resolveEdges(
    el.margin,
    el.marginTop,
    el.marginRight,
    el.marginBottom,
    el.marginLeft
  );

  const boxSizing = el.boxSizing ?? "content-box";
  const layout = el.layout ?? "block";

  const specW = typeof el.width === "number" ? el.width : null;
  const specH =
    typeof el.height === "number"
      ? el.height
      : el.height === "auto" || el.height === undefined
      ? null
      : null;

  // ── Width resolution ────────────────────────────────────────────────────
  let contentWidth: number | "auto";
  let borderBoxWidth: number | "auto";
  const hPad = padding.left + padding.right;
  const hBorder = border.left + border.right;

  if (specW !== null) {
    if (boxSizing === "border-box") {
      borderBoxWidth = specW;
      contentWidth = Math.max(0, specW - hPad - hBorder);
    } else {
      contentWidth = specW;
      borderBoxWidth = specW + hPad + hBorder;
    }
  } else {
    contentWidth = "auto";
    borderBoxWidth = "auto";
  }

  const paddingBoxWidth: number | "auto" =
    borderBoxWidth === "auto" ? "auto" : borderBoxWidth - hBorder;
  const marginBoxWidth: number | "auto" =
    borderBoxWidth === "auto" ? "auto" : borderBoxWidth + margin.left + margin.right;

  // ── Recursive children ──────────────────────────────────────────────────
  // Pass available content width to children if known
  const childInputs = el.children ?? [];
  const childResults = childInputs.map((child) => calcElement(child));

  // ── Height resolution ───────────────────────────────────────────────────
  const vPad = padding.top + padding.bottom;
  const vBorder = border.top + border.bottom;

  let contentHeight: number | "auto";
  let borderBoxHeight: number | "auto";

  if (specH !== null) {
    if (boxSizing === "border-box") {
      borderBoxHeight = specH;
      contentHeight = Math.max(0, specH - vPad - vBorder);
    } else {
      contentHeight = specH;
      borderBoxHeight = specH + vPad + vBorder;
    }
  } else {
    // auto: derive from children
    if (childResults.length > 0) {
      let totalH: number | "auto" = 0;
      if (layout === "flex-row") {
        // height = tallest child margin box
        for (const c of childResults) {
          if (c.marginBoxHeight === "auto") {
            totalH = "auto";
            break;
          }
          totalH = Math.max(totalH as number, c.marginBoxHeight);
        }
      } else {
        // block / flex-column: stack all children
        for (const c of childResults) {
          if (c.marginBoxHeight === "auto") {
            totalH = "auto";
            break;
          }
          totalH = (totalH as number) + c.marginBoxHeight;
        }
      }
      contentHeight = totalH;
    } else {
      contentHeight = "auto";
    }

    borderBoxHeight =
      contentHeight === "auto" ? "auto" : contentHeight + vPad + vBorder;
  }

  const paddingBoxHeight: number | "auto" =
    borderBoxHeight === "auto" ? "auto" : borderBoxHeight - vBorder;
  const marginBoxHeight: number | "auto" =
    borderBoxHeight === "auto" ? "auto" : borderBoxHeight + margin.top + margin.bottom;

  return {
    label: el.label,
    boxSizing,
    layout,
    padding,
    border,
    margin,
    contentWidth,
    contentHeight,
    paddingBoxWidth,
    paddingBoxHeight,
    borderBoxWidth,
    borderBoxHeight,
    marginBoxWidth,
    marginBoxHeight,
    children: childResults,
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function dim(v: number | "auto", unit = "px"): string {
  return v === "auto" ? "auto" : `${v}${unit}`;
}

function formatTree(r: BoxModelResult, depth: number): string {
  const indent = "  ".repeat(depth);
  const name = r.label ? `[${r.label}]` : "[element]";
  const lines: string[] = [
    `${indent}${name} (${r.boxSizing}, layout: ${r.layout})`,
    `${indent}  content     : ${dim(r.contentWidth)} × ${dim(r.contentHeight)}`,
    `${indent}  padding-box : ${dim(r.paddingBoxWidth)} × ${dim(r.paddingBoxHeight)}`,
    `${indent}  border-box  : ${dim(r.borderBoxWidth)} × ${dim(r.borderBoxHeight)}`,
    `${indent}  margin-box  : ${dim(r.marginBoxWidth)} × ${dim(r.marginBoxHeight)}`,
    `${indent}  padding     : T:${r.padding.top} R:${r.padding.right} B:${r.padding.bottom} L:${r.padding.left}`,
    `${indent}  border      : T:${r.border.top} R:${r.border.right} B:${r.border.bottom} L:${r.border.left}`,
    `${indent}  margin      : T:${r.margin.top} R:${r.margin.right} B:${r.margin.bottom} L:${r.margin.left}`,
  ];
  for (const child of r.children) {
    lines.push(`${indent}  children:`);
    lines.push(formatTree(child, depth + 2));
  }
  return lines.join("\n");
}
