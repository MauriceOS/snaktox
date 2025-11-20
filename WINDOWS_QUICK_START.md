# Windows Quick Start Guide

## 🚀 Fast Setup (3 Steps)

### 1. Install Prerequisites
- **Node.js 18+**: https://nodejs.org/
- **Python 3.8+**: https://www.python.org/downloads/
- **MongoDB**: https://www.mongodb.com/try/download/community (or use MongoDB Atlas)

### 2. Run Setup Script
```powershell
# In PowerShell
.\scripts\setup-windows.ps1
```

### 3. Start Services
```powershell
npm run dev
```

## 📋 Manual Commands

### Initial Setup
```powershell
# Clone repository
git clone https://github.com/MauriceOS/snaktox.git
cd snaktox

# Install dependencies
npm install

# Setup environment
copy .env.example .env
notepad .env  # Edit with your MongoDB URL

# Setup database
npm run db:generate
npm run db:push
npm run db:seed
```

### Running Services

**Option 1: All at once**
```powershell
npm run dev
```

**Option 2: Separate terminals**
```powershell
# Terminal 1 - Web
npm run dev:web

# Terminal 2 - Backend
npm run dev:backend

# Terminal 3 - AI Service
cd services\ai-service
python main.py
```

## 🌐 Access Points
- Web App: http://localhost:3001
- Backend API: http://localhost:3002/api/docs
- AI Service: http://localhost:8000/docs

## 🛠️ Common Commands
```powershell
npm run dev          # Start all services
npm run test         # Run tests
npm run lint         # Check code quality
npm run db:studio    # Open database GUI
```

## 🐛 Quick Fixes

**Port in use?**
```powershell
Get-NetTCPConnection -LocalPort 3001,3002,8000
Stop-Process -Id <PID> -Force
```

**MongoDB not connecting?**
- Check MongoDB is running: `Get-Service MongoDB`
- Verify DATABASE_URL in `.env`

**Python issues?**
```powershell
cd services\ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

## 📚 Full Guide
See [docs/WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md) for complete documentation.


