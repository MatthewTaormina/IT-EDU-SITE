/**
 * Stateful Virtual DOM tool
 *
 * Agents can build an in-memory HTML/SVG tree across multiple tool calls,
 * then render it to a full HTML string to inspect the layout or share it.
 *
 * Session state is keyed by a caller-supplied `session_id`. Each session holds
 * an independent tree of VDom nodes. Sessions persist for the lifetime of the
 * MCP server process.
 *
 * Tool surface:
 *  vdom_upsert        – create or update a node
 *  vdom_remove        – remove a node (and its subtree)
 *  vdom_move          – re-parent a node
 *  vdom_get_tree      – get the current tree as JSON
 *  vdom_render_html   – render the full session tree to an HTML string
 *  vdom_list_sessions – list active session IDs
 *  vdom_clear         – destroy a session
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VDomNode {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  /** Raw inner content (text / nested HTML you supply directly). Ignored when node has children. */
  innerHtml: string;
  /** IDs of direct children in insertion order */
  childIds: string[];
  parentId: string | null;
}

type VDomSession = Map<string, VDomNode>;

// ─── In-process state ─────────────────────────────────────────────────────────

const sessions = new Map<string, VDomSession>();

function getOrCreateSession(sessionId: string): VDomSession {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new Map());
  }
  return sessions.get(sessionId)!;
}

// ─── Registration ─────────────────────────────────────────────────────────────

export function registerVDomTools(server: McpServer): void {
  // ── vdom_upsert ────────────────────────────────────────────────────────────
  server.tool(
    "vdom_upsert",
    [
      "Create or update a node in the virtual DOM session.",
      "If a node with the same id already exists it is updated in-place;",
      "its position in the parent is preserved. If the node is new it is",
      "appended to the parent's children (or to the root if no parent is given).",
      "Use this to build an HTML or SVG tree across multiple calls.",
    ].join(" "),
    {
      session_id: z.string().min(1).describe("Unique identifier for this virtual DOM session."),
      id: z
        .string()
        .min(1)
        .describe("Unique node ID within the session (e.g. 'header', 'nav-link-1')."),
      tag: z
        .string()
        .min(1)
        .describe(
          "HTML or SVG tag name (e.g. 'div', 'section', 'svg', 'rect', 'text')."
        ),
      attributes: z
        .record(z.string())
        .optional()
        .default({})
        .describe(
          "Key/value pairs for element attributes. Use 'style' for inline CSS, 'class' for class list, 'width'/'height' for SVG dimensions, etc."
        ),
      inner_html: z
        .string()
        .optional()
        .default("")
        .describe(
          "Raw inner content (text or pre-built HTML/SVG snippets). Replaced by rendered children when the node has child nodes."
        ),
      parent_id: z
        .string()
        .optional()
        .describe(
          "ID of the parent node. Omit (or pass null) to place the node at the root level."
        ),
    },
    async ({ session_id, id, tag, attributes, inner_html, parent_id }) => {
      const session = getOrCreateSession(session_id);

      const existing = session.get(id);

      if (existing) {
        // Update in place
        existing.tag = tag;
        existing.attributes = attributes as Record<string, string>;
        existing.innerHtml = inner_html;
        // Re-parent if parent_id changed
        if ((parent_id ?? null) !== existing.parentId) {
          removeFromParent(session, id);
          attachToParent(session, id, parent_id ?? null);
          existing.parentId = parent_id ?? null;
        }
      } else {
        // Create new node
        const node: VDomNode = {
          id,
          tag,
          attributes: attributes as Record<string, string>,
          innerHtml: inner_html,
          childIds: [],
          parentId: parent_id ?? null,
        };
        session.set(id, node);
        attachToParent(session, id, parent_id ?? null);
      }

      const node = session.get(id)!;
      return {
        content: [
          {
            type: "text",
            text: `Node "${id}" (${tag}) ${existing ? "updated" : "created"} in session "${session_id}". Parent: ${node.parentId ?? "(root)"}. Session has ${session.size} nodes.`,
          },
        ],
      };
    }
  );

  // ── vdom_remove ────────────────────────────────────────────────────────────
  server.tool(
    "vdom_remove",
    "Remove a node and all its descendants from the virtual DOM session.",
    {
      session_id: z.string().min(1),
      id: z.string().min(1).describe("ID of the node to remove."),
    },
    async ({ session_id, id }) => {
      const session = sessions.get(session_id);
      if (!session) {
        return { content: [{ type: "text", text: `Session "${session_id}" not found.` }], isError: true };
      }
      if (!session.has(id)) {
        return { content: [{ type: "text", text: `Node "${id}" not found.` }], isError: true };
      }
      const removed = removeSubtree(session, id);
      return {
        content: [
          { type: "text", text: `Removed ${removed} node(s) from session "${session_id}".` },
        ],
      };
    }
  );

  // ── vdom_move ──────────────────────────────────────────────────────────────
  server.tool(
    "vdom_move",
    "Move an existing node to a different parent (or to the root).",
    {
      session_id: z.string().min(1),
      id: z.string().min(1).describe("ID of the node to move."),
      new_parent_id: z
        .string()
        .optional()
        .describe("New parent node ID. Omit to move to root."),
    },
    async ({ session_id, id, new_parent_id }) => {
      const session = sessions.get(session_id);
      if (!session) return err(`Session "${session_id}" not found.`);
      const node = session.get(id);
      if (!node) return err(`Node "${id}" not found.`);

      // Guard: cannot make a node its own ancestor
      if (new_parent_id && isDescendant(session, new_parent_id, id)) {
        return err(`Cannot move "${id}" into its own descendant "${new_parent_id}".`);
      }

      removeFromParent(session, id);
      node.parentId = new_parent_id ?? null;
      attachToParent(session, id, new_parent_id ?? null);

      return {
        content: [
          {
            type: "text",
            text: `Node "${id}" moved. New parent: ${node.parentId ?? "(root)"}.`,
          },
        ],
      };
    }
  );

  // ── vdom_get_tree ──────────────────────────────────────────────────────────
  server.tool(
    "vdom_get_tree",
    "Return the virtual DOM session tree as a readable JSON structure.",
    { session_id: z.string().min(1) },
    async ({ session_id }) => {
      const session = sessions.get(session_id);
      if (!session) return err(`Session "${session_id}" not found.`);

      const roots = getRootIds(session);
      const tree = roots.map((id) => buildTreeJson(session, id));
      return { content: [{ type: "text", text: JSON.stringify(tree, null, 2) }] };
    }
  );

  // ── vdom_render_html ───────────────────────────────────────────────────────
  server.tool(
    "vdom_render_html",
    [
      "Render the virtual DOM session to a complete HTML string.",
      "Wraps root nodes in a minimal HTML5 shell with an opaque white background.",
      "Useful for inspecting, sharing, or copying the layout output.",
    ].join(" "),
    {
      session_id: z.string().min(1),
      as_fragment: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, return only the inner body fragment without the HTML5 shell."),
    },
    async ({ session_id, as_fragment }) => {
      const session = sessions.get(session_id);
      if (!session) return err(`Session "${session_id}" not found.`);

      const roots = getRootIds(session);
      const body = roots.map((id) => renderNode(session, id)).join("\n");

      const output = as_fragment
        ? body
        : [
            "<!DOCTYPE html>",
            '<html lang="en">',
            "<head>",
            '  <meta charset="UTF-8" />',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
            "  <title>Virtual DOM Preview</title>",
            "  <style>",
            "    *, *::before, *::after { box-sizing: border-box; }",
            "    body { margin: 0; background: #ffffff; color: #0f172a; font-family: sans-serif; }",
            "  </style>",
            "</head>",
            '<body id="main-content">',
            body,
            "</body>",
            "</html>",
          ].join("\n");

      return { content: [{ type: "text", text: output }] };
    }
  );

  // ── vdom_list_sessions ─────────────────────────────────────────────────────
  server.tool(
    "vdom_list_sessions",
    "List all active virtual DOM session IDs and their node counts.",
    {},
    async () => {
      if (sessions.size === 0) {
        return { content: [{ type: "text", text: "No active sessions." }] };
      }
      const lines = Array.from(sessions.entries()).map(
        ([id, s]) => `• ${id}  (${s.size} nodes)`
      );
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── vdom_clear ─────────────────────────────────────────────────────────────
  server.tool(
    "vdom_clear",
    "Destroy a virtual DOM session, freeing all its nodes.",
    { session_id: z.string().min(1) },
    async ({ session_id }) => {
      const existed = sessions.delete(session_id);
      return {
        content: [
          {
            type: "text",
            text: existed
              ? `Session "${session_id}" cleared.`
              : `Session "${session_id}" did not exist.`,
          },
        ],
      };
    }
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function err(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true as const };
}

function removeFromParent(session: VDomSession, id: string): void {
  const node = session.get(id);
  if (!node) return;
  if (node.parentId) {
    const parent = session.get(node.parentId);
    if (parent) {
      parent.childIds = parent.childIds.filter((c) => c !== id);
    }
  }
}

function attachToParent(session: VDomSession, id: string, parentId: string | null): void {
  if (parentId) {
    const parent = session.get(parentId);
    if (parent && !parent.childIds.includes(id)) {
      parent.childIds.push(id);
    }
  }
}

function removeSubtree(session: VDomSession, id: string): number {
  const node = session.get(id);
  if (!node) return 0;
  removeFromParent(session, id);
  let count = 1;
  for (const childId of [...node.childIds]) {
    count += removeSubtree(session, childId);
  }
  session.delete(id);
  return count;
}

function getRootIds(session: VDomSession): string[] {
  return Array.from(session.values())
    .filter((n) => n.parentId === null)
    .map((n) => n.id);
}

function isDescendant(session: VDomSession, candidateId: string, ancestorId: string): boolean {
  let current = session.get(candidateId);
  while (current && current.parentId) {
    if (current.parentId === ancestorId) return true;
    current = session.get(current.parentId);
  }
  return false;
}

interface TreeJson {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  innerHtml?: string;
  children: TreeJson[];
}

function buildTreeJson(session: VDomSession, id: string): TreeJson {
  const node = session.get(id)!;
  return {
    id: node.id,
    tag: node.tag,
    attributes: node.attributes,
    ...(node.childIds.length === 0 && node.innerHtml ? { innerHtml: node.innerHtml } : {}),
    children: node.childIds.map((c) => buildTreeJson(session, c)),
  };
}

/** Attribute name allowlist to prevent injection */
const SAFE_ATTR = /^[a-zA-Z][a-zA-Z0-9:_\-]*$/;

function renderAttrs(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .filter(([k]) => SAFE_ATTR.test(k))
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join("");
}

function renderNode(session: VDomSession, id: string): string {
  const node = session.get(id);
  if (!node) return "";
  const attrs = renderAttrs(node.attributes);
  const children = node.childIds.map((c) => renderNode(session, c)).join("\n");
  const inner = node.childIds.length > 0 ? children : escapeHtmlContent(node.innerHtml, node.tag);
  if (VOID_TAGS.has(node.tag.toLowerCase())) {
    return `<${node.tag}${attrs} />`;
  }
  return `<${node.tag}${attrs}>${inner}</${node.tag}>`;
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function escapeAttr(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * For SVG text and HTML text nodes we pass through as-is because agents
 * supply pre-escaped content. For attribute values we always escape.
 */
function escapeHtmlContent(html: string, tag: string): string {
  // SVG and script/style: pass through verbatim
  const t = tag.toLowerCase();
  if (t === "script" || t === "style") return "";
  return html;
}
