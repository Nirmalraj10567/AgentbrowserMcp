import { z } from "zod";

export const browserOpenSchema = {
  url: z.string().describe("URL to navigate to"),
  session: z.string().optional().describe("Session name for isolation"),
};

export const browserClickSchema = {
  selector: z.string().describe("CSS selector or @ref from snapshot"),
  session: z.string().optional().describe("Session name"),
};

export const browserFillSchema = {
  selector: z.string().describe("CSS selector or @ref"),
  text: z.string().describe("Text to fill"),
  session: z.string().optional().describe("Session name"),
};

export const browserSnapshotSchema = {
  session: z.string().optional().describe("Session name"),
};

export const browserScreenshotSchema = {
  path: z.string().optional().describe("Output file path"),
  full: z.boolean().optional().describe("Full page screenshot"),
  session: z.string().optional().describe("Session name"),
};

export const browserReadSchema = {
  url: z.string().optional().describe("URL to fetch (omit for active tab)"),
  filter: z.string().optional().describe("Filter content sections"),
  session: z.string().optional().describe("Session name"),
};

export const browserEvalSchema = {
  script: z.string().describe("JavaScript to execute"),
  session: z.string().optional().describe("Session name"),
};

export const browserWaitSchema = {
  selector: z.string().optional().describe("Wait for element"),
  text: z.string().optional().describe("Wait for text"),
  url: z.string().optional().describe("Wait for URL pattern"),
  timeout: z.number().optional().describe("Timeout in ms"),
  session: z.string().optional().describe("Session name"),
};

export const browserCloseSchema = {
  session: z.string().optional().describe("Session name"),
  all: z.boolean().optional().describe("Close all sessions"),
};

export const browserNavigateSchema = {
  direction: z.enum(["back", "forward", "reload"]).describe("Navigation direction"),
  session: z.string().optional().describe("Session name"),
};

export const browserTypeSchema = {
  selector: z.string().describe("CSS selector or @ref"),
  text: z.string().describe("Text to type"),
  session: z.string().optional().describe("Session name"),
};

export const browserPressSchema = {
  key: z.string().describe("Key to press (Enter, Tab, Control+a, etc)"),
  session: z.string().optional().describe("Session name"),
};

export const browserGetSchema = {
  property: z.enum(["text", "html", "value", "url", "title"]).describe("Property to get"),
  selector: z.string().optional().describe("CSS selector (required for text/html/value)"),
  session: z.string().optional().describe("Session name"),
};

export const browserTabSchema = {
  action: z.enum(["list", "new", "close", "switch"]).describe("Tab action"),
  url: z.string().optional().describe("URL for new tab"),
  target: z.string().optional().describe("Tab id or label"),
  label: z.string().optional().describe("Label for new tab"),
  session: z.string().optional().describe("Session name"),
};

export const browserNetworkSchema = {
  action: z.enum(["requests", "route", "unroute", "detail", "har_start", "har_stop"]).describe("Network action"),
  url: z.string().optional().describe("URL pattern for route/unroute"),
  abort: z.boolean().optional().describe("Block requests"),
  body: z.string().optional().describe("Mock response body"),
  filter: z.string().optional().describe("Filter requests by text"),
  type: z.string().optional().describe("Filter by resource type (xhr, fetch, script, etc)"),
  method: z.string().optional().describe("Filter by HTTP method (GET, POST, etc)"),
  status: z.string().optional().describe("Filter by status (200, 2xx, 4xx, etc)"),
  requestId: z.string().optional().describe("Request ID for detail view"),
  content: z.enum(["all", "none", "text"]).optional().describe("HAR content embedding"),
  session: z.string().optional().describe("Session name"),
};

export const browserCookieSchema = {
  action: z.enum(["list", "set", "clear"]).describe("Cookie action"),
  name: z.string().optional().describe("Cookie name"),
  value: z.string().optional().describe("Cookie value"),
  session: z.string().optional().describe("Session name"),
};

export const browserStorageSchema = {
  type: z.enum(["local", "session"]).describe("Storage type"),
  action: z.enum(["list", "get", "set", "clear"]).describe("Storage action"),
  key: z.string().optional().describe("Storage key"),
  value: z.string().optional().describe("Storage value"),
  session: z.string().optional().describe("Session name"),
};

export const browserDialogSchema = {
  action: z.enum(["accept", "dismiss", "status"]).describe("Dialog action"),
  text: z.string().optional().describe("Prompt text for accept"),
  session: z.string().optional().describe("Session name"),
};

export const browserScrollSchema = {
  direction: z.enum(["up", "down", "left", "right"]).describe("Scroll direction"),
  pixels: z.number().optional().describe("Pixels to scroll"),
  selector: z.string().optional().describe("Element to scroll"),
  session: z.string().optional().describe("Session name"),
};

export const browserHoverSchema = {
  selector: z.string().describe("CSS selector or @ref"),
  session: z.string().optional().describe("Session name"),
};

export const browserSelectSchema = {
  selector: z.string().describe("CSS selector or @ref"),
  value: z.string().describe("Option value"),
  session: z.string().optional().describe("Session name"),
};

export const browserFindSchema = {
  type: z.enum(["role", "text", "label", "placeholder", "alt", "title", "testid"]).describe("Find method"),
  value: z.string().describe("Value to find"),
  action: z.enum(["click", "fill", "check", "hover", "text"]).describe("Action to perform"),
  name: z.string().optional().describe("Accessible name filter"),
  session: z.string().optional().describe("Session name"),
};

export const browserSetSchema = {
  setting: z.enum(["viewport", "device", "geo", "offline", "headers", "media"]).describe("Setting to change"),
  value: z.string().describe("Setting value"),
  session: z.string().optional().describe("Session name"),
};

export const browserStateSchema = {
  action: z.enum(["save", "load", "list"]).describe("State action"),
  path: z.string().optional().describe("File path for save/load"),
  session: z.string().optional().describe("Session name"),
};

export const browserStreamSchema = {
  action: z.enum(["enable", "disable", "status"]).describe("Stream action"),
  port: z.number().optional().describe("WebSocket port"),
  session: z.string().optional().describe("Session name"),
};

export const browserConsoleSchema = {
  action: z.enum(["list", "clear", "errors", "errors_clear"]).describe("Console action"),
  json: z.boolean().optional().describe("JSON output"),
  session: z.string().optional().describe("Session name"),
};

export const browserTraceSchema = {
  action: z.enum(["start", "stop"]).describe("Trace action"),
  path: z.string().optional().describe("Output file path"),
  session: z.string().optional().describe("Session name"),
};

export const browserFrameSchema = {
  selector: z.string().optional().describe("Frame selector (omit for main)"),
  session: z.string().optional().describe("Session name"),
};

export const browserDialogAutoSchema = {
  enabled: z.boolean().describe("Enable auto-dialog handling"),
  session: z.string().optional().describe("Session name"),
};

export const browserBatchSchema = {
  commands: z.array(z.array(z.any())).describe("Array of commands to execute"),
  bail: z.boolean().optional().describe("Stop on first error"),
};

export const browserReactSchema = {
  action: z.enum(["tree", "inspect", "renders", "suspense"]).describe("React action"),
  fiberId: z.string().optional().describe("Fiber ID for inspect"),
  json: z.boolean().optional().describe("JSON output"),
  session: z.string().optional().describe("Session name"),
};

export const browserVitalsSchema = {
  url: z.string().optional().describe("URL to measure"),
  json: z.boolean().optional().describe("JSON output"),
  session: z.string().optional().describe("Session name"),
};

export const browserA11ySchema = {
  url: z.string().optional().describe("URL to audit"),
  tags: z.string().optional().describe("axe tags filter"),
  selector: z.string().optional().describe("Scope to element"),
  json: z.boolean().optional().describe("JSON output"),
  session: z.string().optional().describe("Session name"),
};

export const browserProfileSchema = {
  action: z.enum(["list", "use"]).describe("Profile action"),
  name: z.string().optional().describe("Profile name"),
};

export const browserSessionSchema = {
  action: z.enum(["list", "current", "info", "id"]).describe("Session action"),
  scope: z.string().optional().describe("Session scope"),
  prefix: z.string().optional().describe("Session prefix"),
};

export const browserSkillsSchema = {
  action: z.enum(["list", "get"]).describe("Skills action"),
  name: z.string().optional().describe("Skill name"),
  all: z.boolean().optional().describe("Get all skills"),
};

export const browserInstallSchema = {
  deps: z.boolean().optional().describe("Install system deps"),
};

export const browserDoctorSchema = {
  fix: z.boolean().optional().describe("Run destructive repairs"),
  offline: z.boolean().optional().describe("Skip network probes"),
};

export const browserDiffSchema = {
  type: z.enum(["snapshot", "screenshot", "url"]).describe("Diff type"),
  baseline: z.string().optional().describe("Baseline file/URL"),
  target: z.string().optional().describe("Target URL"),
  selector: z.string().optional().describe("Scope to element"),
  json: z.boolean().optional().describe("JSON output"),
  session: z.string().optional().describe("Session name"),
};

export const browserChatSchema = {
  instruction: z.string().describe("Natural language instruction"),
  session: z.string().optional().describe("Session name"),
};
