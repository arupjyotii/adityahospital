#!/bin/bash

# Production Start Script for Aditya Hospital (No Build Required)
# Run this on adityahospitalnagaon.com server when frontend is pre-built

echo "🏥 Starting Aditya Hospital in Production Mode..."

# Stop any running development processes
echo "🛑 Stopping all processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Copy production environment
echo "📝 Setting up production environment..."
cp .env.production .env

# Check if dist directory exists (pre-built frontend)
if [ -d "dist/public" ]; then
    echo "✅ Found pre-built frontend in dist/public"
else
    echo "⚠️  No pre-built frontend found. Creating minimal structure..."
    mkdir -p dist/public
    echo "<html><body><h1>Aditya Hospital - Backend Running</h1><p>Frontend build required</p></body></html>" > dist/public/index.html
fi

# Install only production dependencies (skip devDependencies)
echo "📦 Installing production dependencies..."
npm ci --omit=dev --ignore-scripts

# Initialize database if needed
echo "💾 Initializing database..."
node server/init-db.js

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Test the server file exists
if [ ! -f "server/index.js" ]; then
    echo "❌ Error: server/index.js not found!"
    echo "📂 Current directory: $(pwd)"
    echo "📋 Files in current directory:"
    ls -la
    exit 1
fi

echo "✅ Server file found: $(pwd)/server/index.js"

# Start with PM2 (simple start first)
echo "🚀 Starting application with PM2..."
pm2 start server/index.js --name "aditya-hospital" --env production
pm2 save

# Setup PM2 startup (run only once)
echo "⚙️ Setting up PM2 startup..."
pm2 startup > /tmp/pm2_startup.log 2>&1 || echo "PM2 startup command generated (check logs if needed)"

# Show status
echo "📊 Application Status:"
pm2 status

echo ""
echo "✅ Production deployment complete!"
echo "🌍 Website: https://adityahospitalnagaon.com"
echo "🔧 Admin Panel: https://adityahospitalnagaon.com/admin"
echo "🩺 API Health: https://adityahospitalnagaon.com/api/health"
echo ""
echo "📝 Useful Commands:"
echo "   pm2 logs        - View logs"
echo "   pm2 restart all - Restart application"
echo "   pm2 stop all    - Stop application"
echo "   pm2 monit       - Monitor processes"
echo "   pm2 status      - Check status"
echo ""
echo "🔍 If website shows 'Backend Running', you need to:"
echo "   1. Build frontend locally: npm run build"
echo "   2. Upload dist/public/ to server"
echo "   3. Restart: pm2 restart all"