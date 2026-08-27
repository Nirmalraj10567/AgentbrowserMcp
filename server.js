import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";

const PORT = process.env.PORT || 5888;
const CERT_PATH = process.env.CERT_PATH || "/etc/letsencrypt/live/test2.infinitrocyber.com";
const MCP_SCRIPT_PATH = process.env.MCP_SCRIPT_PATH || path.resolve(process.cwd(), "dist/index.js");
const BASE_HOST = process.env.BASE_HOST || `localhost:${PORT}`;

const sessions = new Map();

function createMcpProcess(sessionId) {
  const proc = spawn("node", [MCP_SCRIPT_PATH], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env },
  });

  let buffer = "";
  const pendingRequests = new Map();
  let initialized = false;

  proc.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          if (response.id !== undefined && pendingRequests.has(response.id)) {
            pendingRequests.get(response.id)(response);
            pendingRequests.delete(response.id);
          }
        } catch (e) {}
      }
    }
  });

  proc.stderr.on("data", (data) => {
    console.error(`MCP stderr: ${data}`);
  });

  proc.on("error", (err) => {
    console.error("MCP process error:", err);
  });

  proc.on("exit", (code) => {
    console.log(`MCP process ${sessionId} exited with code ${code}`);
    for (const [id, reject] of pendingRequests) {
      reject(new Error("MCP process exited"));
    }
    pendingRequests.clear();
    sessions.delete(sessionId);
  });

  return { proc, pendingRequests, initialized };
}

function sendRequest(sessionId, request) {
  return new Promise((resolve, reject) => {
    const session = sessions.get(sessionId);
    if (!session) {
      reject(new Error("Session not found"));
      return;
    }

    const requestId = request.id;
    if (requestId === undefined) {
      // Notification - no response expected
      session.proc.stdin.write(JSON.stringify(request) + "\n");
      resolve(null);
      return;
    }

    const timeout = setTimeout(() => {
      session.pendingRequests.delete(requestId);
      reject(new Error(`Timeout for request ${requestId}`));
    }, 30000);

    session.pendingRequests.set(requestId, (response) => {
      clearTimeout(timeout);
      resolve(response);
    });

    session.proc.stdin.write(JSON.stringify(request) + "\n");
  });
}

const requestHandler = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.url?.startsWith("/mcp")) {
    const protocol = req.socket.encrypted ? "https" : "http";
    const url = new URL(req.url, `${protocol}://${req.headers.host || BASE_HOST}`);
    let sessionId = url.searchParams.get("sessionId") || req.headers["mcp-session-id"];

    // GET - SSE connection
    if (req.method === "GET") {
      sessionId = crypto.randomUUID();
      const session = createMcpProcess(sessionId);
      sessions.set(sessionId, session);

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Mcp-Session-Id": sessionId,
      });

      // Send session ID
      res.write(`event: session\ndata: ${JSON.stringify({ sessionId })}\n\n`);

      // Wait for process to be ready
      await new Promise((r) => setTimeout(r, 500));

      // Initialize
      try {
        const initResponse = await sendRequest(sessionId, {
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2025-11-25",
            capabilities: {},
            clientInfo: { name: "chatgpt-bridge", version: "1.0" },
          },
          id: 1,
        });

        res.write(`event: message\ndata: ${JSON.stringify(initResponse)}\n\n`);

        // Send initialized notification
        await sendRequest(sessionId, {
          jsonrpc: "2.0",
          method: "notifications/initialized",
        });

        session.initialized = true;
      } catch (e) {
        console.error("Init error:", e.message);
        res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`);
      }

      req.on("close", () => {
        const s = sessions.get(sessionId);
        if (s) {
          s.proc.kill();
          sessions.delete(sessionId);
        }
      });

      return;
    }

    // POST - JSON-RPC request
    if (req.method === "POST") {
      if (!sessionId || !sessions.has(sessionId)) {
        // Create new session if needed
        sessionId = crypto.randomUUID();
        const session = createMcpProcess(sessionId);
        sessions.set(sessionId, session);
        await new Promise((r) => setTimeout(r, 500));

        // Initialize
        try {
          await sendRequest(sessionId, {
            jsonrpc: "2.0",
            method: "initialize",
            params: {
              protocolVersion: "2025-11-25",
              capabilities: {},
              clientInfo: { name: "chatgpt-bridge", version: "1.0" },
            },
            id: 1,
          });
          await sendRequest(sessionId, {
            jsonrpc: "2.0",
            method: "notifications/initialized",
          });
          sessions.get(sessionId).initialized = true;
        } catch (e) {
          console.error("Auto-init error:", e.message);
        }
      }

      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const request = JSON.parse(body);
          const response = await sendRequest(sessionId, request);
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Mcp-Session-Id": sessionId,
          });
          res.end(JSON.stringify(response));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "ok",
      service: "agent-browser-mcp",
      mcp: `/mcp`,
    })
  );
};

let server;
const hasSslCerts = fs.existsSync(`${CERT_PATH}/privkey.pem`) && fs.existsSync(`${CERT_PATH}/fullchain.pem`);

if (hasSslCerts && process.env.ENABLE_HTTPS === "true") {
  server = https.createServer(
    {
      key: fs.readFileSync(`${CERT_PATH}/privkey.pem`),
      cert: fs.readFileSync(`${CERT_PATH}/fullchain.pem`),
    },
    requestHandler
  );
  console.log(`Starting HTTPS server on port ${PORT}...`);
} else {
  server = http.createServer(requestHandler);
  console.log(`Starting HTTP server on port ${PORT}...`);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${PORT}`);
});
