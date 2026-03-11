#!/bin/bash

# Entra na raiz do projeto (um nível acima de scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🛑 Parando os containers..."
docker compose down

echo "🚀 Reconstruindo e iniciando os serviços..."
docker compose up -d --build

echo "✅ Serviços reiniciados com sucesso!"
echo "------------------------------------"
echo "🌐 Web App: http://localhost"
echo "🔌 API:     http://localhost:3000"
echo "------------------------------------"

echo "Mostrando logs da API (últimas 20 linhas):"
sleep 3
docker logs dattebayo_api --tail 20

echo ""
echo "Mostrando logs do Web App (últimas 5 linhas):"
docker logs dattebayo_web --tail 5
