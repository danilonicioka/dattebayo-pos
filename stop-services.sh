#!/bin/bash

# Entra na pasta atual do script
cd "$(dirname "$0")"

echo "🛑 Parando os containers do Banco de Dados, API e Web App..."
docker compose stop db api web

echo "✅ Containers parados com sucesso!"
