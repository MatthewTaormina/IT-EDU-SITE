/**
 * Manifest & Knowledge-base tools
 *
 * Provides fast search and read access over the workspace's knowledge,
 * planning, and standards folders without needing to know exact file paths.
 *
 * Covered folders (SEARCH_ROOTS):
 *  .knowledge/   – instructional knowledge graph
 *  .objectives/  – milestone and pathway objectives
 *  .prds/        – product requirements documents
 *  .reviews/     – audit and review reports
 *  .specs/       – content and data model specifications
 *  .standards/   – checklists, review templates, publishing standards
 *
 * Tool surface:
 *  manifest_list    – list all files under one or more covered folders
 *  manifest_read    – read the contents of a specific file
 *  manifest_search  – full-text search across covered folders
 *  manifest_tree    – show the directory tree of covered folders
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ─── Workspace root ──────────────────────────────────────────────────────────
//
// The compiled file sits at <workspace>/mcp/agent-tools/dist/index.js
// so __dirname is <workspace>/mcp/agent-tools/dist  →  3 levels up = workspace root.
// An override via WORKSPACE_ROOT env var is always honoured first.

const WORKSPACE_ROOT: string =
  process.env.WORKSPACE_ROOT ??
  path.resolve(__dirname, "..", "..", "..");

// ─── Covered search roots ─────────────────────────────────────────────────────

const ALL_ROOTS = [
  ".knowledge",
  ".objectives",
  ".prds",
  ".reviews",
  ".specs",
  ".standards",
] as const;

type RootName = typeof ALL_ROOTS[number];

const RootSchema = z.enum(ALL_ROOTS);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect every file under `dir`. */
function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

/** Convert an absolute path to a workspace-relative path. */
function relative(absPath: string): string {
  return path.relative(WORKSPACE_ROOT, absPath).replace(/\\/g, "/");
}

/** Resolve a caller-supplied path against the workspace root safely. */
function safeResolve(userPath: string): string | null {
  // Remove leading slashes so path.resolve doesn't treat it as absolute
  const normalised = userPath.replace(/^[/\\]+/, "");
  const resolved = path.resolve(WORKSPACE_ROOT, normalised);
  // Ensure the resolved path stays inside the workspace
  if (!resolved.startsWith(WORKSPACE_ROOT + path.sep) && resolved !== WORKSPACE_ROOT) {
    return null;
  }
  return resolved;
}

/** Check that the path is under an allowed search root. */
function isAllowedPath(absPath: string): boolean {
  return ALL_ROOTS.some((root) => {
    const rootAbs = path.join(WORKSPACE_ROOT, root);
    return absPath.startsWith(rootAbs + path.sep) || absPath === rootAbs;
  });
}

/** Get all files for a list of root names (or all roots if empty). */
function getFiles(roots: RootName[]): string[] {
  const selected = roots.length > 0 ? roots : ([...ALL_ROOTS] as RootName[]);
  return selected.flatMap((r) => walkDir(path.join(WORKSPACE_ROOT, r)));
}

/** Build a simple tree string for a directory. */
function buildTree(dir: string, prefix = ""): string {
  if (!fs.existsSync(dir)) return `${prefix}(not found)`;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const lines: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    if (entry.isDirectory()) {
      lines.push(`${prefix}${connector}${entry.name}/`);
      lines.push(buildTree(path.join(dir, entry.name), childPrefix));
    } else {
      lines.push(`${prefix}${connector}${entry.name}`);
    }
  }
  return lines.filter(Boolean).join("\n");
}

function err(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true as const };
}

// ─── Registration ─────────────────────────────────────────────────────────────

export function registerManifestTools(server: McpServer): void {

  // ── manifest_list ──────────────────────────────────────────────────────────
  server.tool(
    "manifest_list",
    [
      "List all files inside the workspace's knowledge and planning folders.",
      `Covered roots: ${ALL_ROOTS.join(", ")}.`,
      "Returns workspace-relative paths sorted alphabetically.",
      "Optionally filter to one or more specific root folders.",
    ].join(" "),
    {
      roots: z
        .array(RootSchema)
        .optional()
        .default([])
        .describe(
          `Limit results to these root folders. Leave empty to list all roots. Valid values: ${ALL_ROOTS.join(", ")}.`
        ),
      extension: z
        .string()
        .optional()
        .describe(
          'Only include files with this extension, e.g. ".md", ".json". Include the leading dot.'
        ),
    },
    async ({ roots, extension }) => {
      const files = getFiles((roots ?? []) as RootName[]);
      const filtered = extension
        ? files.filter((f) => f.toLowerCase().endsWith(extension.toLowerCase()))
        : files;

      if (filtered.length === 0) {
        return {
          content: [{ type: "text", text: "No files found matching the criteria." }],
        };
      }

      const lines = filtered
        .map(relative)
        .sort()
        .map((p) => `• ${p}`);
      return {
        content: [
          {
            type: "text",
            text: `${filtered.length} file(s):\n${lines.join("\n")}`,
          },
        ],
      };
    }
  );

  // ── manifest_read ──────────────────────────────────────────────────────────
  server.tool(
    "manifest_read",
    [
      "Read the full contents of a file inside the knowledge/planning folders.",
      "The path must be workspace-relative (e.g. '.knowledge/map.json').",
      "Only files inside the covered roots are accessible.",
    ].join(" "),
    {
      path: z
        .string()
        .min(1)
        .describe(
          "Workspace-relative path to the file. Examples: '.knowledge/map.json', '.standards/checklist_publish.md'."
        ),
      start_line: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("1-based line number to start reading from."),
      end_line: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("1-based line number to stop reading at (inclusive)."),
    },
    async ({ path: userPath, start_line, end_line }) => {
      const resolved = safeResolve(userPath);
      if (!resolved) return err("Path is outside the workspace root.");
      if (!isAllowedPath(resolved)) {
        return err(
          `Path "${userPath}" is not inside a covered root folder. Allowed: ${ALL_ROOTS.join(", ")}.`
        );
      }
      if (!fs.existsSync(resolved)) return err(`File not found: ${userPath}`);
      if (!fs.statSync(resolved).isFile()) return err(`"${userPath}" is a directory, not a file.`);

      let content = fs.readFileSync(resolved, "utf-8");

      if (start_line !== undefined || end_line !== undefined) {
        const lines = content.split("\n");
        const s = (start_line ?? 1) - 1;
        const e = end_line !== undefined ? end_line : lines.length;
        content = lines.slice(s, e).join("\n");
      }

      return {
        content: [
          {
            type: "text",
            text: `=== ${relative(resolved)} ===\n\n${content}`,
          },
        ],
      };
    }
  );

  // ── manifest_search ────────────────────────────────────────────────────────
  server.tool(
    "manifest_search",
    [
      "Full-text search across all files in the knowledge and planning folders.",
      "Returns each matching line with its file path and 1-based line number.",
      "Search is case-insensitive by default.",
    ].join(" "),
    {
      query: z
        .string()
        .min(1)
        .describe("Text to search for. Plain text or a JavaScript regex pattern."),
      roots: z
        .array(RootSchema)
        .optional()
        .default([])
        .describe("Limit search to these root folders. Leave empty to search all roots."),
      is_regex: z
        .boolean()
        .optional()
        .default(false)
        .describe("Treat query as a regex pattern (JavaScript syntax)."),
      case_sensitive: z
        .boolean()
        .optional()
        .default(false)
        .describe("Make the search case-sensitive."),
      extension: z
        .string()
        .optional()
        .describe('Only search files with this extension (e.g. ".md", ".json").'),
      max_results: z
        .number()
        .int()
        .positive()
        .optional()
        .default(50)
        .describe("Maximum number of matching lines to return (default 50)."),
    },
    async ({ query, roots, is_regex, case_sensitive, extension, max_results }) => {
      const files = getFiles((roots ?? []) as RootName[]);
      const filtered = extension
        ? files.filter((f) => f.toLowerCase().endsWith(extension.toLowerCase()))
        : files;

      let pattern: RegExp;
      try {
        const flags = case_sensitive ? "g" : "gi";
        pattern = is_regex ? new RegExp(query, flags) : new RegExp(escapeRegex(query), flags);
      } catch {
        return err(`Invalid regex: ${query}`);
      }

      const limit = Math.min(max_results ?? 50, 500);
      const matches: string[] = [];

      outer: for (const file of filtered) {
        let text: string;
        try {
          text = fs.readFileSync(file, "utf-8");
        } catch {
          continue;
        }
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          pattern.lastIndex = 0;
          if (pattern.test(lines[i])) {
            matches.push(`${relative(file)}:${i + 1}:  ${lines[i].trim()}`);
            if (matches.length >= limit) break outer;
          }
        }
      }

      if (matches.length === 0) {
        return { content: [{ type: "text", text: `No matches for "${query}".` }] };
      }

      const header = `${matches.length} match(es) for "${query}"${matches.length >= limit ? ` (limit ${limit} reached)` : ""}:`;
      return {
        content: [{ type: "text", text: `${header}\n\n${matches.join("\n")}` }],
      };
    }
  );

  // ── manifest_tree ──────────────────────────────────────────────────────────
  server.tool(
    "manifest_tree",
    "Show a directory tree of the knowledge and planning folders.",
    {
      roots: z
        .array(RootSchema)
        .optional()
        .default([])
        .describe("Roots to show. Leave empty for all."),
    },
    async ({ roots }) => {
      const selected: RootName[] =
        (roots ?? []).length > 0 ? (roots as RootName[]) : ([...ALL_ROOTS] as RootName[]);

      const sections = selected.map((r) => {
        const dir = path.join(WORKSPACE_ROOT, r);
        const tree = buildTree(dir, "  ");
        return `${r}/\n${tree || "  (empty)"}`;
      });

      return { content: [{ type: "text", text: sections.join("\n\n") }] };
    }
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
