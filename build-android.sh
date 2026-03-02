#!/bin/bash

# Este script gera o arquivo .apk do Dattebayo POS automaticamente.
# Ele roda na versão local sem depender da nuvem do Expo.

set -e # Interrompe o script se ocorrer algum erro

echo "🚀 Iniciando build local do aplicativo Android..."

# 1. Navegar para a pasta correta
cd apps/mobile

# 2. Verificar se o node_modules está instalado
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do aplicativo..."
    npm install
fi

# 3. Gerar o código nativo do Android
echo "⚙️  Gerando o projeto nativo do Android (Expo Prebuild)..."
npx expo prebuild -p android --clean

# 4. Compilar o APK
echo "🛠️  Compilando o APK de Release (isso pode demorar na primeira vez)..."
cd android
./gradlew assembleRelease

echo "=========================================================="
echo "✅ Build concluído com sucesso!"
echo "📂 O seu arquivo instalável (.apk) está localizado em:"
echo "   apps/mobile/android/app/build/outputs/apk/release/app-release.apk"
echo "=========================================================="
