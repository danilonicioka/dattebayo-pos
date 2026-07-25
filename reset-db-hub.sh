#!/bin/bash

# Dattebayo POS - Reset Database (Docker Hub / Production)
# Stops production containers, deletes volumes, and restarts using Docker Hub images.

echo "⚠️  Parando os containers de produção e removendo os volumes (-v)..."
docker compose -f docker-compose.prod.yml down -v

echo "🗑️  Removendo containers órfãos de produção..."
docker compose -f docker-compose.prod.yml rm -f

echo "📥 Trazendo as últimas versões das imagens do Docker Hub..."
docker compose -f docker-compose.prod.yml pull

echo "🚀 Iniciando os containers de produção (com banco limpo e imagens do Hub)..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "==========================================================="
echo "✅ Containers de produção reiniciados com o banco de dados limpo!"
echo "A API aplicará as migrations e rodará o seed automaticamente."
echo "Para acompanhar os logs da API em tempo real, use:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"
echo "==========================================================="
