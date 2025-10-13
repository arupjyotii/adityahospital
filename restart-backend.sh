#!/bin/bash

echo "🏥 Aditya Hospital - Backend Restart Script"
echo "========================================"

echo "Stopping adityahospital process..."
pm2 stop adityahospital

echo "Checking if port 4173 is free..."
lsof -ti:4173 | xargs kill -9 2>/dev/null || echo "No processes found on port 4173"

echo "Checking environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "NODE_ENV: $(grep NODE_ENV .env | cut -d '=' -f2)"
    echo "PORT: $(grep PORT .env | cut -d '=' -f2)"
else
    echo "❌ .env file does not exist"
fi

echo "Starting backend server..."
pm2 start ecosystem.config.js --env production

echo "Saving PM2 configuration..."
pm2 save

echo "Checking status..."
sleep 3
pm2 status

echo "Checking logs..."
pm2 logs adityahospital --lines 10

echo ""
echo "✅ Backend restart complete!"
echo "Test the API endpoints to verify everything is working."