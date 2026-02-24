FROM node:22-slim

WORKDIR /usr/src/app

# Instalar dependências nativas para o Prisma (OpenSSL)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar tudo para aproveitar a estrutura do NPM Workspaces
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY apps/mobile/package.json ./apps/mobile/

# Usar npm ci para garantir as exatas versões da máquina
RUN npm ci

# Agora copiamos o resto do código
COPY . .

# Gerar o client do prisma para o Container (Linux) e buildar a API NestJS
RUN npm run prisma:generate --workspace=api || (cd apps/api && npx prisma generate)
RUN npm run build --workspace=@dattebayo/core
RUN npm run build --workspace=api

# Expor a porta 3000 do NestJS
EXPOSE 3000

# Executar a API
CMD ["npm", "run", "start:prod", "--workspace", "api"]
