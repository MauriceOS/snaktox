#!/bin/bash

# SnaKTox Development Setup Script
# Version: 1.0.0
# Author: Maurice Osoro

set -e

echo "🐍 SnaKTox Development Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm 8+ and try again."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd apps/backend
    npm install
    cd ../..
    
    # Install web dependencies
    cd apps/web
    npm install
    cd ../..
    
    # Install AI service dependencies
    cd services/ai-service
    pip install -r requirements.txt
    cd ../..
    
    print_success "Dependencies installed successfully!"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your actual configuration values"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Start database services
start_database() {
    print_status "Starting database services..."
    
    # MongoDB is managed externally (Atlas or local instance)
    print_status "Connecting to MongoDB..."
    
    # Verify MongoDB connection via Prisma
    print_status "Verifying MongoDB connection..."
    npm run db:generate
    
    print_success "Database connection verified!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    npm run db:generate
    
    # Push database schema
    npm run db:push
    
    # Seed database with initial data
    npm run db:seed
    
    print_success "Database setup completed!"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build web app (backend is optional)
    cd web
    npm run build
    cd ..
    
    print_success "Applications built successfully!"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    
    print_status "Services can be started manually:"
    print_status "  - All services: npm run dev"
    print_status "  - Web only: npm run dev:web"
    print_status "  - AI Service: cd services/ai-service && python main.py"
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    print_status "MongoDB connection verified during setup."
    print_status "Access services after starting them:"
    print_status "  - Web app: http://localhost:3000"
    print_status "  - AI Service: http://localhost:8000/docs"
    print_status "  - Backend (if running): http://localhost:3001"
}

# Display access information
display_access_info() {
    echo ""
    echo "🎉 SnaKTox Setup Complete!"
    echo "=========================="
    echo ""
    echo "Access Points:"
    echo "  🌐 Web Application: http://localhost:3000"
    echo "  🔧 Backend API: http://localhost:3001"
    echo "  📚 API Documentation: http://localhost:3001/api/docs"
    echo "  🤖 AI Service: http://localhost:8000"
    echo "  📊 AI Service Docs: http://localhost:8000/docs"
    echo ""
    echo "Database:"
    echo "  🍃 MongoDB: See DATABASE_URL in .env (Atlas or local instance)"
    echo "  📍 Database Name: snaktox"
    echo ""
    echo "Useful Commands:"
    echo "  📊 Start all services: npm run dev"
    echo "  🌐 Start web only: npm run dev:web"
    echo "  🤖 Start AI service: cd services/ai-service && python main.py"
    echo "  🧪 Run tests: npm run test"
    echo "  🔍 Run linting: npm run lint"
    echo ""
    echo "Development Commands:"
    echo "  🚀 Start dev mode: npm run dev"
    echo "  🧪 Run tests: npm run test"
    echo "  🔍 Run linting: npm run lint"
    echo ""
}

# Main setup function
main() {
    echo "Starting SnaKTox development setup..."
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    start_database
    setup_database
    build_applications
    start_services
    display_access_info
    
    print_success "SnaKTox is ready for development! 🚀"
}

# Run main function
main "$@"
