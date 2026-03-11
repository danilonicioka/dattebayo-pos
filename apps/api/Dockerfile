FROM node:22-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY apps/api/package.json ./
RUN npm install

# Stage 2: Build
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api/ .
# Generate Prisma Client (DATABASE_URL not needed for generate, just for migrations)
RUN DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder" npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Install prisma CLI globally for migrations + seed runner
RUN npm install -g prisma ts-node typescript

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]
