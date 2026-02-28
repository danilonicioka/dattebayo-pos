#!/bin/bash

# Setup Script for Restaurant POS on Debian 13 VM
# Usage: ./setup_vm.sh

set -e

echo "🚀 Starting Restaurant POS VM Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key:
    sudo apt update
    sudo apt install -y ca-certificates curl
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
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo "⚠️  Log out and log back in for Docker group changes to take effect, or run: newgrp docker"
else
    echo "✅ Docker is already installed."
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
