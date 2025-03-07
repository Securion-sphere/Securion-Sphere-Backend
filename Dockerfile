# Base stage (Common dependencies)
FROM node:lts-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl
RUN npm install -g corepack

# Install system dependencies only when needed
FROM base AS dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ "$NODE_ENV" = "production" ]; then \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production --ignore-scripts; \
    elif [ -f package-lock.json ]; then npm ci --production --ignore-scripts; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile --production --ignore-scripts; \
    else echo "Lockfile not found." && exit 1; \
    fi; \
    else \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi; \
    fi

# Build stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production stage
FROM base AS prod
ENV NODE_ENV=production
USER node
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]

# Development stage
FROM base AS dev
ENV NODE_ENV=development
USER node
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]
