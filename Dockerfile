FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including curl for health checks
RUN npm ci --ignore-scripts

# Copy source code
COPY src/ ./src/
COPY README.md ./

# Build the project
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose HTTP port for Smithery
EXPOSE 8000

# Add health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set user for security (but after installing packages)
USER node

# Start the HTTP MCP server for Smithery
CMD ["node", "dist/http_server.js"]
