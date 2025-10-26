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
    
    # Start PostgreSQL and Redis
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    print_status "Waiting for database services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    until docker-compose exec postgres pg_isready -U postgres; do
        print_status "Waiting for PostgreSQL..."
        sleep 2
    done
    
    print_success "Database services are ready!"
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
    
    # Build backend
    cd apps/backend
    npm run build
    cd ../..
    
    # Build web app
    cd apps/web
    npm run build
    cd ../..
    
    print_success "Applications built successfully!"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    
    # Start all services with Docker Compose
    docker-compose up -d
    
    print_success "All services started!"
    print_status "Services are starting up, please wait a moment..."
    sleep 15
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:3001/health &> /dev/null; then
        print_success "Backend API is healthy"
    else
        print_warning "Backend API is not responding yet"
    fi
    
    # Check web app
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Web application is healthy"
    else
        print_warning "Web application is not responding yet"
    fi
    
    # Check AI service
    if curl -f http://localhost:8000/health &> /dev/null; then
        print_success "AI service is healthy"
    else
        print_warning "AI service is not responding yet"
    fi
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
    echo "  🐘 PostgreSQL: localhost:5432"
    echo "  🔴 Redis: localhost:6379"
    echo ""
    echo "Useful Commands:"
    echo "  📊 View logs: docker-compose logs -f"
    echo "  🛑 Stop services: docker-compose down"
    echo "  🔄 Restart services: docker-compose restart"
    echo "  🧹 Clean up: docker-compose down -v"
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
