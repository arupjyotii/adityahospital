#!/bin/bash

# Aditya Hospital - VPS Deployment Script
# This script deploys the application to the VPS environment

echo "🚀 Starting Aditya Hospital deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install dependencies with force to resolve any version conflicts
echo "📦 Installing dependencies..."
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --force

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Environment Configuration
NODE_ENV=production
PORT=4173
HOST=localhost

# Database Configuration
DB_NAME=aditya_hospital
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=https://adityahospitalnagaon.com,https://www.adityahospitalnagaon.com

# Frontend URL
FRONTEND_URL=https://adityahospitalnagaon.com
EOF
fi

# Create .env file for client if it doesn't exist
if [ ! -f "client/.env" ]; then
    echo "📝 Creating client .env file..."
    cat > client/.env << EOF
VITE_API_URL=https://adityahospitalnagaon.com/api
EOF
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "To start the application, run:"
echo "  npm start"
echo ""
echo "To start the application with PM2 (recommended for production):"
echo "  pm2 start ecosystem.config.js"