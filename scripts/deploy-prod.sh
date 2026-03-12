#!/bin/bash
set -e

# Script para rodar no servidor (VM)

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🛑 Parando os containers antigos..."
docker compose -f docker-compose.prod.yml down

echo "📥 Trazendo as últimas versões das imagens do Docker Hub..."
docker compose -f docker-compose.prod.yml pull

echo "🚀 Iniciando os contêineres em produção..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ Deploy realizado com sucesso!"
echo "------------------------------------"
echo "🌐 Web App: http://IP-DA-SUA-VM"
echo "🔌 API:     http://IP-DA-SUA-VM:3000"
echo "------------------------------------"
