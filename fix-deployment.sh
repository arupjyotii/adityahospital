#!/bin/bash

# Aditya Hospital - Fixed Deployment Script
# This script properly deploys the application to the VPS environment with correct build process

echo "🏥 Starting Aditya Hospital FIXED deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/
rm -rf client/node_modules/

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --force

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install root dependencies."
    exit 1
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install --force
cd ..

# Check if client installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install client dependencies."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Environment Configuration
NODE_ENV=production
PORT=4173
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aditya_hospital

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=https://adityahospitalnagaon.com,https://www.adityahospitalnagaon.com

# Frontend URL
FRONTEND_URL=https://adityahospitalnagaon.com
EOF
fi

# Create client .env file if it doesn't exist
if [ ! -f "client/.env" ]; then
    echo "📝 Creating client .env file..."
    cat > client/.env << EOF
VITE_API_URL=https://adityahospitalnagaon.com/api
EOF
fi

# Build the frontend properly
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

# Initialize database
echo "💾 Initializing database..."
node server/init-db.js

# Check if database initialization was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to initialize database."
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "To start the application with PM2 (recommended for production):"
echo "  pm2 start ecosystem.config.js --env production"
echo "  pm2 save"
echo ""
echo "To view logs:"
echo "  pm2 logs aditya-hospital"