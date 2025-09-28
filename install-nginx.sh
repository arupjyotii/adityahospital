#!/bin/bash

# Install and Configure Nginx for Aditya Hospital
# This script sets up Nginx with proper configuration

echo "🌐 Installing and Configuring Nginx for adityahospitalnagaon.com..."
echo "=================================================================="

# Variables
DOMAIN="adityahospitalnagaon.com"
WEB_ROOT="/home/admin/domains/adityahospitalnagaon.com/public_html"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
SSL_EMAIL="admin@adityahospitalnagaon.com"

# Step 1: Detect OS and Install Nginx
echo "1️⃣  Detecting OS and installing Nginx..."

# Detect OS
if [ -f /etc/redhat-release ]; then
    OS="rhel"
    echo "📋 Detected: Red Hat/CentOS/Rocky Linux"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    echo "📋 Detected: Debian/Ubuntu"
else
    echo "⚠️  Unknown OS, trying generic installation..."
    OS="unknown"
fi

# Install Nginx based on OS
if [ "$OS" = "rhel" ]; then
    echo "📦 Installing Nginx on RHEL/CentOS..."
    
    # Try different methods
    if command -v dnf &> /dev/null; then
        sudo dnf update -y
        sudo dnf install -y epel-release
        sudo dnf install -y nginx
    elif command -v yum &> /dev/null; then
        sudo yum update -y
        sudo yum install -y epel-release
        sudo yum install -y nginx
    else
        echo "❌ No package manager found (yum/dnf)"
        exit 1
    fi
    
elif [ "$OS" = "debian" ]; then
    echo "📦 Installing Nginx on Debian/Ubuntu..."
    sudo apt update -y
    sudo apt install -y nginx
    
else
    echo "❌ Unsupported operating system"
    echo "🔍 Please install Nginx manually:"
    echo "   - RHEL/CentOS: sudo yum install epel-release && sudo yum install nginx"
    echo "   - Ubuntu/Debian: sudo apt update && sudo apt install nginx"
    echo "   - Or download from: https://nginx.org/en/download.html"
    exit 1
fi

# Verify installation
echo "🔍 Verifying Nginx installation..."
if command -v nginx &> /dev/null; then
    echo "✅ Nginx binary found: $(which nginx)"
    nginx -v
else
    echo "❌ Nginx installation failed - binary not found"
    echo "📋 Checking available web servers:"
    command -v apache2 && echo "Found: Apache2"
    command -v httpd && echo "Found: Apache (httpd)"
    command -v lighttpd && echo "Found: Lighttpd"
    
    echo ""
    echo "🔄 Alternative: Use Apache if available"
    if command -v httpd &> /dev/null || command -v apache2 &> /dev/null; then
        echo "Would you like to configure Apache instead? (Manual setup required)"
    fi
    exit 1
fi

# Check if systemd service exists
echo "🔍 Checking Nginx service..."
if systemctl list-unit-files | grep -q nginx.service; then
    echo "✅ Nginx service found"
else
    echo "⚠️  Nginx service not found, trying alternative service names..."
    if systemctl list-unit-files | grep -q nginx; then
        echo "✅ Found alternative nginx service"
    else
        echo "❌ No nginx service found"
        echo "📋 Available services:"
        systemctl list-unit-files | grep -E "(nginx|apache|httpd)" || echo "No web server services found"
        echo ""
        echo "🔧 Try starting nginx manually:"
        echo "   sudo nginx"
        exit 1
    fi
fi

# Step 2: Start and enable Nginx
echo "2️⃣  Starting Nginx service..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is now running"
else
    echo "❌ Failed to start Nginx"
    sudo systemctl status nginx
    exit 1
fi

# Step 3: Configure firewall
echo "3️⃣  Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL with firewalld
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewall configured (firewalld)"
elif command -v ufw &> /dev/null; then
    # Ubuntu with ufw
    sudo ufw allow 'Nginx Full'
    echo "✅ Firewall configured (ufw)"
else
    echo "⚠️  Please manually configure firewall for ports 80 and 443"
fi

# Step 4: Create Nginx configuration
echo "4️⃣  Creating Nginx configuration..."
sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    root $WEB_ROOT/dist/public;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://adityahospitalnagaon.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Frontend routes - serve React app
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static files with caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\\?$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Error and access logs
    error_log /var/log/nginx/$DOMAIN.error.log;
    access_log /var/log/nginx/$DOMAIN.access.log;
}
EOF

echo "✅ Nginx configuration created: $NGINX_CONFIG"

# Step 5: Enable the site
echo "5️⃣  Enabling the site..."
sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$DOMAIN"

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Step 6: Test configuration
echo "6️⃣  Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Step 7: Reload Nginx
echo "7️⃣  Reloading Nginx..."
sudo systemctl reload nginx

# Step 8: Install Certbot for SSL
echo "8️⃣  Installing Certbot for SSL..."
if command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum install -y certbot python3-certbot-nginx
elif command -v apt &> /dev/null; then
    # Ubuntu/Debian
    sudo apt install -y certbot python3-certbot-nginx
fi

# Step 9: Setup SSL (optional - requires domain to point to server)
echo "9️⃣  Setting up SSL certificate..."
echo "⚠️  Make sure your domain $DOMAIN points to this server's IP address"
echo "🌍 Server IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Unable to detect')"
echo ""
read -p "🔐 Do you want to setup SSL certificate now? (y/n): " -n 1 -r
echo
if [[ \$REPLY =~ ^[Yy]\$ ]]; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL || {
        echo "⚠️  SSL setup failed. You can run it manually later:"
        echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    }
fi

# Step 10: Final status check
echo "🔟 Final status check..."
echo "========================"
echo "🌐 Nginx status: $(systemctl is-active nginx)"
echo "📊 PM2 status:"
pm2 status | grep aditya-hospital

echo ""
echo "✅ Nginx installation and configuration complete!"
echo ""
echo "🧪 Test your website:"
echo "   🌍 Website: https://$DOMAIN"
echo "   🩺 API Health: https://$DOMAIN/api/health" 
echo "   🔧 Admin Panel: https://$DOMAIN/admin"
echo ""
echo "📝 Useful commands:"
echo "   sudo systemctl status nginx    - Check Nginx status"
echo "   sudo systemctl reload nginx    - Reload configuration"
echo "   sudo nginx -t                  - Test configuration"
echo "   sudo tail -f /var/log/nginx/$DOMAIN.error.log - View error logs"
echo ""
echo "🔐 To setup SSL later:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"