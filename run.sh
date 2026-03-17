#!/bin/bash

# Dattebayo POS - Central Run Script
# Use this script to manage the combined Java Backend and React Mobile environment.

COMMAND=$1

case $COMMAND in
  start)
    ./scripts/restart-services.sh
    ;;
  stop)
    ./scripts/stop-services.sh
    ;;
  reset)
    ./scripts/reset-db.sh
    ;;
  mobile)
    ./scripts/start-mobile.sh
    ;;
  build-mobile)
    ./scripts/build-android.sh
    ;;
  help|*)
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start         - Restart backend services (Java API, DB) and rebuild images"
    echo "  stop          - Stop backend services"
    echo "  reset         - Reset database (deletes volumes and restarts)"
    echo "  mobile        - Start expo for mobile development (local)"
    echo "  build-mobile  - Build Android APK locally"
    echo "  help          - Show this help message"
    ;;
esac
