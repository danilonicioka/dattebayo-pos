#!/bin/bash
set -e

# Script para buildar as imagens localmente e enviar para o Docker Hub

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

DOCKER_USER="danilonicioka"

# A API_URL default para a VM (pode ser passada como argumento)
PROD_API_URL=${1:-"http://localhost:3000"}

echo "🚀 Iniciando build para o Docker Hub com API_URL: $PROD_API_URL"
echo "(Para usar outra URL, passe como argumento: ./scripts/build-and-push.sh http://IP-DA-VM:3000)"
echo ""

echo "🔐 Fazendo login no Docker Hub..."
docker login

echo ""
echo "🏗  Construindo imagem da API (linux/amd64 para nuvem)..."
docker build --platform linux/amd64 -t $DOCKER_USER/dattebayo-api:latest -f apps/api/Dockerfile .

echo ""
echo "🏗  Construindo imagem Web (linux/amd64 para nuvem)..."
docker build --platform linux/amd64 -t $DOCKER_USER/dattebayo-web:latest -f apps/web/Dockerfile \
  --build-arg API_URL="$PROD_API_URL" .

echo ""
echo "📤 Fazendo push da imagem da API..."
docker push $DOCKER_USER/dattebayo-api:latest

echo ""
echo "📤 Fazendo push da imagem Web..."
docker push $DOCKER_USER/dattebayo-web:latest

echo ""
echo "✅ Imagens enviadas com sucesso para $DOCKER_USER no Docker Hub!"
