import { execSync } from "child_process";
import { mkdirSync, copyFileSync, existsSync } from "fs";

import path from "path";

const SHARED_DIR = process.env.AGENT_BROWSER_SCREENSHOT_DIR || path.resolve(process.cwd(), "screenshots");
const BASE_URL = process.env.BASE_URL || "/screenshots";

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function runAgentBrowser(args: string[], session?: string): string {
  const cmd = ["agent-browser"];
  if (session) cmd.push("--session", session);
  cmd.push(...args);

  try {
    return execSync(cmd.join(" "), {
      encoding: "utf-8",
      timeout: 30000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim() || "OK";
  } catch (error: any) {
    const stderr = error.stderr?.toString() || error.message;
    return `Error: ${stderr}`;
  }
}

function copyToShared(srcPath: string): string {
  ensureDir(SHARED_DIR);
  const filename = srcPath.split("/").pop() || `${Date.now()}.png`;
  const destPath = `${SHARED_DIR}/${filename}`;
  if (srcPath !== destPath) {
    copyFileSync(srcPath, destPath);
  }
  return `${BASE_URL}/${filename}`;
}

export function handleBrowserTool(name: string, args: Record<string, any>): any {
  const session = args.session;
  const text = (content: string) => ({
    content: [{ type: "text" as const, text: content || "OK" }],
  });

  switch (name) {
    case "browser_open":
      return text(runAgentBrowser(["open", args.url], session));

    case "browser_click":
      return text(runAgentBrowser(["click", args.selector], session));

    case "browser_fill":
      return text(runAgentBrowser(["fill", args.selector, args.text], session));

    case "browser_type":
      return text(runAgentBrowser(["type", args.selector, args.text], session));

    case "browser_press":
      return text(runAgentBrowser(["press", args.key], session));

    case "browser_snapshot":
      return text(runAgentBrowser(["snapshot"], session));

    case "browser_screenshot": {
      const cmd = ["screenshot"];
      if (args.full) cmd.push("--full");
      const timestamp = Date.now();
      const tempPath = `/tmp/screenshot-${timestamp}.png`;
      cmd.push(tempPath);
      const result = runAgentBrowser(cmd, session);
      const httpUrl = copyToShared(tempPath);
      return text(`${result}\nURL: ${httpUrl}`);
    }

    case "browser_read": {
      const cmd = ["read"];
      if (args.url) cmd.push(args.url);
      if (args.filter) cmd.push("--filter", args.filter);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_eval":
      return text(runAgentBrowser(["eval", args.script], session));

    case "browser_wait": {
      const cmd = ["wait"];
      if (args.selector) cmd.push(args.selector);
      if (args.text) cmd.push("--text", args.text);
      if (args.url) cmd.push("--url", args.url);
      if (args.timeout) cmd.push("--timeout", String(args.timeout));
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_close": {
      const cmd = ["close"];
      if (args.all) cmd.push("--all");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_navigate":
      return text(runAgentBrowser([args.direction], session));

    case "browser_get": {
      const cmd = ["get", args.property];
      if (args.selector) cmd.push(args.selector);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_tab": {
      const cmd = ["tab"];
      if (args.action === "new") {
        cmd.push("new");
        if (args.label) cmd.push("--label", args.label);
        if (args.url) cmd.push(args.url);
      } else if (args.action === "close") {
        cmd.push("close");
        if (args.target) cmd.push(args.target);
      } else if (args.action === "switch") {
        if (args.target) cmd.push(args.target);
      } else {
        cmd.push("list");
      }
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_network": {
      const cmd = ["network"];
      if (args.action === "route") {
        cmd.push("route", args.url || "*");
        if (args.abort) cmd.push("--abort");
        if (args.body) cmd.push("--body", args.body);
      } else if (args.action === "unroute") {
        cmd.push("unroute");
        if (args.url) cmd.push(args.url);
      } else if (args.action === "detail") {
        cmd.push("request", args.requestId || "");
      } else if (args.action === "har_start") {
        cmd.push("har", "start");
        if (args.content) cmd.push("--content", args.content);
      } else if (args.action === "har_stop") {
        cmd.push("har", "stop");
        if (args.path) cmd.push(args.path);
      } else {
        cmd.push("requests");
        if (args.filter) cmd.push("--filter", args.filter);
        if (args.type) cmd.push("--type", args.type);
        if (args.method) cmd.push("--method", args.method);
        if (args.status) cmd.push("--status", args.status);
      }
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_cookie": {
      const cmd = ["cookies"];
      if (args.action === "set") {
        cmd.push("set", args.name || "", args.value || "");
      } else if (args.action === "clear") {
        cmd.push("clear");
      }
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_storage": {
      const cmd = [args.type === "local" ? "storage" : "storage", args.type];
      if (args.action === "set") {
        cmd.push("set", args.key || "", args.value || "");
      } else if (args.action === "clear") {
        cmd.push("clear");
      } else if (args.action === "get" && args.key) {
        cmd.push(args.key);
      }
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_dialog": {
      const cmd = ["dialog", args.action];
      if (args.text) cmd.push(args.text);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_scroll": {
      const cmd = ["scroll", args.direction];
      if (args.pixels) cmd.push(String(args.pixels));
      if (args.selector) cmd.push("--selector", args.selector);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_hover":
      return text(runAgentBrowser(["hover", args.selector], session));

    case "browser_select":
      return text(runAgentBrowser(["select", args.selector, args.value], session));

    case "browser_find": {
      const cmd = ["find", args.type, args.value, args.action];
      if (args.name) cmd.push("--name", args.name);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_set": {
      const cmd = ["set", args.setting, args.value];
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_state": {
      const cmd = ["state", args.action];
      if (args.path) cmd.push(args.path);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_stream": {
      const cmd = ["stream", args.action];
      if (args.port) cmd.push("--port", String(args.port));
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_console": {
      const cmd = ["console"];
      if (args.action === "clear") cmd.push("--clear");
      else if (args.action === "errors") return text(runAgentBrowser(["errors"], session));
      else if (args.action === "errors_clear") return text(runAgentBrowser(["errors", "--clear"], session));
      if (args.json) cmd.push("--json");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_trace": {
      const cmd = ["trace", args.action];
      if (args.path) cmd.push(args.path);
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_frame": {
      const cmd = ["frame", args.selector || "main"];
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_batch": {
      const cmd = ["batch"];
      if (args.bail) cmd.push("--bail");
      args.commands?.forEach((c: any[]) => cmd.push(JSON.stringify(c)));
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_react": {
      const cmd = ["react", args.action];
      if (args.fiberId) cmd.push(args.fiberId);
      if (args.json) cmd.push("--json");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_vitals": {
      const cmd = ["vitals"];
      if (args.url) cmd.push(args.url);
      if (args.json) cmd.push("--json");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_a11y": {
      const cmd = ["a11y"];
      if (args.url) cmd.push(args.url);
      if (args.tags) cmd.push("--tags", args.tags);
      if (args.selector) cmd.push("--selector", args.selector);
      if (args.json) cmd.push("--json");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_profile": {
      const cmd = ["profiles"];
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_session": {
      const cmd = ["session"];
      if (args.action === "list") cmd.push("list");
      else if (args.action === "info") cmd.push("info", "--json");
      else if (args.action === "id") {
        cmd.push("id");
        if (args.scope) cmd.push("--scope", args.scope);
        if (args.prefix) cmd.push("--prefix", args.prefix);
      }
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_skills": {
      const cmd = ["skills"];
      if (args.action === "get" && args.name) {
        cmd.push("get", args.name);
        if (args.all) cmd.push("--all");
      }
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_install": {
      const cmd = ["install"];
      if (args.deps) cmd.push("--with-deps");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_doctor": {
      const cmd = ["doctor"];
      if (args.fix) cmd.push("--fix");
      if (args.offline) cmd.push("--offline", "--quick");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_diff": {
      const cmd = ["diff", args.type];
      if (args.baseline) cmd.push("--baseline", args.baseline);
      if (args.target) cmd.push(args.target);
      if (args.selector) cmd.push("--selector", args.selector);
      if (args.json) cmd.push("--json");
      return text(runAgentBrowser(cmd, session));
    }

    case "browser_chat": {
      const cmd = ["chat", args.instruction];
      return text(runAgentBrowser(cmd, session));
    }

    default:
      return { content: [{ type: "text" as const, text: `Unknown tool: ${name}` }] };
  }
}
