#!/bin/bash

# Entra na pasta atual do script
cd "$(dirname "$0")"

echo "📱 Iniciando o App Mobile (Expo)..."

# Vai para a pasta do mobile
cd apps/mobile

# Tenta liberar a porta do Expo (8081) caso esteja presa
echo "🔍 Verificando porta 8081..."
kill -9 $(lsof -t -i:8081) 2>/dev/null || true

# Inicia o Expo
echo "🚀 Abrindo Expo..."
npx expo start --clear
