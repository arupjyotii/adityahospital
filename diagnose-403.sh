#!/bin/bash

# Comprehensive 403 Error Diagnosis for Aditya Hospital
# This script identifies the root cause of 403 Forbidden errors

echo "🔍 Diagnosing 403 Forbidden Error for adityahospitalnagaon.com..."
echo "=============================================================="

# Set variables
WEB_ROOT="/home/admin/domains/adityahospitalnagaon.com/public_html"
NGINX_CONFIG="/etc/nginx/sites-available/adityahospitalnagaon.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/adityahospitalnagaon.com"

echo "📂 Web Root: $WEB_ROOT"
echo "⚙️  Nginx Config: $NGINX_CONFIG"
echo ""

# Check 1: Directory existence and permissions
echo "1️⃣  CHECKING DIRECTORY STRUCTURE"
echo "--------------------------------"
if [ -d "$WEB_ROOT" ]; then
    echo "✅ Web root exists: $WEB_ROOT"
    echo "📋 Directory permissions:"
    ls -la "$WEB_ROOT" | head -5
    
    # Check for frontend files
    echo ""
    echo "📁 Frontend file locations:"
    if [ -f "$WEB_ROOT/dist/public/index.html" ]; then
        echo "✅ Found: $WEB_ROOT/dist/public/index.html"
        ls -la "$WEB_ROOT/dist/public/index.html"
    elif [ -f "$WEB_ROOT/index.html" ]; then
        echo "✅ Found: $WEB_ROOT/index.html"
        ls -la "$WEB_ROOT/index.html"
    else
        echo "❌ No index.html found in either location!"
        echo "🔍 Searching for any HTML files:"
        find "$WEB_ROOT" -name "*.html" -type f 2>/dev/null | head -5
    fi
else
    echo "❌ Web root does not exist: $WEB_ROOT"
    echo "🔍 Available directories:"
    ls -la /home/admin/domains/adityahospitalnagaon.com/ 2>/dev/null || echo "Parent directory not accessible"
fi

echo ""

# Check 2: File permissions
echo "2️⃣  CHECKING FILE PERMISSIONS"
echo "-----------------------------"
if [ -d "$WEB_ROOT" ]; then
    echo "📊 Permission analysis:"
    
    # Check directory permissions
    DIR_PERMS=$(stat -c "%a" "$WEB_ROOT" 2>/dev/null)
    echo "🏠 Web root permissions: $DIR_PERMS (should be 755)"
    
    # Check ownership
    OWNER=$(stat -c "%U:%G" "$WEB_ROOT" 2>/dev/null)
    echo "👤 Web root owner: $OWNER (should be admin:admin)"
    
    # Check for files with wrong permissions
    echo "🔍 Files with incorrect permissions:"
    find "$WEB_ROOT" -type f ! -perm 644 2>/dev/null | head -5
    echo "🔍 Directories with incorrect permissions:"
    find "$WEB_ROOT" -type d ! -perm 755 2>/dev/null | head -5
fi

echo ""

# Check 3: Nginx configuration
echo "3️⃣  CHECKING NGINX CONFIGURATION"
echo "--------------------------------"
if [ -f "$NGINX_CONFIG" ]; then
    echo "✅ Nginx config exists: $NGINX_CONFIG"
    echo "📋 Document root configuration:"
    grep -n "root\|server_name" "$NGINX_CONFIG" 2>/dev/null || echo "Could not read config"
else
    echo "❌ Nginx config not found: $NGINX_CONFIG"
    echo "🔍 Available nginx configs:"
    ls -la /etc/nginx/sites-available/ 2>/dev/null | grep -E "(aditya|hospital)" || echo "No related configs found"
fi

if [ -L "$NGINX_ENABLED" ]; then
    echo "✅ Site is enabled: $NGINX_ENABLED"
else
    echo "❌ Site is not enabled: $NGINX_ENABLED"
fi

echo ""

# Check 4: Nginx service status
echo "4️⃣  CHECKING NGINX SERVICE"
echo "--------------------------"
NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null)
echo "🌐 Nginx status: $NGINX_STATUS"

if [ "$NGINX_STATUS" = "active" ]; then
    echo "✅ Nginx is running"
    echo "🔧 Testing configuration:"
    sudo nginx -t 2>&1 | head -3
else
    echo "❌ Nginx is not running"
fi

echo ""

# Check 5: PM2 and backend status
echo "5️⃣  CHECKING BACKEND STATUS"
echo "---------------------------"
if command -v pm2 &> /dev/null; then
    echo "📊 PM2 status:"
    pm2 status 2>/dev/null || echo "PM2 not managing any processes"
    
    echo ""
    echo "🔍 Node.js processes:"
    ps aux | grep -E "(node|pm2)" | grep -v grep | head -3
else
    echo "❌ PM2 not installed"
fi

echo ""

# Check 6: Log analysis
echo "6️⃣  CHECKING ERROR LOGS"
echo "-----------------------"
echo "🚨 Recent Nginx errors:"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null | grep -E "(403|404|denied)" || echo "No recent 403/404 errors in Nginx logs"

echo ""
echo "🚨 Recent access attempts:"
sudo tail -5 /var/log/nginx/access.log 2>/dev/null | grep "adityahospitalnagaon.com" || echo "No recent access logs found"

echo ""

# Solution recommendations
echo "7️⃣  RECOMMENDED SOLUTIONS"
echo "------------------------"
echo "Based on the diagnosis above:"
echo ""

if [ ! -f "$WEB_ROOT/dist/public/index.html" ] && [ ! -f "$WEB_ROOT/index.html" ]; then
    echo "🔴 CRITICAL: No frontend files found!"
    echo "   Solution: Run 'npm run build' to create frontend files"
    echo "   Or upload pre-built files to $WEB_ROOT/dist/public/"
fi

if [ -d "$WEB_ROOT" ]; then
    DIR_PERMS=$(stat -c "%a" "$WEB_ROOT" 2>/dev/null)
    if [ "$DIR_PERMS" != "755" ]; then
        echo "🟡 WARNING: Incorrect directory permissions"
        echo "   Solution: chmod 755 $WEB_ROOT"
    fi
    
    OWNER=$(stat -c "%U:%G" "$WEB_ROOT" 2>/dev/null)
    if [ "$OWNER" != "admin:admin" ]; then
        echo "🟡 WARNING: Incorrect ownership"
        echo "   Solution: chown -R admin:admin $WEB_ROOT"
    fi
fi

if [ "$NGINX_STATUS" != "active" ]; then
    echo "🔴 CRITICAL: Nginx is not running"
    echo "   Solution: sudo systemctl start nginx"
fi

echo ""
echo "🔧 Quick fix command:"
echo "   ./fix-403-permissions.sh"
echo ""
echo "🧪 Test URLs after fixing:"
echo "   https://adityahospitalnagaon.com"
echo "   https://adityahospitalnagaon.com/api/health"