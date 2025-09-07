# Aditya Hospital Admin Panel - Deployment Guide

## 🏥 Production Deployment for adityahospitalnagaon.com

This guide will help you deploy the Aditya Hospital Admin Panel to production on your domain.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PM2 process manager
- Nginx web server
- SSL certificate for HTTPS
- Domain: adityahospitalnagaon.com

## 🚀 Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

1. **Clone and setup the repository:**
   ```bash
   git clone <your-repo-url>
   cd aditya-hospital-admin
   ```

2. **Make the deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

### Option 2: Manual Deployment

1. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start with PM2:**
   ```bash
   npm run pm2:start
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start containers:**
   ```bash
   docker-compose up -d
   ```

2. **Check status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t aditya-hospital-admin .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name aditya-hospital-admin \
     -p 3001:3001 \
     -v $(pwd)/data:/app/data \
     -v $(pwd)/logs:/app/logs \
     -e NODE_ENV=production \
     aditya-hospital-admin
   ```

## 🌐 Nginx Configuration

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Copy the nginx configuration:**
   ```bash
   sudo cp nginx.conf /etc/nginx/nginx.conf
   ```

3. **Create SSL directory:**
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   ```

4. **Add your SSL certificates:**
   ```bash
   sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
   sudo cp your-private.key /etc/nginx/ssl/private.key
   ```

5. **Test and reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 🔧 Environment Configuration

Create a `.env` file with the following variables:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DOMAIN=adityahospitalnagaon.com
JWT_SECRET=your-super-secure-jwt-secret-key
DATA_DIRECTORY=./data
```

## 📊 Monitoring and Maintenance

### Health Checks

- **Application health:** `https://adityahospitalnagaon.com/health`
- **PM2 status:** `pm2 status`
- **PM2 logs:** `pm2 logs aditya-hospital-admin`

### Database Backup

1. **Manual backup:**
   ```bash
   npm run backup
   ```

2. **Automated backup (crontab):**
   ```bash
   # Add to crontab for daily backups at 2 AM
   0 2 * * * cd /path/to/app && npm run backup
   ```

### Log Management

- **Application logs:** `./logs/`
- **Nginx logs:** `/var/log/nginx/`
- **PM2 logs:** `pm2 logs`

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Change default admin password
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (ports 80, 443, 22)
- [ ] Set up regular database backups
- [ ] Monitor application logs
- [ ] Keep dependencies updated

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   chmod +x deploy.sh
   ```

3. **Database connection issues:**
   ```bash
   # Check if database file exists
   ls -la ./data/database.sqlite
   
   # Run migrations
   npm run migrate
   ```

4. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Log Locations

- **Application:** `./logs/error.log`
- **PM2:** `~/.pm2/logs/`
- **Nginx:** `/var/log/nginx/error.log`

## 📞 Support

For deployment support:
- **Email:** support@adityahospitalnagaon.com
- **Documentation:** [Project README](./README.md)

## 🎯 Post-Deployment

After successful deployment:

1. **Test the application:**
   - Visit: `https://adityahospitalnagaon.com`
   - Admin panel: `https://adityahospitalnagaon.com/admin`
   - Login: `admin` / `password`

2. **Change default credentials:**
   - Update admin password
   - Update JWT secret

3. **Configure monitoring:**
   - Set up log rotation
   - Configure backup schedule
   - Set up health check monitoring

4. **Performance optimization:**
   - Enable gzip compression
   - Configure caching headers
   - Monitor resource usage

---

**🎉 Congratulations! Your Aditya Hospital Admin Panel is now live at adityahospitalnagaon.com**

