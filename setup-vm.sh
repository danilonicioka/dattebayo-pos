#!/bin/bash

# Dattebayo POS - VM Setup Script
# This script installs Docker and starts the project services.

# Exit on error
set -e

echo "🔄 Updating package list..."
sudo apt-get update

echo "📦 Installing prerequisites..."
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update

echo "🐳 Installing Docker Engine, CLI, and Compose..."
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin


echo "👤 Adding current user to the 'docker' group..."
sudo usermod -aG docker $USER

echo "🚀 Starting services..."
./restart-services.sh

echo ""
echo "✅ Setup complete!"
echo "⚠️ IMPORTANT: Run 'newgrp docker' to apply group changes to your current shell."
