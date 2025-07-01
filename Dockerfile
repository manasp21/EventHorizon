FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY src/ ./src/
COPY README.md ./

# Build the project
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Set environment
ENV NODE_ENV=production

# Expose no ports (MCP uses stdio)
# Set user for security
USER node

# Start the MCP server
ENTRYPOINT ["node", "dist/index.js"]
