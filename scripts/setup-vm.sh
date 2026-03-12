#!/bin/bash

# Dattebayo POS - VM Setup Script
# Este script instala o Docker e inicia os serviços do projeto.

set -e

# Vai para a raiz do projeto (dois níveis acima de scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔄 Atualizando lista de pacotes..."
sudo apt-get update

echo "📦 Instalando pré-requisitos..."
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Adiciona o repositório Docker
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update

echo "🐳 Instalando Docker Engine, CLI e Compose..."
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "👤 Adicionando usuário atual ao grupo 'docker'..."
sudo usermod -aG docker "$USER"

echo "🚀 Iniciando os serviços..."
bash "$PROJECT_ROOT/scripts/deploy-prod.sh"

echo ""
echo "✅ Setup concluído!"
echo "⚠️  IMPORTANTE: Execute 'newgrp docker' para aplicar as mudanças de grupo na sessão atual."
