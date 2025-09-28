#!/bin/bash

# Fix MongoDB Dependencies Script
# This script cleans and reinstalls dependencies for MongoDB setup

echo "🔧 Fixing MongoDB dependencies..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Remove node_modules and package-lock.json
echo "🗑️  Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi

# Verify key dependencies
echo "✅ Verifying key dependencies..."
dependencies=("express" "mongoose" "path-to-regexp" "bcryptjs" "jsonwebtoken")

for dep in "${dependencies[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        echo "✅ $dep - OK"
    else
        echo "❌ $dep - NOT FOUND"
    fi
done

echo "🎉 MongoDB dependencies fixed successfully!"
echo ""
echo "To start the application, run:"
echo "  npm start"
echo ""
echo "To start the application in development mode, run:"
echo "  npm run dev"