#!/bin/bash

# Production Start Script for Aditya Hospital
# Run this on adityahospitalnagaon.com server

echo "🏥 Starting Aditya Hospital in Production Mode..."

# Stop any running development processes
echo "🛑 Stopping development processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Copy production environment
echo "📝 Setting up production environment..."
cp .env.production .env

# Install dependencies (production only)
echo "📦 Installing production dependencies..."
npm ci --only=production

# Build frontend only (backend is already in JS)
echo "🔨 Building frontend for production..."
npm run build

# Initialize database if needed
echo "💾 Initializing database..."
node server/init-db.js

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# Setup PM2 startup (run only once)
echo "⚙️ Setting up PM2 startup..."
pm2 startup | tail -1 | bash 2>/dev/null || echo "PM2 startup already configured"

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