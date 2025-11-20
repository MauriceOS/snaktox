@echo off
REM SnaKTox Development Setup Script for Windows (Batch)
REM Version: 1.0.0
REM Author: Maurice Osoro
REM Usage: Double-click or run: scripts\setup-windows.bat

echo.
echo ========================================
echo   SnaKTox Development Setup (Windows)
echo ========================================
echo.

REM Check Node.js
echo [INFO] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [SUCCESS] Node.js found
echo.

REM Check npm
echo [INFO] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)
npm --version
echo [SUCCESS] npm found
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed
echo.

REM Setup environment
echo [INFO] Setting up environment variables...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [SUCCESS] Created .env file from template
        echo [WARNING] Please edit .env file with your actual configuration values
    ) else (
        echo [WARNING] .env.example not found. Please create .env manually
    )
) else (
    echo [WARNING] .env file already exists, skipping creation
)
echo.

REM Setup database
echo [INFO] Setting up database...
echo [INFO] Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

echo [INFO] Pushing database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo [WARNING] Database push failed. Check your DATABASE_URL in .env
) else (
    echo [INFO] Seeding database...
    call npm run db:seed
    if %errorlevel% neq 0 (
        echo [WARNING] Database seeding failed. You can run it later with: npm run db:seed
    )
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Access Points:
echo   Web App: http://localhost:3001
echo   Backend API: http://localhost:3002
echo   AI Service: http://localhost:8000
echo.
echo To start services:
echo   1. npm run dev (starts all services)
echo   2. Or start individually:
echo      - npm run dev:web
echo      - npm run dev:backend
echo      - cd services\ai-service ^&^& python main.py
echo.
pause

