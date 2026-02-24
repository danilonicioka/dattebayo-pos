#!/bin/bash

# Entra na pasta atual do script (v2/)
cd "$(dirname "$0")"

echo "🛑 Parando os containers atuais..."
docker compose down

echo "🚀 Reconstruindo e iniciando a API..."
docker compose up -d --build

echo "✅ API reiniciada com sucesso!"
echo "Mostrando os logs mais recentes:"
sleep 2
docker logs dattebayo_api --tail 10
