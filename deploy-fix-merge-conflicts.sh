#!/bin/bash

echo "🏥 Aditya Hospital - Deploy and Fix Merge Conflicts"
echo "================================================="

# Navigate to the project directory
cd /root/adityahospital || { echo "❌ Failed to navigate to project directory"; exit 1; }

echo "📂 Current directory: $(pwd)"

# Backup the current state
echo "📦 Creating backup..."
cp -r . /root/adityahospital-backup-$(date +%Y%m%d-%H%M%S) || { echo "❌ Failed to create backup"; exit 1; }

# Update the codebase with the latest fixes
echo "🔄 Updating codebase..."
git stash || { echo "❌ Failed to stash changes"; exit 1; }
git pull origin main || { echo "❌ Failed to pull latest changes"; exit 1; }

# Install dependencies
echo "⚙️ Installing dependencies..."
npm install || { echo "❌ Failed to install dependencies"; exit 1; }

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

# Restart the application
echo "🔄 Restarting application..."
pm2 restart adityahospital || { echo "❌ Failed to restart application"; exit 1; }

# Check the status
echo "📋 Checking application status..."
pm2 status

echo "✅ Merge conflict fix deployment complete!"
echo "💡 Check logs with: pm2 logs adityahospital"