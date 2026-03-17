#!/bin/bash

# Dattebayo POS - Reset Database
# Stops containers, deletes volumes, and restarts with a clean slate.

echo "⚠️  Parando os containers e removendo os volumes (-v)..."
docker compose down -v

echo "🗑️  Removendo containers órfãos..."
docker compose rm -f

echo "🚀 Iniciando os containers novamente (com banco limpo)..."
docker compose up -d --build

echo ""
echo "==========================================================="
echo "✅ Containers reiniciados com o banco de dados limpo!"
echo "A API aplicará as migrations e rodará o seed automaticamente."
echo "Para acompanhar os logs da API em tempo real, use:"
echo "  docker compose logs -f api"
echo "==========================================================="
