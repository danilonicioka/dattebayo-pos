#!/bin/bash

# Entra na pasta atual do script
cd "$(dirname "$0")"

echo "🛑 Parando os containers da API e do Web App..."
docker compose down

echo "🚀 Reconstruindo e iniciando a API e App Web..."
docker compose up -d --build

echo "✅ Serviços reiniciados com sucesso!"
echo "------------------------------------"
echo "🌐 Web App: http://localhost"
echo "🔌 API: http://localhost:3000"
echo "------------------------------------"

echo "Mostrando logs da API:"
sleep 2
docker logs dattebayo_api --tail 10

echo ""
echo "Mostrando logs do App Web:"
docker logs dattebayo_web --tail 10
