#!/bin/bash

# Dattebayo POS - Restart Containers
# Rebuilds and restarts all local services

echo "🛑 Parando os containers..."
docker compose down

echo "🚀 Reconstruindo e iniciando os serviços..."
docker compose up -d --build

echo "✅ Serviços reiniciados com sucesso!"
echo "------------------------------------"
echo "🌐 Web Interface: http://localhost:8080"
echo "🔌 API Backend:   http://localhost:8080/api"
echo "------------------------------------"

echo "Mostrando logs do Backend (últimas 20 linhas):"
sleep 5
docker logs dattebayo_backend --tail 20
