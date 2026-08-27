# Production Dockerfile for agent-browser (vercel-labs/agent-browser) MCP Server on Render
FROM node:20-bookworm-slim

# Set environment
ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    PORT=5888 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    AGENT_BROWSER_SCREENSHOT_DIR=/app/screenshots \
    MCP_SCRIPT_PATH=/app/dist/index.js

# Install essential packages and full Playwright/Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    gnupg \
    ca-certificates \
    git \
    procps \
    xvfb \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    fonts-liberation \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Install official agent-browser globally & install its browser dependencies
RUN npm install -g agent-browser --unsafe-perm=true && \
    agent-browser install --with-deps || npx playwright install --with-deps chromium

# Create working directory
WORKDIR /app

# Copy package manifests first for optimal Docker layer caching
COPY package*.json tsconfig.json ./

# Install project dependencies
RUN npm install

# Copy source code and build TypeScript project
COPY . .
RUN npm run build

# Ensure screenshot and session directories exist
RUN mkdir -p /app/screenshots

# Render port mapping
EXPOSE 5888

# Start the MCP server
CMD ["node", "server.js"]
