#!/bin/bash

echo "🍽️  Starting Restaurant POS System..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start the services
echo "📦 Starting Docker containers..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start (this may take 30-60 seconds)..."
sleep 5

# Wait for backend to be ready
echo "🔍 Checking backend status..."
for i in {1..30}; do
    if curl -s http://localhost/api/menu > /dev/null 2>&1; then
        echo ""
        echo "✅ System is ready!"
        echo ""
        echo "📍 Access the application:"
        echo "   - Order Interface: http://localhost"
        echo "   - Kitchen Display: http://localhost/kitchen"
        echo "   - REST API: http://localhost/api"
        echo ""
        echo "📊 View logs: docker composelogs -f"
        echo "🛑 Stop system: docker composedown"
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "⚠️  Backend is taking longer than expected to start."
echo "   Check logs with: docker composelogs backend"
echo ""
echo "📍 Once ready, access:"
echo "   - Order Interface: http://localhost"
echo "   - Kitchen Display: http://localhost/kitchen"
