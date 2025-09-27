#!/bin/bash

# Alternative: Configure Apache for Aditya Hospital
# Use this if Nginx installation fails

echo "🌐 Configuring Apache as alternative to Nginx..."
echo "==============================================="

# Variables
DOMAIN="adityahospitalnagaon.com"
WEB_ROOT="/home/admin/domains/adityahospitalnagaon.com/public_html"
APACHE_CONFIG="/etc/httpd/conf.d/$DOMAIN.conf"

# Check if Apache is available
if command -v httpd &> /dev/null; then
    APACHE_SERVICE="httpd"
    APACHE_CONFIG_DIR="/etc/httpd/conf.d"
    echo "✅ Found Apache (httpd)"
elif command -v apache2 &> /dev/null; then
    APACHE_SERVICE="apache2"
    APACHE_CONFIG_DIR="/etc/apache2/sites-available"
    APACHE_CONFIG="$APACHE_CONFIG_DIR/$DOMAIN.conf"
    echo "✅ Found Apache2"
else
    echo "❌ Neither Nginx nor Apache found!"
    echo "📋 You need to install a web server manually:"
    echo "   sudo yum install httpd  # For CentOS/RHEL"
    echo "   sudo apt install apache2  # For Ubuntu/Debian"
    exit 1
fi

echo "🔧 Using Apache service: $APACHE_SERVICE"
echo "📁 Config directory: $APACHE_CONFIG_DIR"

# Start Apache service
echo "🚀 Starting Apache..."
sudo systemctl start $APACHE_SERVICE
sudo systemctl enable $APACHE_SERVICE

# Check if Apache is running
if systemctl is-active --quiet $APACHE_SERVICE; then
    echo "✅ Apache is now running"
else
    echo "❌ Failed to start Apache"
    sudo systemctl status $APACHE_SERVICE
    exit 1
fi

# Create Apache configuration
echo "⚙️ Creating Apache configuration..."
sudo tee "$APACHE_CONFIG" > /dev/null <<EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $WEB_ROOT/dist/public
    
    # Redirect to HTTPS (uncomment after SSL setup)
    # Redirect permanent / https://$DOMAIN/
    
    # API Proxy to backend
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    # Frontend fallback for React routing
    <Directory "$WEB_ROOT/dist/public">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    
    # Logging
    ErrorLog /var/log/$APACHE_SERVICE/$DOMAIN.error.log
    CustomLog /var/log/$APACHE_SERVICE/$DOMAIN.access.log combined
</VirtualHost>

# HTTPS VirtualHost (for future SSL setup)
<VirtualHost *:443>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $WEB_ROOT/dist/public
    
    # SSL Configuration (update paths after SSL setup)
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
    
    # API Proxy to backend
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    # Frontend fallback for React routing
    <Directory "$WEB_ROOT/dist/public">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    
    # Logging
    ErrorLog /var/log/$APACHE_SERVICE/$DOMAIN.ssl.error.log
    CustomLog /var/log/$APACHE_SERVICE/$DOMAIN.ssl.access.log combined
</VirtualHost>
EOF

echo "✅ Apache configuration created: $APACHE_CONFIG"

# Enable required modules
echo "🔧 Enabling Apache modules..."
if [ "$APACHE_SERVICE" = "apache2" ]; then
    # Ubuntu/Debian
    sudo a2enmod rewrite
    sudo a2enmod proxy
    sudo a2enmod proxy_http
    sudo a2enmod headers
    sudo a2enmod ssl
    sudo a2ensite "$DOMAIN"
else
    # CentOS/RHEL - modules are usually compiled in
    echo "ℹ️ Apache modules (rewrite, proxy, headers, ssl) should be available"
fi

# Test Apache configuration
echo "🧪 Testing Apache configuration..."
if sudo $APACHE_SERVICE -t; then
    echo "✅ Apache configuration is valid"
else
    echo "❌ Apache configuration has errors"
    exit 1
fi

# Reload Apache
echo "🔄 Reloading Apache..."
sudo systemctl reload $APACHE_SERVICE

# Configure firewall
echo "🔥 Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewall configured (firewalld)"
elif command -v ufw &> /dev/null; then
    sudo ufw allow 'Apache Full'
    echo "✅ Firewall configured (ufw)"
fi

# Final status
echo ""
echo "✅ Apache setup complete!"
echo "========================"
echo "🌍 Apache status: $(systemctl is-active $APACHE_SERVICE)"
echo "📊 PM2 status:"
pm2 status | grep aditya-hospital

echo ""
echo "🧪 Test your website:"
echo "   🌍 Website: http://$DOMAIN"
echo "   🩺 API Health: http://$DOMAIN/api/health"
echo "   🔧 Admin Panel: http://$DOMAIN/admin"
echo ""
echo "📝 Useful commands:"
echo "   sudo systemctl status $APACHE_SERVICE    - Check Apache status"
echo "   sudo systemctl reload $APACHE_SERVICE    - Reload configuration"
echo "   sudo $APACHE_SERVICE -t                  - Test configuration"
echo "   sudo tail -f /var/log/$APACHE_SERVICE/$DOMAIN.error.log - View error logs"
echo ""
echo "🔐 To setup SSL later:"
echo "   sudo certbot --apache -d $DOMAIN -d www.$DOMAIN"