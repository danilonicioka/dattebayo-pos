#!/bin/bash

# Configuration
ENV_FILE=".env.prod"
# Load variables for echo/script usage
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi
APP_PORT="${APP_PORT:-80}"

echo "🔄 Resetting Backend Service & Data (PROD)..."
echo "⚠️  This will delete all database data!"
echo ""

# Change to project root directory
cd "$(dirname "$0")/.."

# Only rebuild and restart the backend (keeps database running)
echo "🛑 Stopping containers and removing volumes..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" down -v

echo "🧹 Cleaning up unused volumes and cache..."
docker volume prune -f

echo ""
echo "🔨 Rebuilding backend image..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" build --no-cache backend

echo ""
echo "🚀 Starting backend..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" up -d

echo ""
echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "📊 Service status:"
docker compose -f docker/compose.yml --env-file "$ENV_FILE" ps

echo ""
echo "📝 Backend logs (last 20 lines):"
docker compose -f docker/compose.yml --env-file "$ENV_FILE" logs --tail=20 backend

echo ""
echo "✅ Backend restarted!"
echo "📍 Access: http://localhost:$APP_PORT"
echo "📊 Follow logs: docker compose -f docker/compose.yml --env-file \"$ENV_FILE\" logs -f backend"
