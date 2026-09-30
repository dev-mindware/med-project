# =======================================================
# Multi-stage Dockerfile for NestJS API (MINDGEST Standard)
# =======================================================

# Stage 1: Base & Tooling
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# Stage 2: Dependencies & Builder
FROM base AS builder
WORKDIR /app

# Copy dependency configuration and schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma:generate

# Copy source code and build config
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Build production bundle
RUN pnpm build

# Stage 3: Production Dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --prod --frozen-lockfile
RUN pnpm prisma:generate

# Stage 4: Production Runner
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl dumb-init curl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3009

# Set non-root user
USER node

# Copy production artifacts
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 3009

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT}/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "./docker-entrypoint.sh"]
