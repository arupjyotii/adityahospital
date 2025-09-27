#!/bin/bash

# Fix Port 80 Conflict for Nginx
# This script identifies what's using port 80 and resolves the conflict

echo "🔧 Fixing Port 80 Conflict for Nginx..."
echo "=================================="

# Check what's using port 80
echo "🔍 Checking what's using port 80..."
PORT_80_PROCESS=$(sudo netstat -tlnp | grep :80 | head -1)
if [ -n "$PORT_80_PROCESS" ]; then
    echo "📍 Found process using port 80:"
    echo "$PORT_80_PROCESS"
    
    # Extract process name and PID
    PROCESS_INFO=$(echo "$PORT_80_PROCESS" | awk '{print $7}')
    PID=$(echo "$PROCESS_INFO" | cut -d'/' -f1)
    PROCESS_NAME=$(echo "$PROCESS_INFO" | cut -d'/' -f2)
    
    echo "Process: $PROCESS_NAME (PID: $PID)"
else
    echo "❌ No process found on port 80 (this is unexpected)"
fi

# Check for common web servers
echo ""
echo "🔍 Checking for running web servers..."

# Check Apache
if systemctl is-active --quiet apache2 2>/dev/null; then
    echo "🟡 Apache2 is running"
    APACHE_RUNNING=true
elif systemctl is-active --quiet httpd 2>/dev/null; then
    echo "🟡 Apache (httpd) is running"
    APACHE_RUNNING=true
else
    APACHE_RUNNING=false
fi

# Check if nginx is already running (from previous installation)
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "🟡 Nginx service is already running (might be misconfigured)"
    NGINX_RUNNING=true
else
    NGINX_RUNNING=false
fi

echo ""
echo "🛠️ Resolving conflicts..."

# Stop Apache if it's running
if [ "$APACHE_RUNNING" = true ]; then
    echo "⏹️ Stopping Apache..."
    sudo systemctl stop apache2 2>/dev/null || sudo systemctl stop httpd 2>/dev/null
    sudo systemctl disable apache2 2>/dev/null || sudo systemctl disable httpd 2>/dev/null
    echo "✅ Apache stopped and disabled"
fi

# Stop nginx if it's running with issues
if [ "$NGINX_RUNNING" = true ]; then
    echo "⏹️ Stopping existing Nginx..."
    sudo systemctl stop nginx
    echo "✅ Nginx stopped"
fi

# Kill any remaining processes on port 80
echo "🔫 Killing any remaining processes on port 80..."
sudo fuser -k 80/tcp 2>/dev/null || true
sleep 2

# Verify port 80 is free
echo "🔍 Verifying port 80 is now free..."
if ! sudo netstat -tlnp | grep :80 > /dev/null; then
    echo "✅ Port 80 is now available"
else
    echo "⚠️ Port 80 is still in use. Manual intervention may be required."
    sudo netstat -tlnp | grep :80
fi

# Fix Nginx configuration if needed
echo ""
echo "🔧 Checking Nginx configuration..."

# Test nginx configuration
if sudo nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
else
    echo "⚠️ Nginx configuration has issues. Let's fix them..."
    
    # Create a basic working configuration
    sudo tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    include /etc/nginx/conf.d/*.conf;

    server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  _;
        root         /usr/share/nginx/html;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
EOF

    echo "✅ Created basic Nginx configuration"
fi

# Create nginx user if it doesn't exist
if ! id "nginx" &>/dev/null; then
    echo "👤 Creating nginx user..."
    sudo useradd -r -d /var/cache/nginx -s /sbin/nologin nginx 2>/dev/null || true
    echo "✅ Nginx user created"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
sudo mkdir -p /var/log/nginx
sudo mkdir -p /var/cache/nginx
sudo mkdir -p /etc/nginx/conf.d
sudo mkdir -p /usr/share/nginx/html
sudo mkdir -p /run

# Set proper permissions
sudo chown -R nginx:nginx /var/log/nginx
sudo chown -R nginx:nginx /var/cache/nginx
sudo chmod 755 /var/log/nginx
sudo chmod 755 /var/cache/nginx

# Create a simple index.html if it doesn't exist
if [ ! -f /usr/share/nginx/html/index.html ]; then
    sudo tee /usr/share/nginx/html/index.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to nginx!</title>
</head>
<body>
    <h1>Welcome to nginx!</h1>
    <p>If you see this page, the nginx web server is successfully installed and working.</p>
</body>
</html>
EOF
    echo "✅ Created default index.html"
fi

# Test configuration again
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration test passed"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Start Nginx
echo ""
echo "🚀 Starting Nginx..."
if sudo systemctl start nginx; then
    echo "✅ Nginx started successfully"
    
    # Enable nginx to start on boot
    sudo systemctl enable nginx
    echo "✅ Nginx enabled for auto-start"
    
    # Check status
    echo ""
    echo "📊 Nginx Status:"
    sudo systemctl status nginx --no-pager -l
    
    echo ""
    echo "🌐 Testing web server..."
    if curl -s http://localhost > /dev/null; then
        echo "✅ Nginx is responding on port 80"
    else
        echo "⚠️ Nginx may not be responding properly"
    fi
    
else
    echo "❌ Failed to start Nginx"
    echo "📋 Checking logs..."
    sudo journalctl -xeu nginx.service --no-pager -l
    exit 1
fi

echo ""
echo "🎉 Port 80 conflict resolved! Nginx is now running."
echo "📝 Next steps:"
echo "   1. Configure your domain settings"
echo "   2. Set up SSL certificates"
echo "   3. Configure reverse proxy for your Node.js app"