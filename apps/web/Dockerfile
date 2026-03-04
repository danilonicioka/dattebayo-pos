FROM node:22-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# In monorepos, we need all package.jsons to reconcile dependencies
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/core/package.json ./packages/core/

RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure we are in a clean state for the build
RUN npm run build --workspace=@dattebayo/core
RUN npm run build --workspace=dattebayo-pos-web

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copy necessary files for standalone output
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

# Run Next.js server
CMD ["node", "apps/web/server.js"]
