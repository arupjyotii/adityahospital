#!/bin/bash

# Aditya Hospital Admin Panel Deployment Script
# For adityahospitalnagaon.com

set -e

echo "🚀 Starting deployment for Aditya Hospital Admin Panel..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build the application
print_status "Building the application..."
npm run build

# Install only production dependencies after build
print_status "Installing production dependencies..."
npm ci --only=production

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs data uploads

# Set proper permissions
print_status "Setting permissions..."
chmod 755 logs data uploads
chmod 644 env.production

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop aditya-hospital-admin 2>/dev/null || true
pm2 delete aditya-hospital-admin 2>/dev/null || true

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_success "Deployment completed successfully!"
print_status "Application is running on: https://adityahospitalnagaon.com"
print_status "Health check: https://adityahospitalnagaon.com/health"

# Show PM2 status
print_status "PM2 Status:"
pm2 status

# Show logs
print_status "Recent logs:"
pm2 logs aditya-hospital-admin --lines 10

echo ""
print_success "🎉 Aditya Hospital Admin Panel is now live!"
print_status "Admin Panel: https://adityahospitalnagaon.com/admin"
print_status "Public Website: https://adityahospitalnagaon.com"
print_status "Default Login: admin / password"
print_warning "⚠️  Please change the default password after first login!"

