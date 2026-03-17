#!/bin/bash
set -e

# Script para buildar a imagem do Backend Java localmente e enviar para o Docker Hub

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

DOCKER_USER="danilonicioka"

echo "🚀 Iniciando build da imagem Java (Backend + Web) para o Docker Hub..."
echo ""

echo "🔐 Fazendo login no Docker Hub..."
docker login

echo ""
echo "🏗  Construindo imagem do Backend Java (linux/amd64 para nuvem)..."
# Build a partir da pasta src para pegar pom.xml e os módulos backend/web
docker build --platform linux/amd64 -t $DOCKER_USER/dattebayo-backend:latest -f src/backend/Dockerfile ./src

echo ""
echo "📤 Fazendo push da imagem para o Docker Hub..."
docker push $DOCKER_USER/dattebayo-backend:latest

echo ""
echo "✅ Imagem enviada com sucesso para $DOCKER_USER/dattebayo-backend:latest!"
