#!/bin/bash

# Aditya Hospital - Fix Build Environment Script
# This script fixes permission issues and environment problems that prevent building

echo "🏥 Starting Aditya Hospital BUILD ENVIRONMENT FIX..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Fix permissions for node_modules
echo "🔧 Fixing node_modules permissions..."
chmod -R 755 node_modules 2>/dev/null || echo "No node_modules directory or permission issue"

# Specifically fix esbuild permissions
echo "🔧 Fixing esbuild permissions..."
find node_modules -name "esbuild" -type d -exec chmod 755 {} \; 2>/dev/null || echo "No esbuild directory found"
find node_modules -name "esbuild" -type d -exec chmod +x {} \; 2>/dev/null || echo "Could not make esbuild executable"

# Fix permissions for esbuild binaries specifically
find node_modules -path "*/esbuild/*" -name "esbuild" -type f -exec chmod +x {} \; 2>/dev/null || echo "Could not make esbuild binaries executable"

# Clean node_modules and reinstall
echo "🧹 Cleaning node_modules and reinstalling dependencies..."
rm -rf node_modules
rm -rf client/node_modules

# Install dependencies with proper permissions
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

# Fix any remaining permission issues
echo "🔧 Fixing remaining permission issues..."
chmod +x node_modules/.bin/* 2>/dev/null || echo "Could not fix bin permissions"
chmod +x client/node_modules/.bin/* 2>/dev/null || echo "Could not fix client bin permissions"

# Check if vite.config.js exists and is readable
echo "🔍 Checking Vite configuration..."
if [ ! -f "vite.config.js" ]; then
    echo "❌ Error: vite.config.js not found!"
    exit 1
fi

# Try to validate the Vite config
echo "🔍 Validating Vite configuration..."
node -e "import('./vite.config.js').then(config => console.log('Vite config loaded successfully')).catch(err => {console.error('Vite config error:', err); process.exit(1);})" 2>/dev/null || echo "Could not validate Vite config - this might be OK"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Try to build the frontend
echo "🏗️  Building frontend..."
cd client
npm run build
BUILD_RESULT=$?
cd ..

# Check if build was successful
if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    echo "Trying alternative build method..."
    
    # Try building with increased memory
    echo "🏗️  Trying build with increased memory..."
    cd client
    NODE_OPTIONS="--max-old-space-size=4096" npm run build
    BUILD_RESULT=$?
    cd ..
    
    if [ $BUILD_RESULT -ne 0 ]; then
        echo "❌ Error: Failed to build frontend even with increased memory."
        exit 1
    fi
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

# Verify the build
echo "🔍 Verifying build..."
node verify-build.js

# Check if verification was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Build verification failed."
    exit 1
fi

echo "✅ Build environment fixed successfully!"
echo ""
echo "To restart the application with PM2:"
echo "  pm2 restart adityahospital"
echo ""
echo "To view logs:"
echo "  pm2 logs adityahospital"