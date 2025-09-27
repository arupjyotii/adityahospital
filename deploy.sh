#!/bin/bash

# Aditya Hospital - VPS Deployment Script
# Run this script on your VPS after uploading the project files

set -e  # Exit on any error

echo "🏥 Starting Aditya Hospital deployment..."

# Configuration
PROJECT_DIR="/var/www/adityahospital"
NODE_VERSION="18"
DOMAIN="adityahospitalnagaon.com"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider using a non-root user with sudo privileges."
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
print_status "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js version: $node_version"
print_status "npm version: $npm_version"

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    print_warning "Project directory $PROJECT_DIR not found. Please upload your project files first."
    exit 1
fi

# Navigate to project directory
cd $PROJECT_DIR

# Install dependencies
print_status "Installing project dependencies..."
npm install --production

# Copy environment file
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        print_status "Copying production environment file..."
        cp .env.production .env
    else
        print_error "No environment file found. Please create .env file."
        exit 1
    fi
fi

# Build frontend
print_status "Building frontend..."
npm run build

# Create log directory for PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | sudo bash

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\\$server_name\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL configuration will be added by Certbot

    root $PROJECT_DIR/dist/public;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API routes
    location /api/ {
        proxy_pass http://adityahospitalnagaon.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Frontend routes
    location / {
        try_files \\$uri \\$uri/ /index.html;
    }

    # Static files with caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\\$ {
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
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL

# Setup automatic SSL renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/pm2 > /dev/null <<EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Initialize database (optional)
read -p "Do you want to initialize the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Initializing database..."
    node server/init-db.js
fi

# Final status check
print_status "Checking application status..."
pm2 status
sudo systemctl status nginx --no-pager

# Display success message
echo
echo "🎉 Deployment completed successfully!"
echo
echo "📋 Summary:"
echo "   Domain: https://$DOMAIN"
echo "   API: https://$DOMAIN/api/health"
echo "   Admin Panel: https://$DOMAIN/admin"
echo "   Default Admin: admin / admin123"
echo
echo "🔧 Management Commands:"
echo "   PM2 Status: pm2 status"
echo "   PM2 Logs: pm2 logs"
echo "   PM2 Restart: pm2 restart all"
echo "   Nginx Status: sudo systemctl status nginx"
echo "   Nginx Reload: sudo systemctl reload nginx"
echo
echo "⚠️  Important:"
echo "   1. Change the default admin password immediately"
echo "   2. Update your MongoDB connection string in .env"
echo "   3. Verify your domain DNS settings"
echo "   4. Test all functionality"
echo
print_warning "Please change the default admin password and secure your environment variables!"