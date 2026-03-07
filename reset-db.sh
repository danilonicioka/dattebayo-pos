#!/bin/bash

# Este script reseta os containers e deleta os volumes do banco de dados 
# para garantir um ambiente limpo. Ao iniciar novamente, as migrations 
# e o seed do banco de dados serão rodados automaticamente pela API.

echo "Parando os containers e removendo os volumes (-v)..."
docker compose down -v

echo "Deletando qualquer container orfão ou não utilizado (opcional)..."
docker compose rm -f

echo "Iniciando os containers novamente..."
docker compose up -d --build

echo ""
echo "==========================================================="
echo "Containers reiniciados com o banco de dados limpo!"
echo "A API aplicará as migrations e rodará o seed automaticamente."
echo "Para acompanhar os logs da API em tempo real, use o comando:"
echo "docker compose logs -f api"
echo "==========================================================="
