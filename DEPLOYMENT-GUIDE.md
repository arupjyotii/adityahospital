# Production Deployment Package for Aditya Hospital

## Quick Deployment Guide

### Prerequisites
- VPS with Ubuntu 20.04/22.04 or CentOS 7/8
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB installation
- Domain pointing to your VPS IP
- SSL certificate (Let's Encrypt recommended)

### 1. Upload Files to VPS
```bash
# Upload the entire project to your VPS
scp -r /path/to/adityahospital root@your-server-ip:/var/www/
```

### 2. Server Setup
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install project dependencies
cd /var/www/adityahospital
npm install
```

### 3. Environment Configuration
```bash
# Copy production environment file
cp .env.production .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=4173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secure-jwt-secret
PRODUCTION_DOMAIN=adityahospitalnagaon.com
FRONTEND_URL=https://adityahospitalnagaon.com
```

### 4. Build Frontend
```bash
npm run build
```

### 5. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Nginx Configuration
Create `/etc/nginx/sites-available/adityahospital`:
```nginx
server {
    listen 80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;

    ssl_certificate /etc/letsencrypt/live/adityahospitalnagaon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adityahospitalnagaon.com/privkey.pem;

    root /var/www/adityahospital/dist/public;
    index index.html;

    # API routes
    location /api/ {
        proxy_pass http://adityahospitalnagaon.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d adityahospitalnagaon.com -d www.adityahospitalnagaon.com
```

### 8. Enable and Start Services
```bash
sudo ln -s /etc/nginx/sites-available/adityahospital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## PM2 Commands
```bash
# View logs
pm2 logs

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# Monitor
pm2 monit

# View status
pm2 status
```

## Database Initialization
```bash
# Initialize with sample data
node server/init-db.js
```

## Backup & Maintenance
```bash
# Database backup (MongoDB Atlas)
mongodump --uri="your_mongodb_uri" --out backup-$(date +%Y%m%d)

# Application logs
pm2 logs --lines 100

# System monitoring
htop
df -h
```

## Troubleshooting

### Port Issues
```bash
# Check if port is in use
sudo netstat -tlnp | grep :4173
sudo lsof -i :4173
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/adityahospital
sudo chmod -R 755 /var/www/adityahospital
```

### MongoDB Connection
- Ensure your VPS IP is whitelisted in MongoDB Atlas
- Check connection string format
- Verify network connectivity

### SSL Issues
```bash
# Renew SSL certificate
sudo certbot renew
```

## Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable firewall (UFW)
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Setup fail2ban
- [ ] Regular backups

## Performance Optimization
- [ ] Enable Nginx gzip compression  
- [ ] Setup CDN for static assets
- [ ] Database indexing
- [ ] MongoDB connection pooling
- [ ] PM2 cluster mode
- [ ] Log rotation

## Monitoring
- Setup uptime monitoring
- Configure error alerting  
- Monitor server resources
- Database performance monitoring
- SSL certificate expiry alerts

For detailed help, refer to SETUP-INSTRUCTIONS.md or contact the development team.