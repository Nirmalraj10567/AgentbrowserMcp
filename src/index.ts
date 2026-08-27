import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleBrowserTool } from "./tools/browser.js";
import {
  browserOpenSchema,
  browserClickSchema,
  browserFillSchema,
  browserSnapshotSchema,
  browserScreenshotSchema,
  browserReadSchema,
  browserEvalSchema,
  browserWaitSchema,
  browserCloseSchema,
  browserNavigateSchema,
  browserTypeSchema,
  browserPressSchema,
  browserGetSchema,
  browserTabSchema,
  browserNetworkSchema,
  browserCookieSchema,
  browserStorageSchema,
  browserDialogSchema,
  browserScrollSchema,
  browserHoverSchema,
  browserSelectSchema,
  browserFindSchema,
  browserSetSchema,
  browserStateSchema,
  browserStreamSchema,
  browserConsoleSchema,
  browserTraceSchema,
  browserFrameSchema,
  browserBatchSchema,
  browserReactSchema,
  browserVitalsSchema,
  browserA11ySchema,
  browserProfileSchema,
  browserSessionSchema,
  browserSkillsSchema,
  browserInstallSchema,
  browserDoctorSchema,
  browserDiffSchema,
  browserChatSchema,
} from "./tools/schemas.js";

const TOOLS = [
  { name: "browser_open", description: "Open URL in browser", inputSchema: browserOpenSchema },
  { name: "browser_click", description: "Click element by selector or @ref", inputSchema: browserClickSchema },
  { name: "browser_fill", description: "Clear and fill input", inputSchema: browserFillSchema },
  { name: "browser_type", description: "Type text into input", inputSchema: browserTypeSchema },
  { name: "browser_press", description: "Press key (Enter, Tab, etc)", inputSchema: browserPressSchema },
  { name: "browser_snapshot", description: "Get accessibility tree with refs", inputSchema: browserSnapshotSchema },
  { name: "browser_screenshot", description: "Take screenshot", inputSchema: browserScreenshotSchema },
  { name: "browser_read", description: "Read page content or fetch URL", inputSchema: browserReadSchema },
  { name: "browser_eval", description: "Execute JavaScript", inputSchema: browserEvalSchema },
  { name: "browser_wait", description: "Wait for element/text/URL", inputSchema: browserWaitSchema },
  { name: "browser_close", description: "Close browser", inputSchema: browserCloseSchema },
  { name: "browser_navigate", description: "Back/forward/reload", inputSchema: browserNavigateSchema },
  { name: "browser_get", description: "Get text/html/value/url/title", inputSchema: browserGetSchema },
  { name: "browser_tab", description: "Manage tabs", inputSchema: browserTabSchema },
  { name: "browser_network", description: "Network requests/routes", inputSchema: browserNetworkSchema },
  { name: "browser_cookie", description: "Manage cookies", inputSchema: browserCookieSchema },
  { name: "browser_storage", description: "Manage localStorage/sessionStorage", inputSchema: browserStorageSchema },
  { name: "browser_dialog", description: "Handle dialogs", inputSchema: browserDialogSchema },
  { name: "browser_scroll", description: "Scroll page", inputSchema: browserScrollSchema },
  { name: "browser_hover", description: "Hover element", inputSchema: browserHoverSchema },
  { name: "browser_select", description: "Select dropdown option", inputSchema: browserSelectSchema },
  { name: "browser_find", description: "Find elements semantically", inputSchema: browserFindSchema },
  { name: "browser_set", description: "Set viewport/device/geo/media", inputSchema: browserSetSchema },
  { name: "browser_state", description: "Save/load auth state", inputSchema: browserStateSchema },
  { name: "browser_stream", description: "WebSocket streaming", inputSchema: browserStreamSchema },
  { name: "browser_console", description: "View/clear console logs and errors", inputSchema: browserConsoleSchema },
  { name: "browser_trace", description: "Record trace", inputSchema: browserTraceSchema },
  { name: "browser_frame", description: "Switch frame", inputSchema: browserFrameSchema },
  { name: "browser_batch", description: "Execute multiple commands", inputSchema: browserBatchSchema },
  { name: "browser_react", description: "React devtools", inputSchema: browserReactSchema },
  { name: "browser_vitals", description: "Web Vitals metrics", inputSchema: browserVitalsSchema },
  { name: "browser_a11y", description: "Accessibility audit", inputSchema: browserA11ySchema },
  { name: "browser_profile", description: "Chrome profiles", inputSchema: browserProfileSchema },
  { name: "browser_session", description: "Session management", inputSchema: browserSessionSchema },
  { name: "browser_skills", description: "List/get skills", inputSchema: browserSkillsSchema },
  { name: "browser_install", description: "Install Chrome", inputSchema: browserInstallSchema },
  { name: "browser_doctor", description: "Diagnose install", inputSchema: browserDoctorSchema },
  { name: "browser_diff", description: "Diff snapshots/screenshots", inputSchema: browserDiffSchema },
  { name: "browser_chat", description: "Natural language browser control", inputSchema: browserChatSchema },
];

const server = new Server(
  { name: "agent-browser", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: {
      type: "object" as const,
      properties: Object.fromEntries(
        Object.entries(t.inputSchema).map(([k, v]) => [
          k,
          {
            type: "string",
            description: v.description,
            ...(v._def?.typeName === "ZodOptional" ? {} : {}),
          },
        ])
      ),
      required: Object.entries(t.inputSchema)
        .filter(([, v]) => v._def?.typeName !== "ZodOptional")
        .map(([k]) => k),
    },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleBrowserTool(name, args || {});
});

const transport = new StdioServerTransport();
await server.connect(transport);
