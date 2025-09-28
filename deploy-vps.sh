#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    
    root /domains/adityahospitalnagaon.com/public_html/dist/public;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias /domains/adityahospitalnagaon.com/public_html/uploads/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
    
    # Main location for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
}
EOF
    
    # Enable the site
    ln -sf \"/etc/nginx/sites-available/$DOMAIN\" \"/etc/nginx/sites-enabled/$DOMAIN\"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_success \"Nginx configured successfully\"
else
    print_success \"Nginx configuration already exists\"
fi

# Step 12: Setup SSL with Certbot (optional)
print_status \"SSL Certificate Setup...\"
if command -v certbot &> /dev/null; then
    print_status \"Certbot found. You can run SSL setup manually:\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
else
    print_warning \"Certbot not found. Install it to enable SSL:\"
    echo \"sudo apt install certbot python3-certbot-nginx\"
    echo \"sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
fi

# Step 13: Final status check
print_status \"Checking application status...\"
sleep 5

if pm2 list | grep -q \"$APP_NAME.*online\"; then
    print_success \"Application is running successfully!\"
else
    print_error \"Application may not be running properly. Check PM2 logs:\"
    echo \"pm2 logs $APP_NAME\"
fi

print_success \"🎉 Deployment completed successfully!\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Update DNS records to point to this server\"
echo \"2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN\"
echo \"3. Check application: http://$(curl -s ifconfig.me):3001/api/health\"
echo \"4. Monitor with: pm2 monit\"
echo \"5. View logs: pm2 logs $APP_NAME\"
echo \"\"
echo \"🌐 Your application will be accessible at: http://$DOMAIN\"
echo \"🔧 Admin login: Check the application for default credentials\"
echo \"\"
print_warning \"Remember to:\"
echo \"- Change default passwords\"
echo \"- Configure proper firewall rules\"
echo \"- Set up regular backups\"
echo \"- Monitor application performance\"", "original_text": "#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo \"🏥 Aditya Hospital - VPS Deployment Script\"
echo \"==========================================\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e \"${BLUE}[INFO]${NC} $1\"
}

print_success() {
    echo -e \"${GREEN}[SUCCESS]${NC} $1\"
}

print_warning() {
    echo -e \"${YELLOW}[WARNING]${NC} $1\"
}

print_error() {
    echo -e \"${RED}[ERROR]${NC} $1\"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"", "replace_all": false}]
```

```
#!/bin/bash

# Aditya Hospital VPS Deployment Script
# This script deploys the application to a VPS at /domains/adityahospitalnagaon.com/public_html

set -e

echo "🏥 Aditya Hospital - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_PATH=\"/domains/adityahospitalnagaon.com/public_html\"
APP_NAME=\"aditya-hospital\"
DOMAIN=\"adityahospitalnagaon.com\"

# Check if we're running as root
if [[ $EUID -ne 0 ]]; then
   print_error \"This script must be run as root for VPS deployment\"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f \"package.json\" ]; then
    print_error \"package.json not found. Please run this script from the project root.\"
    exit 1
fi

print_status \"Starting VPS deployment to ${DEPLOY_PATH}...\"

# Step 1: Install Node.js if not present
print_status \"Checking Node.js installation...\"
if ! command -v node &> /dev/null; then
    print_status \"Installing Node.js...\"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    print_success \"Node.js installed successfully\"
else
    print_success \"Node.js is already installed: $(node --version)\"
fi

# Step 2: Install PM2 globally
print_status \"Checking PM2 installation...\"
if ! command -v pm2 &> /dev/null; then
    print_status \"Installing PM2...\"
    npm install -g pm2
    print_success \"PM2 installed successfully\"
else
    print_success \"PM2 is already installed: $(pm2 --version)\"
fi

# Step 3: Install MongoDB
print_status \"Checking MongoDB installation...\"
if ! command -v mongod &> /dev/null; then
    print_status \"Installing MongoDB...\"
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse\" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success \"MongoDB installed and started\"
else
    print_success \"MongoDB is already installed\"
    systemctl start mongod || print_warning \"MongoDB may already be running\"
fi

# Step 4: Create deployment directory
print_status \"Setting up deployment directory...\"
mkdir -p \"$DEPLOY_PATH\"
mkdir -p \"$DEPLOY_PATH/logs\"
mkdir -p \"$DEPLOY_PATH/uploads\"

# Step 5: Copy application files
print_status \"Copying application files...\"

# Copy source files
cp -r server/ \"$DEPLOY_PATH/\"
cp -r client/ \"$DEPLOY_PATH/\"
cp package.json \"$DEPLOY_PATH/\"
cp package-lock.json \"$DEPLOY_PATH/\"
cp ecosystem.config.cjs \"$DEPLOY_PATH/\"
cp vite.config.js \"$DEPLOY_PATH/\"
cp tailwind.config.js \"$DEPLOY_PATH/\"
cp postcss.config.js \"$DEPLOY_PATH/\"
cp tsconfig.json \"$DEPLOY_PATH/\"
cp components.json \"$DEPLOY_PATH/\"

# Copy environment template
cp .env.production.example \"$DEPLOY_PATH/.env\"

print_success \"Application files copied successfully\"

# Step 6: Install dependencies and build
cd \"$DEPLOY_PATH\"

print_status \"Installing production dependencies...\"
npm ci --production

print_status \"Building frontend application...\"
npm run build

print_success \"Application built successfully\"

# Step 7: Set up environment
print_status \"Configuring environment variables...\"
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN
VITE_API_URL=/api
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
UPLOAD_DIR=$DEPLOY_PATH/uploads
LOG_FILE=$DEPLOY_PATH/logs/app.log
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF

print_success \"Environment configured\"

# Step 8: Initialize database
print_status \"Initializing database...\"
if [ -f \"server/init-db.js\" ]; then
    node server/init-db.js
    print_success \"Database initialized\"
fi

# Step 9: Set proper permissions
print_status \"Setting file permissions...\"
chown -R www-data:www-data \"$DEPLOY_PATH\"
chmod -R 755 \"$DEPLOY_PATH\"
chmod -R 777 \"$DEPLOY_PATH/logs\"
chmod -R 777 \"$DEPLOY_PATH/uploads\"

# Step 10: Start application with PM2
print_status \"Starting application with PM2...\"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | grep -E '^sudo' | sh || true

print_success \"Application started with PM2\"

# Step 11: Configure Nginx (if not already configured)
print_status \"Checking Nginx configuration...\"
if [ ! -f \"/etc/nginx/sites-available/$DOMAIN\" ]; then
    print_status \"Creating Nginx configuration...\"
    cat > \"/etc/nginx/sites-available/$DOMAIN\" <<