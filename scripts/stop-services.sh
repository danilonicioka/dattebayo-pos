#!/bin/bash

# Entra na raiz do projeto (um nível acima de scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🛑 Parando os containers do Banco de Dados, API e Web App..."
docker compose stop db api web

echo "✅ Containers parados com sucesso!"
