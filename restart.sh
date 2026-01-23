#!/bin/bash

echo "🔄 Restarting Backend Service..."
echo ""

# Only rebuild and restart the backend (keeps database running)
echo "🛑 Stopping backend container..."
docker compose -f docker/compose.dev.yml stop backend

echo ""
echo "🔨 Rebuilding backend image..."
docker compose -f docker/compose.dev.yml build backend

echo ""
echo "🚀 Starting backend..."
docker compose -f docker/compose.dev.yml up -d backend

echo ""
echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "📊 Service status:"
docker compose -f docker/compose.dev.yml ps

echo ""
echo "📝 Backend logs (last 20 lines):"
docker compose -f docker/compose.dev.yml logs --tail=20 backend

echo ""
echo "✅ Backend restarted!"
echo "📍 Access: http://localhost:8080"
echo "📊 Follow logs: docker compose -f docker/compose.dev.yml logs -f backend"
