#!/bin/bash

# Setup Script for Restaurant POS on Ubuntu VM
# Usage: ./setup_vm.sh

set -e

echo "🚀 Starting Restaurant POS VM Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo "⚠️  Log out and log back in for Docker group changes to take effect, or run: newgrp docker"
else
    echo "✅ Docker is already installed."
fi

# 3. Setup Project
# Ensure git is installed
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
fi

# Clone or Pull
REPO_DIR="dattebayo-pos"
REPO_URL="https://github.com/danilonicioka/dattebayo-pos.git" # REPLACE WITH YOUR ACTUAL REPO URL

if [ -d "$REPO_DIR" ]; then
    echo "🔄 Updating existing repository..."
    cd "$REPO_DIR"
    git pull
else
    echo "📥 Cloning repository..."
    # If the repo URL is private, you might need to use an SSH key or token.
    # For now, assuming public or user will handle auth.
    git clone "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
fi

# 4. Configure Environment
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚙️  Creating default production .env file..."
    cat > "$ENV_FILE" <<EOL
COMPOSE_PROJECT_NAME=restaurant-pos
POSTGRES_USER=pos_user
POSTGRES_PASSWORD=secure_password_change_me
POSTGRES_DB=restaurant_pos
POSTGRES_PORT=5432
APP_PORT=80
EOL
    echo "✅ Created $ENV_FILE. Please edit it if you need to change passwords."
fi

# 5. Start Application
echo "🚀 Starting application with Docker Compose..."
# We use the docker/compose.yml but run from root context (handled by the compose file paths)
# Actually, the compose file expects context ../src, so running from project root using -f docker/compose.yml works if the context is relative to the compose file.
# Let's check compose.yml again.
# context: ../src (relative to docker/compose.yml) -> dattebayo-pos/src. Correct.
docker compose -f docker/compose.yml --env-file .env up -d --build

echo ""
echo "✅ Deployment complete!"
echo "🌍 App should be available at http://$(curl -s ifconfig.me)"
