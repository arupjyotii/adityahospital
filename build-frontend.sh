#!/bin/bash

# Script to build the frontend properly
# This should be run on the VPS during deployment

echo "🏥 Aditya Hospital - Frontend Build Script"
echo "========================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Check if client directory exists
if [ ! -d "client" ]; then
    echo "❌ Error: client directory not found."
    exit 1
fi

# Install client dependencies if node_modules doesn't exist
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client
    npm install --force
    cd ..
fi

# Create client .env file if it doesn't exist
if [ ! -f "client/.env" ]; then
    echo "📝 Creating client .env file..."
    cat > client/.env << EOF
VITE_API_URL=https://adityahospitalnagaon.com/api
EOF
fi

# Build the frontend
echo "🏗️  Building frontend..."
cd client
npm run build
cd ..

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    exit 1
fi

# Verify that the build directory exists and has content
if [ ! -d "dist/public" ] || [ -z "$(ls -A dist/public)" ]; then
    echo "❌ Error: Build directory is missing or empty."
    exit 1
fi

echo "✅ Frontend build completed successfully!"
echo "📁 Build output is in: dist/public/"

# List build files
echo "📋 Build files:"
ls -la dist/public/