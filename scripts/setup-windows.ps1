# SnaKTox Development Setup Script for Windows
# Version: 1.0.0
# Author: Maurice Osoro
# Usage: Run in PowerShell: .\scripts\setup-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "🐍 SnaKTox Development Setup (Windows)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Function to print status messages
function Print-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Check-Prerequisites {
    Print-Status "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node -v
        $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($nodeMajor -lt 18) {
            Print-Error "Node.js version 18+ is required. Current version: $nodeVersion"
            exit 1
        }
        Print-Success "Node.js found: $nodeVersion"
    } catch {
        Print-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm -v
        Print-Success "npm found: $npmVersion"
    } catch {
        Print-Error "npm is not installed. Please install npm 8+ and try again."
        exit 1
    }
    
    # Check Python
    try {
        $pythonVersion = python --version
        Print-Success "Python found: $pythonVersion"
    } catch {
        Print-Warning "Python is not installed. AI service requires Python 3.8+"
        Print-Warning "Install from https://www.python.org/downloads/"
    }
    
    Print-Success "Prerequisites check completed!"
}

# Install dependencies
function Install-Dependencies {
    Print-Status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to install root dependencies"
        exit 1
    }
    
    Print-Success "Dependencies installed successfully!"
}

# Setup environment variables
function Setup-Environment {
    Print-Status "Setting up environment variables..."
    
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Print-Success "Created .env file from template"
            Print-Warning "Please edit .env file with your actual configuration values"
        } else {
            Print-Warning ".env.example not found. Please create .env manually"
        }
    } else {
        Print-Warning ".env file already exists, skipping creation"
    }
}

# Setup MongoDB
function Setup-MongoDB {
    Print-Status "Setting up MongoDB..."
    
    Print-Status "MongoDB setup options:"
    Print-Status "  1. Use MongoDB Atlas (cloud): Update DATABASE_URL in .env"
    Print-Status "  2. Install MongoDB locally: https://www.mongodb.com/try/download/community"
    Print-Status "  3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:7"
    
    Print-Warning "Make sure MongoDB is running before proceeding with database setup"
}

# Setup database
function Setup-Database {
    Print-Status "Setting up database..."
    
    # Generate Prisma client
    npm run db:generate
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to generate Prisma client"
        exit 1
    }
    
    # Push database schema
    npm run db:push
    if ($LASTEXITCODE -ne 0) {
        Print-Warning "Database push failed. Check your DATABASE_URL in .env"
        return
    }
    
    # Seed database with initial data
    npm run db:seed
    if ($LASTEXITCODE -ne 0) {
        Print-Warning "Database seeding failed. You can run it later with: npm run db:seed"
    }
    
    Print-Success "Database setup completed!"
}

# Display access information
function Display-AccessInfo {
    Write-Host ""
    Write-Host "🎉 SnaKTox Setup Complete!" -ForegroundColor Green
    Write-Host "==========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Points:"
    Write-Host "  🌐 Web Application: http://localhost:3001"
    Write-Host "  🔧 Backend API: http://localhost:3002"
    Write-Host "  📚 API Documentation: http://localhost:3002/api/docs"
    Write-Host "  🤖 AI Service: http://localhost:8000"
    Write-Host "  📊 AI Service Docs: http://localhost:8000/docs"
    Write-Host ""
    Write-Host "Database:"
    Write-Host "  🍃 MongoDB: See DATABASE_URL in .env"
    Write-Host "  📍 Database Name: snaktox_db"
    Write-Host ""
    Write-Host "Useful Commands (PowerShell):"
    Write-Host "  📊 Start all services: npm run dev"
    Write-Host "  🌐 Start web only: npm run dev:web"
    Write-Host "  🔧 Start backend only: npm run dev:backend"
    Write-Host "  🤖 Start AI service: cd services\ai-service; python main.py"
    Write-Host "  🧪 Run tests: npm run test"
    Write-Host "  🔍 Run linting: npm run lint"
    Write-Host ""
    Write-Host "To start services manually:"
    Write-Host "  1. Terminal 1: npm run dev:web"
    Write-Host "  2. Terminal 2: npm run dev:backend"
    Write-Host "  3. Terminal 3: cd services\ai-service; python main.py"
    Write-Host ""
}

# Main setup function
function Main {
    Write-Host "Starting SnaKTox development setup..." -ForegroundColor Cyan
    Write-Host ""
    
    Check-Prerequisites
    Install-Dependencies
    Setup-Environment
    Setup-MongoDB
    Setup-Database
    Display-AccessInfo
    
    Print-Success "SnaKTox is ready for development! 🚀"
}

# Run main function
Main

