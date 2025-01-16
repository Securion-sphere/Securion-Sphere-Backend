FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat curl

WORKDIR /app

FROM base AS dependencies
COPY --chown=node:node package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

FROM base AS prod-dependencies
COPY --chown=node:node package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production --ignore-scripts; \
    elif [ -f package-lock.json ]; then npm ci --production --ignore-scripts; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile --production --ignore-scripts; \
    else echo "Lockfile not found." && exit 1; \
    fi

FROM base AS builder

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

FROM base AS runner
USER node
COPY --chown=node:node --from=prod-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]
