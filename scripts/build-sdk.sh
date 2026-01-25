#!/bin/bash

# Change to project root directory
cd "$(dirname "$0")/.."

echo "🛠️  Building Android SDK via Docker..."

docker run --rm \
    -v "$(pwd)":/usr/src/app \
    -v "$HOME/.m2":/root/.m2 \
    -w /usr/src/app \
    maven:3.9-eclipse-temurin-17 \
    mvn clean install -DskipTests

echo ""
echo "✅ SDK built and installed to your local maven repository (inside Docker cache/volume)."
