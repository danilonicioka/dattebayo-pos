#!/bin/bash

# Configuration
ENV_FILE=".env"

# Ensure env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Configuration file $ENV_FILE not found!"
    exit 1
fi

# Load variables
set -a
source "$ENV_FILE"
set +a

echo "🍽️  Starting Restaurant POS System..."
echo "   - Project: $COMPOSE_PROJECT_NAME"
echo "   - Config:  $ENV_FILE"
echo "   - App Port: $APP_PORT"
echo "   - DB Port: $POSTGRES_PORT"
echo ""

# Change to project root directory
cd "$(dirname "$0")"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start all services
echo "📦 Starting Docker containers..."
docker compose -f docker/compose.yml --env-file "$ENV_FILE" up --build -d

echo ""
echo "⏳ Waiting for services to start (this may take 30-60 seconds)..."
sleep 5

# Wait for backend to be ready
echo "🔍 Checking backend status..."
for i in {1..30}; do
    if curl -s http://localhost:$APP_PORT > /dev/null 2>&1; then
        echo ""
        echo "✅ System is ready!"
        echo ""
        echo "📍 Access the application:"
        echo "   - Web Interface: http://localhost:$APP_PORT"
        echo "   - Kitchen Display: http://localhost:$APP_PORT/kitchen"
        echo "   - Database: localhost:$POSTGRES_PORT"
        echo ""
        echo "📊 View logs: docker compose -f docker/compose.yml logs -f"
        echo "🛑 Stop system: docker compose -f docker/compose.yml down"
        echo "🔄 Restart backend: ./restart.sh"
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "⚠️  Backend is taking longer than expected to start."
echo "   Check logs with: docker compose -f docker/compose.yml logs backend"
echo ""
echo "📍 Once ready, access:"
echo "   - Web Interface: http://localhost:$APP_PORT"
echo "   - Kitchen Display: http://localhost:$APP_PORT/kitchen"
