#!/bin/bash

# Dattebayo POS - Central Run Script
# Use this script to manage the Docker environment.

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
  help|*)
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start   - Restart all services (api, web, db) and rebuild images"
    echo "  stop    - Stop all services"
    echo "  reset   - Reset database (deletes volumes and runs migrations/seed)"
    echo "  mobile  - Start expo for mobile development (local)"
    echo "  help    - Show this help message"
    ;;
esac
