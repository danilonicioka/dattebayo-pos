#!/bin/bash

# Dattebayo POS - VM Setup Script
# This script installs Docker and starts the project services.

# Exit on error
set -e

echo "🔄 Updating package list..."
sudo apt-get update

echo "📦 Installing prerequisites..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

echo "🔑 Adding Docker's official GPG key..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --always-export
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "📂 Setting up the Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "🔄 Updating package list again..."
sudo apt-get update

echo "🐳 Installing Docker Engine, CLI, and Compose..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "👤 Adding current user to the 'docker' group..."
sudo usermod -aG docker $USER

echo "🚀 Starting services..."
chmod +x ./restart-services.sh
./restart-services.sh

echo ""
echo "✅ Setup complete!"
echo "⚠️ IMPORTANT: Run 'newgrp docker' to apply group changes to your current shell."
