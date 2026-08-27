# Agent Browser MCP Server

An MCP (Model Context Protocol) server that wraps [agent-browser](https://github.com/vercel-labs/agent-browser) to provide browser automation tools for AI assistants. Supports both stdio and HTTP/SSE transports.

## Features

40+ browser automation tools including:

| Category | Tools |
|----------|-------|
| **Navigation** | `browser_open`, `browser_navigate`, `browser_close` |
| **Interaction** | `browser_click`, `browser_fill`, `browser_type`, `browser_press`, `browser_hover`, `browser_select`, `browser_scroll` |
| **Inspection** | `browser_snapshot`, `browser_screenshot`, `browser_read`, `browser_get`, `browser_find` |
| **Execution** | `browser_eval`, `browser_batch`, `browser_wait` |
| **State** | `browser_cookie`, `browser_storage`, `browser_state`, `browser_session`, `browser_tab` |
| **DevTools** | `browser_console`, `browser_trace`, `browser_network`, `browser_react`, `browser_vitals`, `browser_a11y` |
| **Advanced** | `browser_frame`, `browser_stream`, `browser_dialog`, `browser_diff`, `browser_chat`, `browser_profile` |
| **System** | `browser_install`, `browser_doctor`, `browser_skills`, `browser_set` |

## Installation

```bash
npm install
npm run build
```

## Usage

### Stdio Mode (for local MCP clients)

```bash
npm run dev
```

### HTTP/SSE Mode (for remote access)

```bash
node server.js
```

The server listens on port `5888` by default.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5888` | Server port |
| `AGENT_BROWSER_SCREENSHOT_DIR` | `./screenshots` | Directory for saved screenshots |
| `BASE_URL` | `/screenshots` | Public URL path for screenshots |
| `MCP_SCRIPT_PATH` | `./dist/index.js` | Path to compiled MCP server |
| `ENABLE_HTTPS` | `false` | Enable HTTPS with Let's Encrypt certs |
| `CERT_PATH` | `/etc/letsencrypt/live/test2.infinitrocyber.com` | SSL certificate path |

## Docker

```bash
docker build -t agentbrowser-mcp .
docker run -p 5888:5888 agentbrowser-mcp
```

## Deployment

### Render

The `render.yaml` blueprint is included. Deploy directly from the repo.

### PM2

```bash
pm2 start ecosystem.config.cjs
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/mcp` | SSE connection (creates new session) |
| POST | `/mcp` | JSON-RPC request |
| GET | `/` | Service info |

## Client Configuration

### Claude Desktop

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

### Remote HTTP Client

```json
{
  "mcpServers": {
    "agent-browser": {
      "url": "https://your-domain.com/mcp"
    }
  }
}
```

## License

MIT
