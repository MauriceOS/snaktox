#!/bin/bash

# Kill all SnaKTox services

echo "🛑 Stopping all SnaKTox services..."

# Kill processes on specific ports
for port in 3001 3002 8000; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

# Kill by process name
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "nx run-many" 2>/dev/null || true

echo "✓ All services stopped"

