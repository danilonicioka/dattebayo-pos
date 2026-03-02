#!/bin/bash

# Entra na pasta atual do script (v2/)
cd "$(dirname "$0")"

echo "📱 Iniciando o App Mobile (Expo)..."

# Garante que estamos na pasta do Mobile e limpa porta presa se houver
cd apps/mobile

# Tenta matar qualquer processo rodando na 8081 para não dar erro
kill -9 $(lsof -t -i:8081) 2>/dev/null || true

# Inicia o Expo limpando o cache
npx expo start --clear
