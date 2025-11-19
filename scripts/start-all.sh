#!/bin/bash

# SnaKTox - Start All Services Script
# This script starts all services in the correct order

set -e

echo "🚀 Starting SnaKTox Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB...${NC}"
if pgrep -x mongod > /dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB is not running. Starting MongoDB...${NC}"
    brew services start mongodb-community || echo "Please start MongoDB manually"
fi

# Check if services are already running
echo ""
echo -e "${BLUE}Checking for running services...${NC}"

# Kill existing processes if needed
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port 3001 (Web App)...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

if lsof -ti:3002 > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port 3002 (Backend API)...${NC}"
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
fi

if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port 8000 (AI Service)...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}All ports cleared${NC}"
echo ""

# Start AI Service (Python FastAPI)
echo -e "${BLUE}Starting AI Service (port 8000)...${NC}"
cd services/ai-service
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null || true
uvicorn main:app --host 0.0.0.0 --port 8000 --reload > /tmp/snaktox-ai-service.log 2>&1 &
AI_PID=$!
echo -e "${GREEN}✓ AI Service started (PID: $AI_PID)${NC}"
echo "   Logs: tail -f /tmp/snaktox-ai-service.log"
cd ../..

# Wait a bit for AI service to start
sleep 2

# Start Backend API (NestJS)
echo ""
echo -e "${BLUE}Starting Backend API (port 3002)...${NC}"
cd apps/backend
npm run start:dev > /tmp/snaktox-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend API started (PID: $BACKEND_PID)${NC}"
echo "   Logs: tail -f /tmp/snaktox-backend.log"
cd ../..

# Wait a bit for backend to start
sleep 3

# Start Web App (Next.js)
echo ""
echo -e "${BLUE}Starting Web App (port 3001)...${NC}"
cd apps/web
npm run dev > /tmp/snaktox-web.log 2>&1 &
WEB_PID=$!
echo -e "${GREEN}✓ Web App started (PID: $WEB_PID)${NC}"
echo "   Logs: tail -f /tmp/snaktox-web.log"
cd ../..

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 All Services Started Successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Access Points:${NC}"
echo -e "  🌐 Web App:        ${GREEN}http://localhost:3001${NC}"
echo -e "  🔧 Backend API:    ${GREEN}http://localhost:3002${NC}"
echo -e "  📚 API Docs:       ${GREEN}http://localhost:3002/api/docs${NC}"
echo -e "  🤖 AI Service:     ${GREEN}http://localhost:8000${NC}"
echo ""
echo -e "${BLUE}Process IDs:${NC}"
echo -e "  AI Service:  $AI_PID"
echo -e "  Backend API: $BACKEND_PID"
echo -e "  Web App:     $WEB_PID"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC}"
echo -e "  kill $AI_PID $BACKEND_PID $WEB_PID"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "  tail -f /tmp/snaktox-*.log"
echo ""

