module.exports = {
  apps: [
    {
      name: "agentbrowser-mcp",
      script: "node",
      args: "/var/www/agentbrowser/dist/index.js",
      cwd: "/var/www/agentbrowser",
      env: {
        NODE_ENV: "production",
        AGENT_BROWSER_SCREENSHOT_DIR: "/var/www/agentbrowser/screenshots",
        AGENT_BROWSER_SESSION: "default",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      error_file: "/var/www/agentbrowser/logs/error.log",
      out_file: "/var/www/agentbrowser/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "agentbrowser-https",
      script: "node",
      args: "/var/www/agentbrowser/server.js",
      cwd: "/var/www/agentbrowser",
      env: {
        NODE_ENV: "production",
        PORT: 5888,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "128M",
      error_file: "/var/www/agentbrowser/logs/https-error.log",
      out_file: "/var/www/agentbrowser/logs/https-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
