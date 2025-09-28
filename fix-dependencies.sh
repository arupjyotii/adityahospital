#!/bin/bash

# Fix Dependencies Script
# This script cleans and reinstalls all dependencies to fix missing modules

echo "🔧 Fixing Dependencies for Aditya Hospital"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Cleaning existing dependencies..."

# Remove node_modules and package-lock.json
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "Removed node_modules directory"
fi

if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    print_success "Removed package-lock.json"
fi

# Clear npm cache
print_status "Clearing npm cache..."
npm cache clean --force

print_success "Cache cleared successfully"

# Install dependencies
print_status "Installing fresh dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Verify critical dependencies
print_status "Verifying critical dependencies..."

# Check for path-to-regexp
if npm list path-to-regexp >/dev/null 2>&1; then
    print_success "path-to-regexp is installed"
else
    print_warning "path-to-regexp not found, installing explicitly..."
    npm install path-to-regexp@^6.3.0
fi

# Check for express
if npm list express >/dev/null 2>&1; then
    print_success "express is installed"
else
    print_error "express is missing"
    exit 1
fi

# Check for mongoose
if npm list mongoose >/dev/null 2>&1; then
    print_success "mongoose is installed"
else
    print_error "mongoose is missing"
    exit 1
fi

print_success "All dependencies verified!"

# Test the server startup
print_status "Testing server startup..."

# Create a test script to check if the server can start
cat > test-server.js << 'EOF'
// Quick test to see if server dependencies are working
try {
    const express = require('express');
    const mongoose = require('mongoose');
    console.log('✅ Express and Mongoose loaded successfully');
    console.log('✅ Dependencies are working correctly');
    process.exit(0);
} catch (error) {
    console.error('❌ Error loading dependencies:', error.message);
    process.exit(1);
}
EOF

if node test-server.js; then
    print_success "Server dependencies test passed"
    rm test-server.js
else
    print_error "Server dependencies test failed"
    rm test-server.js
    exit 1
fi

print_success "🎉 Dependencies fixed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Try running the server: npm start"
echo "2. For development: npm run dev"
echo "3. Check logs if issues persist"