#!/bin/bash

# Fix 403 Forbidden Error for Aditya Hospital
# This script fixes file permissions and ownership issues

echo "🔧 Fixing 403 Forbidden Error for adityahospitalnagaon.com..."

# Get the current user and web directory
WEB_ROOT="/home/admin/domains/adityahospitalnagaon.com/public_html"
WEB_USER="admin"
WEB_GROUP="admin"

echo "📂 Web Root: $WEB_ROOT"
echo "👤 Web User: $WEB_USER"
echo "👥 Web Group: $WEB_GROUP"

# Check if we're in the right directory
if [ ! -d "$WEB_ROOT" ]; then
    echo "❌ Web root directory not found: $WEB_ROOT"
    echo "📍 Current directory: $(pwd)"
    echo "📋 Available directories in /home/admin/domains/adityahospitalnagaon.com/:"
    ls -la /home/admin/domains/adityahospitalnagaon.com/ 2>/dev/null || echo "Directory not accessible"
    exit 1
fi

cd "$WEB_ROOT"

echo "🔍 Current directory permissions:"
ls -la

# Step 1: Fix ownership
echo "👤 Setting correct ownership..."
sudo chown -R $WEB_USER:$WEB_GROUP "$WEB_ROOT"

# Step 2: Set directory permissions (755)
echo "📁 Setting directory permissions to 755..."
find "$WEB_ROOT" -type d -exec chmod 755 {} \;

# Step 3: Set file permissions (644)
echo "📄 Setting file permissions to 644..."
find "$WEB_ROOT" -type f -exec chmod 644 {} \;

# Step 4: Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x "$WEB_ROOT"/*.sh 2>/dev/null || true

# Step 5: Check if index.html exists in the right place
echo "🔍 Checking for frontend files..."
if [ -f "$WEB_ROOT/dist/public/index.html" ]; then
    echo "✅ Found frontend at: $WEB_ROOT/dist/public/index.html"
elif [ -f "$WEB_ROOT/index.html" ]; then
    echo "✅ Found index.html at root: $WEB_ROOT/index.html"
else
    echo "⚠️  No index.html found. Creating basic frontend..."
    mkdir -p "$WEB_ROOT/dist/public"
    cat > "$WEB_ROOT/dist/public/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aditya Hospital</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Aditya Hospital</h1>
        <div class="status success">
            <h2>✅ Backend is Running!</h2>
            <p>The server is working correctly.</p>
        </div>
        <div class="status info">
            <h3>🔗 Available Endpoints:</h3>
            <ul style="text-align: left;">
                <li><a href="/api/health">API Health Check</a></li>
                <li><a href="/api/departments">Departments API</a></li>
                <li><a href="/api/doctors">Doctors API</a></li>
                <li><a href="/api/services">Services API</a></li>
            </ul>
        </div>
        <p><em>Frontend build in progress...</em></p>
    </div>
</body>
</html>
EOF
    echo "✅ Created basic index.html"
fi

# Step 6: Test Nginx configuration
echo "🌐 Testing Nginx configuration..."
sudo nginx -t

# Step 7: Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Step 8: Show final permissions
echo "📋 Final permissions check:"
ls -la "$WEB_ROOT" | head -10

echo ""
echo "✅ 403 Forbidden fix completed!"
echo ""
echo "🧪 Test your website:"
echo "   🌍 Website: https://adityahospitalnagaon.com"
echo "   🩺 API Health: https://adityahospitalnagaon.com/api/health"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 If still getting 403, check:"
echo "   1. Nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "   2. PM2 logs: pm2 logs"
echo "   3. File ownership: ls -la $WEB_ROOT"