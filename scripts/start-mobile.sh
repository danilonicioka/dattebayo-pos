#!/bin/bash

# Entra na raiz do projeto (um nível acima de scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📱 Iniciando o App Mobile (Expo)..."

# Tenta liberar a porta do Expo (8081) caso esteja presa
echo "🔍 Verificando porta 8081..."
kill -9 $(lsof -t -i:8081) 2>/dev/null || true

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
