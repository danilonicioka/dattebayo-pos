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

echo "🔄 Restarting Backend Service (PROD)..."
echo ""

# Change to project root directory
cd "$(dirname "$0")/.."

# Only rebuild and restart the backend (keeps database running)
echo "🛑 Stopping backend container..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" stop backend

echo ""
echo "🔨 Rebuilding backend image..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" build --no-cache backend

echo ""
echo "🚀 Starting backend..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" up -d backend

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
