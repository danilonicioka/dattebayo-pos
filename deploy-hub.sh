#!/bin/bash

# Dattebayo POS - Deploy from Docker Hub
# Pulls latest images and restarts production containers

set -e

echo "🛑 Parando os containers antigos..."
docker compose -f docker-compose.prod.yml down

echo "📥 Trazendo as últimas versões das imagens do Docker Hub..."
docker compose -f docker-compose.prod.yml pull

echo "🚀 Iniciando os contêineres em produção..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ Deploy realizado com sucesso!"
echo "------------------------------------"
echo "🌐 Interface Web: http://IP-DA-SUA-VM"
echo "🔌 API Backend:   http://IP-DA-SUA-VM/api"
echo "------------------------------------"
