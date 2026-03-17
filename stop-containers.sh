#!/bin/bash

# Dattebayo POS - Stop Containers
# Stops backend and database services

echo "🛑 Parando os containers do Banco de Dados e Backend..."
docker compose stop postgres backend

echo "✅ Containers parados com sucesso!"
