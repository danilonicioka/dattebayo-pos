#!/bin/bash

# Dattebayo POS - VM Setup Script
# Installs Docker and starts the production services.

set -e

echo "🔄 Atualizando lista de pacotes..."
sudo apt-get update

echo "📦 Instalando pré-requisitos..."
sudo apt-get install -y ca-certificates curl
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

sudo apt-get update

echo "🐳 Instalando Docker Engine, CLI e Compose..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "👤 Adicionando usuário atual ao grupo 'docker'..."
sudo usermod -aG docker "$USER"

echo "🚀 Iniciando os serviços..."
bash "./deploy-hub.sh"

echo ""
echo "✅ Setup concluído!"
echo "⚠️  IMPORTANTE: Execute 'newgrp docker' para aplicar as mudanças de grupo na sessão atual."
