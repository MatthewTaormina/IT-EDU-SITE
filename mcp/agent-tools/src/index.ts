/**
 * IT EDU SITE — Agent Tools MCP Server
 *
 * Provides a suite of tools for agent workflows:
 *
 *   Expression tools   eval_expression, eval_expressions
 *   Box model tools    box_model_calc
 *   Virtual DOM tools  vdom_upsert, vdom_remove, vdom_move,
 *                      vdom_get_tree, vdom_render_html,
 *                      vdom_list_sessions, vdom_clear
 *   Wireframe tools    wireframe_create, wireframe_add_element,
 *                      wireframe_update_element, wireframe_remove_element,
 *                      wireframe_get, wireframe_render_svg,
 *                      wireframe_list, wireframe_clear
 *   Manifest tools     manifest_list, manifest_read, manifest_search,
 *                      manifest_tree
 *
 * Transport: stdio (consumed by VS Code Copilot and compatible MCP clients)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerExpressionTools } from "./tools/expression.js";
import { registerBoxModelTools } from "./tools/box-model.js";
import { registerVDomTools } from "./tools/vdom.js";
import { registerWireframeTools } from "./tools/wireframe.js";
import { registerManifestTools } from "./tools/manifests.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "agent-tools",
    version: "1.0.0",
  });

  registerExpressionTools(server);
  registerBoxModelTools(server);
  registerVDomTools(server);
  registerWireframeTools(server);
  registerManifestTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // All non-protocol output must go to stderr to keep stdout clean for MCP
  process.stderr.write("[agent-tools] MCP server started\n");
}

main().catch((err) => {
  process.stderr.write(`[agent-tools] Fatal error: ${err}\n`);
  process.exit(1);
});
