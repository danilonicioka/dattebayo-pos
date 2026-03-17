#!/bin/bash

# Dattebayo POS - Start Mobile (Expo)
# Starts the mobile development environment

echo "📱 Iniciando o App Mobile (Expo)..."

# Tenta liberar a porta do Expo (8081) caso esteja presa
echo "🔍 Verificando porta 8081..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  lsof -t -i:8081 | xargs kill -9 2>/dev/null || true
fi

# Vai para a pasta do mobile
cd apps/mobile

# Instala dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências do mobile..."
  npm install
fi

# Inicia o Expo
echo "🚀 Abrindo Expo..."
npx expo start --clear
