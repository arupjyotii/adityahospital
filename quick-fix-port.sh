#!/bin/bash

# Aggressive fix for port 4173 conflict
echo "🚀 Aggressive Fix: Forcefully clearing port 4173..."

# Stop ALL PM2 processes
echo "⏹️ Stopping PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Kill ALL node processes
echo "🔫 Killing all Node.js processes..."
sudo pkill -f node 2>/dev/null || true
sudo pkill -f "server/index.js" 2>/dev/null || true
sudo pkill -f "aditya-hospital" 2>/dev/null || true

# Forcefully kill anything on port 4173
echo "🔫 Force killing processes on port 4173..."
sudo fuser -k 4173/tcp 2>/dev/null || true
sudo lsof -ti:4173 | xargs -r sudo kill -9 2>/dev/null || true
sudo ss -lptn 'sport = :4173' | grep -oP 'pid=\K[0-9]+' | xargs -r sudo kill -9 2>/dev/null || true

# Wait longer for processes to fully terminate
echo "⏳ Waiting for processes to terminate..."
sleep 5

# Check if port is still in use
echo "🔍 Checking if port 4173 is free..."
if sudo netstat -tlnp | grep :4173; then
    echo "⚠️ Port 4173 still in use! Trying more aggressive approach..."
    # Find and kill the specific process
    PID=$(sudo netstat -tlnp | grep :4173 | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$PID" ]; then
        echo "🎯 Killing specific PID: $PID"
        sudo kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
else
    echo "✅ Port 4173 is now free!"
fi

# Navigate to project directory
echo "📁 Navigating to project directory..."
cd /home/admin/domains/adityahospitalnagaon.com/public_html

# Verify we're in the right place
if [ ! -f "server/index.js" ]; then
    echo "❌ Error: server/index.js not found in $(pwd)"
    echo "📂 Contents:"
    ls -la
    exit 1
fi

# Start PM2 daemon fresh
echo "🔄 Restarting PM2 daemon..."
pm2 kill 2>/dev/null || true
sleep 2

# Try starting the server
echo "🚀 Starting server with PM2..."
if pm2 start server/index.js --name "aditya-hospital" --watch false --env production; then
    echo "✅ Server started successfully!"
    pm2 save
    pm2 status
    
    # Test the server
    echo "🧪 Testing server..."
    sleep 3
    if curl -s http://adityahospitalnagaon.com/api/health >/dev/null 2>&1; then
        echo "✅ Server is responding on port 4173"
    else
        echo "⚠️ Server may not be responding, checking logs..."
        pm2 logs aditya-hospital --lines 5
    fi
else
    echo "❌ Failed to start with PM2, trying direct start..."
    echo "🐛 Starting directly for debugging..."
    nohup node server/index.js > server.log 2>&1 &
    SERVER_PID=$!
    echo "Started with PID: $SERVER_PID"
    sleep 3
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "✅ Server started directly, check server.log for details"
        echo "📋 Last few log lines:"
        tail -10 server.log
    else
        echo "❌ Server failed to start, check server.log"
        cat server.log
    fi
fi