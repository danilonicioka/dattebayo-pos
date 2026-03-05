#!/bin/bash

# Entra na pasta atual do script
cd "$(dirname "$0")"

echo "🛑 Parando os containers da API e do Web App..."
docker compose stop api web

echo "✅ Containers parados com sucesso!"
