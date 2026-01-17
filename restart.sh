#!/bin/bash

echo "🛑 Stopping and removing containers..."
docker compose down backend -v

echo ""
echo "🧹 Cleaning up old images..."
docker compose rm -f 

echo ""
echo "🔨 Rebuilding images..."
docker compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker compose up backend -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "📊 Checking service status..."
docker compose ps

echo ""
echo "📝 Backend logs (last 20 lines):"
docker compose logs --tail=20 backend

echo ""
echo "✅ Done! Check if services are running with: docker compose ps"
echo "📍 Access: http://localhost:8080"
