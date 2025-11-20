#!/bin/bash
# Keep-alive script for Render free tier services
# Run this via cron-job.org or UptimeRobot every 5 minutes

# Your service URLs (update these)
BACKEND_URL="https://snaktox-backend.onrender.com/api/v1/health"
AI_SERVICE_URL="https://snaktox-ai-service.onrender.com/health"

echo "🔄 Keeping services alive..."

# Ping backend
curl -f "$BACKEND_URL" > /dev/null 2>&1 && echo "✅ Backend is alive" || echo "❌ Backend failed"

# Ping AI service
curl -f "$AI_SERVICE_URL" > /dev/null 2>&1 && echo "✅ AI Service is alive" || echo "❌ AI Service failed"

echo "✅ Keep-alive check completed"

