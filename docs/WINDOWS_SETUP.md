# SnaKTox Windows Setup Guide

Complete guide for setting up and running SnaKTox on Windows machines.

## 📋 Prerequisites

### Required Software

1. **Node.js 18+** and **npm 8+**
   - Download: https://nodejs.org/
   - Verify installation:
     ```powershell
     node --version
     npm --version
     ```

2. **Python 3.8+** (for AI service)
   - Download: https://www.python.org/downloads/
   - Verify installation:
     ```powershell
     python --version
     ```

3. **MongoDB** (choose one):
   - **Option A**: MongoDB Atlas (Cloud - Recommended)
     - Sign up: https://www.mongodb.com/cloud/atlas
     - Free tier available
   - **Option B**: MongoDB Community Server (Local)
     - Download: https://www.mongodb.com/try/download/community
     - Install and start MongoDB service
   - **Option C**: Docker (if you have Docker Desktop)
     ```powershell
     docker run -d -p 27017:27017 --name mongodb mongo:7
     ```

4. **Git** (for cloning repository)
   - Download: https://git-scm.com/download/win
   - Verify: `git --version`

## 🚀 Quick Setup (Automated)

### Option 1: PowerShell Script (Recommended)

1. Open **PowerShell** (Run as Administrator recommended)
2. Navigate to project directory:
   ```powershell
   cd C:\path\to\snaktox
   ```
3. Run setup script:
   ```powershell
   .\scripts\setup-windows.ps1
   ```

### Option 2: Batch File

1. Double-click `scripts\setup-windows.bat`
2. Or run from Command Prompt:
   ```cmd
   scripts\setup-windows.bat
   ```

## 🔧 Manual Setup (Step by Step)

### Step 1: Clone Repository

```powershell
git clone https://github.com/MauriceOS/snaktox.git
cd snaktox
```

### Step 2: Install Dependencies

```powershell
# Install root dependencies
npm install

# Dependencies for all workspaces will be installed automatically
```

### Step 3: Setup Environment Variables

```powershell
# Copy environment template
copy .env.example .env

# Edit .env file with your configuration
notepad .env
```

**Required Environment Variables:**
```env
# Database (MongoDB)
DATABASE_URL="mongodb://localhost:27017/snaktox_db"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/snaktox_db"

# Backend
PORT=3002
JWT_SECRET="your-secret-key-here"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3002/api/v1"

# AI Service (in services/ai-service/.env)
GEMINI_API_KEY="your-gemini-api-key"  # Optional
```

### Step 4: Setup Database

```powershell
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with initial data
npm run db:seed
```

### Step 5: Setup AI Service (Python)

```powershell
# Navigate to AI service directory
cd services\ai-service

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup AI service environment
copy .env.example .env
notepad .env

# Return to root
cd ..\..
```

## ▶️ Running the Application

### Option 1: Run All Services Together

```powershell
npm run dev
```

This starts:
- Web app on `http://localhost:3001`
- Backend API on `http://localhost:3002`
- AI Service on `http://localhost:8000`

### Option 2: Run Services Separately (Recommended for Development)

Open **3 separate terminal windows**:

**Terminal 1 - Web App:**
```powershell
npm run dev:web
```
Access at: http://localhost:3001

**Terminal 2 - Backend API:**
```powershell
npm run dev:backend
```
Access at: http://localhost:3002/api/docs

**Terminal 3 - AI Service:**
```powershell
cd services\ai-service
python main.py
```
Or if using virtual environment:
```powershell
cd services\ai-service
.\venv\Scripts\activate
python main.py
```
Access at: http://localhost:8000/docs

## 🌐 Access Points

Once all services are running:

- **Web Application**: http://localhost:3001
- **Backend API**: http://localhost:3002
- **API Documentation**: http://localhost:3002/api/docs
- **AI Service**: http://localhost:8000
- **AI Service Docs**: http://localhost:8000/docs

## 🛠️ Common Commands

### Development
```powershell
# Start all services
npm run dev

# Start individual services
npm run dev:web          # Web app only
npm run dev:backend      # Backend only
npm run dev:ai           # AI service only

# Run tests
npm run test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database
```powershell
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Seed database with initial data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Build
```powershell
# Build all applications
npm run build

# Build specific app
cd apps\web
npm run build
```

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```powershell
# Find process using port (PowerShell)
Get-NetTCPConnection -LocalPort 3001,3002,8000 | Select-Object LocalPort,OwningProcess

# Kill process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

Or use the kill script:
```powershell
.\scripts\kill-all.sh
```

### MongoDB Connection Issues

1. **Check MongoDB is running:**
   ```powershell
   # For local MongoDB
   Get-Service MongoDB
   
   # For Docker
   docker ps | findstr mongodb
   ```

2. **Verify DATABASE_URL in .env:**
   - Local: `mongodb://localhost:27017/snaktox_db`
   - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/snaktox_db`

3. **Test connection:**
   ```powershell
   npm run db:push
   ```

### Python/AI Service Issues

1. **Virtual environment not activating:**
   ```powershell
   # PowerShell execution policy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Python dependencies not installing:**
   ```powershell
   cd services\ai-service
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Module not found errors:**
   - Make sure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

### Node.js Module Issues

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Prisma Issues

```powershell
# Regenerate Prisma client
npm run db:generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
npm run db:seed
```

## 📝 Windows-Specific Notes

### File Paths
- Use backslashes (`\`) in Command Prompt
- Use forward slashes (`/`) or backslashes in PowerShell
- Paths are case-insensitive on Windows

### Environment Variables
- Set in `.env` file (root and `services/ai-service/.env`)
- PowerShell: `$env:VARIABLE_NAME = "value"`
- Command Prompt: `set VARIABLE_NAME=value`

### Terminal Recommendations
- **PowerShell** (Recommended): Better error handling and modern features
- **Command Prompt**: Traditional Windows terminal
- **Windows Terminal**: Modern terminal with tabs (Download from Microsoft Store)
- **Git Bash**: Unix-like commands (comes with Git)

### Line Endings
- Git should handle line endings automatically
- If issues occur: `git config core.autocrlf true`

## 🔒 Security Notes

- Never commit `.env` files
- Keep `GEMINI_API_KEY` secret (optional, app works without it)
- Use strong `JWT_SECRET` in production
- MongoDB Atlas connection strings contain credentials - keep secure

## 📚 Additional Resources

- [MongoDB Windows Installation](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
- [Node.js Windows Installation](https://nodejs.org/en/download/)
- [Python Windows Installation](https://www.python.org/downloads/windows/)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)

## 🆘 Getting Help

If you encounter issues:

1. Check the [main README.md](../README.md)
2. Review error messages carefully
3. Check service logs in terminal windows
4. Verify all prerequisites are installed
5. Open an issue on [GitHub](https://github.com/MauriceOS/snaktox/issues)

---

**Happy Coding! 🐍🚀**


