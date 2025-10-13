#!/bin/bash

echo "🏥 Aditya Hospital - Deploy and Fix Merge Conflicts"
echo "================================================="

# Navigate to the project directory
cd /root/adityahospital || { echo "❌ Failed to navigate to project directory"; exit 1; }

echo "📂 Current directory: $(pwd)"

# Backup the current state
echo "📦 Creating backup..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp -r . /root/adityahospital-backup-$TIMESTAMP || { echo "❌ Failed to create backup"; exit 1; }

# Update the codebase with the latest fixes
echo "🔄 Updating codebase..."
git stash || { echo "❌ Failed to stash changes"; exit 1; }
git pull origin main || { echo "❌ Failed to pull latest changes"; exit 1; }

# Install dependencies
echo "⚙️ Installing dependencies..."
npm install --force || { echo "❌ Failed to install dependencies"; exit 1; }

# Check for merge conflicts
echo "🔍 Checking for merge conflicts..."
node find-merge-conflicts.js

# Fix merge conflicts if any are found
echo "🔧 Fixing merge conflicts..."
node fix-actual-merge-conflicts.js

# Rebuild the frontend
echo "🏗️ Rebuilding frontend..."
cd client && npm run build || { echo "❌ Failed to build frontend"; exit 1; }
cd ..

# Create logs directory if it doesn't exist
echo "📂 Creating logs directory..."
mkdir -p logs

# Stop any existing PM2 processes
echo "⏹️ Stopping existing PM2 processes..."
pm2 stop adityahospital 2>/dev/null || echo "No existing processes to stop"

# Delete any existing PM2 processes
echo "🗑️ Deleting existing PM2 processes..."
pm2 delete adityahospital 2>/dev/null || echo "No existing processes to delete"

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production || { echo "❌ Failed to start application"; exit 1; }

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save || { echo "❌ Failed to save PM2 configuration"; exit 1; }

# Check the status
echo "📋 Checking application status..."
pm2 status

echo "✅ Merge conflict fix deployment complete!"
echo "💡 Check logs with: pm2 logs adityahospital"