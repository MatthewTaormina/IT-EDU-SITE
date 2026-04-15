import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { evaluate, format as mathFormat } from "mathjs";

/**
 * Registers expression evaluation tools on the MCP server.
 *
 * Tools:
 *  - eval_expression  : evaluates any mathjs-supported expression
 *  - eval_expressions : evaluates an array of expressions in one call
 */
export function registerExpressionTools(server: McpServer): void {
  // ─── Single expression ───────────────────────────────────────────────────
  server.tool(
    "eval_expression",
    [
      "Safely evaluate a mathematical expression using mathjs.",
      "Supports arithmetic (+/-/*/÷/^), algebra, trig (sin/cos/tan/…), log/exp,",
      "unit conversions (e.g. '1 inch to cm'), matrix ops, and complex numbers.",
      "Returns the result as a formatted string.",
    ].join(" "),
    {
      expression: z
        .string()
        .min(1)
        .describe(
          "The expression to evaluate. Examples: '2^10', 'sin(pi/6)', '(16 * 1.5) rem', '1 inch to cm'"
        ),
      precision: z
        .number()
        .int()
        .min(1)
        .max(64)
        .optional()
        .default(14)
        .describe("Significant digits in the result (default 14)."),
    },
    async ({ expression, precision }) => {
      try {
        const result = evaluate(expression);
        const text = formatResult(result, precision ?? 14);
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${errorMessage(err)}` }],
          isError: true,
        };
      }
    }
  );

  // ─── Batch expressions ────────────────────────────────────────────────────
  server.tool(
    "eval_expressions",
    "Evaluate multiple mathematical expressions in a single call. Returns each result on its own line prefixed by the original expression.",
    {
      expressions: z
        .array(z.string().min(1))
        .min(1)
        .max(50)
        .describe("Array of expression strings to evaluate."),
      precision: z
        .number()
        .int()
        .min(1)
        .max(64)
        .optional()
        .default(14)
        .describe("Significant digits for all results (default 14)."),
    },
    async ({ expressions, precision }) => {
      const lines: string[] = [];
      for (const expr of expressions) {
        try {
          const result = evaluate(expr);
          lines.push(`${expr}  =  ${formatResult(result, precision ?? 14)}`);
        } catch (err) {
          lines.push(`${expr}  ⚠  ${errorMessage(err)}`);
        }
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatResult(result: unknown, precision: number): string {
  if (result === null || result === undefined) return "null";
  if (typeof result === "boolean") return String(result);
  if (typeof result === "string") return result;
  try {
    return mathFormat(result as Parameters<typeof mathFormat>[0], {
      precision,
    });
  } catch {
    return String(result);
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
