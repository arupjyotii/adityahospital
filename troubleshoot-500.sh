#!/bin/bash

# Aditya Hospital - Complete 500 Error Troubleshooting Script
# This script diagnoses and fixes all issues that could cause a 500 Internal Server Error

echo "🏥 Starting Aditya Hospital 500 ERROR TROUBLESHOOTING..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

echo "🔍 DIAGNOSING CURRENT STATE..."

# Check PM2 status
echo "📋 Checking PM2 status..."
pm2 status

# Check PM2 logs for errors
echo "📋 Checking recent PM2 logs..."
pm2 logs adityahospital --lines 20

# Check if dist/public exists
echo "📁 Checking if build files exist..."
if [ -d "dist/public" ]; then
    echo "✅ dist/public directory exists"
    if [ -f "dist/public/index.html" ]; then
        echo "✅ index.html exists"
        echo "📄 index.html size: $(ls -la dist/public/index.html | awk '{print $5}') bytes"
    else
        echo "❌ index.html does NOT exist"
    fi
else
    echo "❌ dist/public directory does NOT exist"
fi

# Run our diagnostic scripts
echo "🔍 Running static file diagnostic..."
node diagnose-static-files.js

echo "🔍 Running PM2 diagnostic..."
node diagnose-pm2.js

# Check environment variables
echo "📋 Checking environment variables..."
echo "NODE_ENV: ${NODE_ENV:-Not set}"
echo "PORT: ${PORT:-Not set}"
echo "HOST: ${HOST:-Not set}"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file does NOT exist"
fi

echo ""
echo "🔧 APPLYING FIXES..."

# Fix static file paths in server code
echo "🔧 Fixing static file paths..."
sed -i "s|path.join(__dirname, '../../adityahospital/dist/public')|path.join(__dirname, '../dist/public')|g" server/index.js
sed -i "s|path.join(__dirname, '../../adityahospital/dist/public/index.html')|path.join(__dirname, '../dist/public/index.html')|g" server/index.js

# Verify the paths were fixed
echo "🔍 Verifying path fixes..."
grep -n "dist/public" server/index.js

# Rebuild frontend if needed
echo "🏗️  Verifying frontend build..."
if [ ! -d "dist/public" ] || [ ! -f "dist/public/index.html" ]; then
    echo "🏗️  Building frontend..."
    cd client
    npm run build
    cd ..
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to build frontend."
        exit 1
    fi
else
    echo "✅ Frontend build already exists"
fi

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart adityahospital

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "📋 FINAL STATUS CHECK..."
pm2 status

echo ""
echo "✅ Troubleshooting complete!"
echo ""
echo "To check the application:"
echo "  pm2 logs adityahospital --lines 50"
echo ""
echo "If issues persist, check:"
echo "  - TROUBLESHOOT-500.md for detailed troubleshooting steps"
echo "  - Ensure the domain points to the correct server IP"
echo "  - Verify Nginx configuration if used as a reverse proxy"
echo "  - Check firewall settings for port 4173"