#!/bin/bash

# Dattebayo POS - Build and Push Images
# Builds the backend image and pushes it to Docker Hub

set -e

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
