FROM node:22-slim AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /usr/src/app
# Instalar dependências nativas para o Prisma (OpenSSL)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY apps/mobile/package.json ./apps/mobile/
COPY apps/web/package.json ./apps/web/
RUN npm ci

# Stage 2: Build the application
FROM deps AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm run prisma:generate --workspace=api || (cd apps/api && npx prisma generate)
RUN npm run build --workspace=@dattebayo/core
RUN npm run build --workspace=api

# Stage 3: Runner
FROM base AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Instalar openssl (necessário para o Prisma runtime) e remover cache do apt
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar a CLI do Prisma e ts-node/typescript para o seed
RUN npm install -g prisma@5.22.0 ts-node typescript

# Copiar arquivos necessários do builder
COPY --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json /usr/src/app/tsconfig.base.json ./
COPY --from=builder /usr/src/app/apps/api/package.json /usr/src/app/apps/api/tsconfig.json ./apps/api/
COPY --from=builder /usr/src/app/packages/core/package.json ./packages/core/
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Regenerar o Prisma Client no runner para garantir caminhos corretos
RUN prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE 3000

# Executar a API rodando as migrações primeiro
CMD ["npm", "run", "start:migrate:prod", "--workspace", "api"]
