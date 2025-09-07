# Aditya Hospital Admin Panel - Deployment Guide

## 🚀 Production Deployment Checklist

### ✅ Pre-Deployment Checklist

1. **Environment Setup**
   - [x] Node.js 18+ installed
   - [x] npm/package-lock.json present
   - [x] Environment variables configured
   - [x] Database migrations ready

2. **Code Quality**
   - [x] All TypeScript compilation errors fixed
   - [x] Build process working correctly
   - [x] No linting errors
   - [x] API endpoints tested

3. **Security**
   - [x] JWT secret configured
   - [x] CORS properly configured
   - [x] Security headers implemented
   - [x] Input validation in place

### 🛠️ Deployment Methods

#### Method 1: Direct Server Deployment

```bash
# 1. Clone/upload your code to server
git clone <your-repo> /var/www/aditya-hospital-admin
cd /var/www/aditya-hospital-admin

# 2. Install dependencies and build
npm ci
npm run build

# 3. Install production dependencies only
npm ci --only=production

# 4. Run database migrations
npx tsx scripts/migrate.js

# 5. Start with PM2
npm run pm2:start

# 6. Save PM2 configuration
pm2 save
pm2 startup
```

#### Method 2: Using Deployment Script

```bash
# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

#### Method 3: Docker Deployment

```bash
# Build Docker image
docker build -t aditya-hospital-admin .

# Run container
docker run -d \
  --name aditya-hospital-admin \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -e NODE_ENV=production \
  aditya-hospital-admin
```

### 🔧 Configuration Files

#### Environment Variables (env.production)
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATA_DIRECTORY=./data
JWT_SECRET=your-super-secure-jwt-secret
DOMAIN=adityahospitalnagaon.com
```

#### PM2 Configuration (ecosystem.config.js)
- Cluster mode enabled
- Auto-restart on failure
- Logging configured
- Memory limits set

#### Nginx Configuration (nginx.conf)
- SSL termination
- Static file serving
- Proxy to Node.js app
- Security headers

### 📊 Monitoring & Maintenance

#### Health Checks
```bash
# Check application health
curl https://adityahospitalnagaon.com/health

# Check PM2 status
pm2 status

# View logs
pm2 logs aditya-hospital-admin
```

#### Backup Strategy
```bash
# Run backup script
npm run backup

# Manual database backup
cp data/database.sqlite backups/database-$(date +%Y%m%d).sqlite
```

#### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build
npm run pm2:restart
```

### 🔐 Security Considerations

1. **Change Default Password**
   - Default: admin/password
   - Change immediately after deployment

2. **SSL Certificate**
   - Ensure HTTPS is properly configured
   - Use Let's Encrypt for free SSL

3. **Firewall**
   - Only allow ports 80, 443, and 22
   - Block direct access to port 3001

4. **Database Security**
   - Regular backups
   - Secure file permissions

### 🚨 Troubleshooting

#### Common Issues

1. **Server won't start**
   ```bash
   # Check logs
   pm2 logs aditya-hospital-admin
   
   # Check port availability
   netstat -tulpn | grep :3001
   ```

2. **Database errors**
   ```bash
   # Run migrations
   npx tsx scripts/migrate.js
   
   # Check database file
   ls -la data/database.sqlite
   ```

3. **Build failures**
   ```bash
   # Clean and rebuild
   rm -rf dist node_modules
   npm ci
   npm run build
   ```

### 📱 Access Information

- **Public Website**: https://adityahospitalnagaon.com
- **Admin Panel**: https://adityahospitalnagaon.com/admin
- **API Health**: https://adityahospitalnagaon.com/health
- **Default Login**: admin / password

### 🎯 Post-Deployment Tasks

1. [ ] Test all public pages
2. [ ] Test admin login
3. [ ] Create sample data
4. [ ] Configure SSL certificate
5. [ ] Set up monitoring
6. [ ] Configure backups
7. [ ] Update DNS records
8. [ ] Test mobile responsiveness

### 📞 Support

For technical support, contact:
- **Developer**: Codemic
- **Email**: support@codemic.com
- **LinkedIn**: https://www.linkedin.com/company/codemic/

---

**🎉 Congratulations! Your Aditya Hospital Admin Panel is now ready for production!**
