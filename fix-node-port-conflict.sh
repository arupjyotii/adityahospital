#!/bin/bash

# Fix Node.js Port 4173 Conflict
# This script stops all conflicting Node.js processes and starts the server properly

echo "🔧 Fixing Node.js Port 4173 Conflict..."
echo "======================================"

# Check what's using port 4173
echo "🔍 Checking what's using port 4173..."
PORT_4173_PROCESS=$(sudo netstat -tlnp | grep :4173 | head -1)
if [ -n "$PORT_4173_PROCESS" ]; then
    echo "📍 Found process using port 4173:"
    echo "$PORT_4173_PROCESS"
    
    # Extract process info
    PROCESS_INFO=$(echo "$PORT_4173_PROCESS" | awk '{print $7}')
    PID=$(echo "$PROCESS_INFO" | cut -d'/' -f1)
    PROCESS_NAME=$(echo "$PROCESS_INFO" | cut -d'/' -f2)
    
    echo "Process: $PROCESS_NAME (PID: $PID)"
else
    echo "ℹ️ No process found on port 4173"
fi

# Check PM2 processes
echo ""
echo "🔍 Checking PM2 processes..."
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 processes:"
    pm2 list
    
    # Stop all PM2 processes
    echo ""
    echo "⏹️ Stopping all PM2 processes..."
    pm2 stop all
    pm2 delete all
    echo "✅ All PM2 processes stopped and deleted"
else
    echo "ℹ️ PM2 not found or not installed"
fi

# Kill any Node.js processes on port 4173
echo ""
echo "🔫 Killing any Node.js processes on port 4173..."
sudo fuser -k 4173/tcp 2>/dev/null || true

# Kill any node processes that might be running our app
echo "🔫 Killing any remaining Node.js processes..."
pkill -f "server/index.js" 2>/dev/null || true
pkill -f "aditya-hospital" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 3

# Verify port 4173 is free
echo ""
echo "🔍 Verifying port 4173 is now free..."
if ! sudo netstat -tlnp | grep :4173 > /dev/null; then
    echo "✅ Port 4173 is now available"
else
    echo "⚠️ Port 4173 is still in use:"
    sudo netstat -tlnp | grep :4173
    echo ""
    echo "🔫 Force killing remaining processes..."
    sudo ss -lptn 'sport = :4173' | grep -oP 'pid=\K[0-9]+' | xargs -r sudo kill -9
    sleep 2
fi

# Navigate to project directory
cd /home/admin/domains/adityahospitalnagaon.com/public_html

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct project directory"
    echo "📍 Current directory: $(pwd)"
    echo "🔍 Looking for project files..."
    find /home/admin/domains/adityahospitalnagaon.com -name "package.json" -type f 2>/dev/null
    exit 1
fi

echo "✅ Found project directory: $(pwd)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if server file exists
if [ ! -f "server/index.js" ]; then
    echo "❌ Error: server/index.js not found"
    echo "📁 Available files:"
    ls -la server/ 2>/dev/null || echo "Server directory not found"
    exit 1
fi

# Test the server configuration
echo ""
echo "🧪 Testing server configuration..."
node -c server/index.js
if [ $? -eq 0 ]; then
    echo "✅ Server syntax is valid"
else
    echo "❌ Server syntax error detected"
    exit 1
fi

# Start the server using PM2
echo ""
echo "🚀 Starting server with PM2..."

# Create ecosystem file if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
    echo "📝 Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.js << 'EOF'
export default {
  apps: [{
    name: 'aditya-hospital',
    script: 'server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
    echo "✅ Ecosystem configuration created"
fi

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
if [ $? -eq 0 ]; then
    echo "✅ Server started successfully with PM2"
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    # Show status
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    # Test the server
    echo ""
    echo "🌐 Testing server..."
    sleep 2
    if curl -s http://adityahospitalnagaon.com/api/health > /dev/null; then
        echo "✅ Server is responding on port 4173"
    else
        echo "⚠️ Server may not be responding properly"
        echo "📋 Checking PM2 logs..."
        pm2 logs aditya-hospital --lines 10
    fi
    
else
    echo "❌ Failed to start server with PM2"
    echo "📋 Trying direct start for debugging..."
    
    # Try starting directly for better error messages
    echo "🐛 Starting server directly for debugging..."
    timeout 10s node server/index.js &
    DIRECT_PID=$!
    sleep 3
    
    if kill -0 $DIRECT_PID 2>/dev/null; then
        echo "✅ Server can start directly"
        kill $DIRECT_PID
        echo "🔄 Retrying with PM2..."
        pm2 start ecosystem.config.js
    else
        echo "❌ Server fails to start directly too"
        echo "📋 Check the error messages above"
    fi
fi

echo ""
echo "🎉 Port 4173 conflict resolved!"
echo "📝 Server status:"
pm2 status
echo ""
echo "🔗 Your backend should now be accessible at:"
echo "   - Local: http://adityahospitalnagaon.com"
echo "   - Production: https://adityahospitalnagaon.com (via Nginx proxy)"