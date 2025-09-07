#  Aditya Hospital Admin Panel - Production Checklist

##  Pre-Deployment Checklist

###  Server Setup
- [ ] Server with Node.js 18+ installed
- [ ] Domain `adityahospitalnagaon.com` configured
- [ ] SSL certificate installed and configured
- [ ] Nginx web server installed
- [ ] PM2 process manager installed
- [ ] Firewall configured (ports 80, 443, 22)

###  Application Setup
- [ ] Repository cloned to server
- [ ] Environment variables configured (`.env`)
- [ ] Database migrations run (`npm run migrate`)
- [ ] Application built (`npm run build:prod`)
- [ ] PM2 configuration set up
- [ ] Nginx configuration deployed

###  Security Configuration
- [ ] JWT secret changed from default
- [ ] Admin password changed from default
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] File upload limits set

###  Monitoring & Backup
- [ ] Log rotation configured
- [ ] Database backup script tested
- [ ] Health check endpoint working
- [ ] PM2 monitoring enabled
- [ ] Error logging configured

##  Deployment Commands

### Quick Deployment
```bash
# 1. Clone repository
git clone <your-repo-url>
cd aditya-hospital-admin

# 2. Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment
```bash
# 1. Install dependencies
npm ci --only=production

# 2. Build application
npm run build:prod

# 3. Start with PM2
npm run pm2:start

# 4. Save PM2 configuration
pm2 save
pm2 startup
```

### Docker Deployment
```bash
# 1. Build and start containers
docker-compose up -d

# 2. Check status
docker-compose ps
```

##  Domain Configuration

### DNS Settings
- [ ] A record: `adityahospitalnagaon.com` → Server IP
- [ ] A record: `www.adityahospitalnagaon.com` → Server IP
- [ ] CNAME record: `www` → `adityahospitalnagaon.com`

### SSL Certificate
- [ ] SSL certificate installed
- [ ] Certificate chain configured
- [ ] HTTPS redirect enabled
- [ ] HSTS headers configured

##  Post-Deployment Testing

### Application Tests
- [ ] Homepage loads: `https://adityahospitalnagaon.com`
- [ ] Admin panel accessible: `https://adityahospitalnagaon.com/admin`
- [ ] Login works: `admin` / `password`
- [ ] Dashboard displays correctly
- [ ] All CRUD operations work
- [ ] API endpoints respond correctly

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Static assets cached
- [ ] Gzip compression enabled

### Security Tests
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] CORS configured correctly
- [ ] No sensitive data exposed

##  Default Credentials

**IMPORTANT: Change these after deployment!**

- **Username:** `admin`
- **Password:** `password`
- **Admin Panel:** `https://adityahospitalnagaon.com/admin`

##  Maintenance Commands

### PM2 Management
```bash
# Check status
pm2 status

# View logs
pm2 logs aditya-hospital-admin

# Restart application
pm2 restart aditya-hospital-admin

# Stop application
pm2 stop aditya-hospital-admin
```

### Database Management
```bash
# Create backup
npm run backup

# Run migrations
npm run migrate

# Check database
ls -la ./data/database.sqlite
```

### Log Management
```bash
# View application logs
tail -f ./logs/error.log

# View PM2 logs
pm2 logs aditya-hospital-admin

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

##  Emergency Procedures

### Application Down
1. Check PM2 status: `pm2 status`
2. Restart application: `pm2 restart aditya-hospital-admin`
3. Check logs: `pm2 logs aditya-hospital-admin`
4. Check server resources: `htop` or `top`

### Database Issues
1. Check database file: `ls -la ./data/database.sqlite`
2. Run migrations: `npm run migrate`
3. Restore from backup if needed
4. Check disk space: `df -h`

### SSL Issues
1. Check certificate: `openssl x509 -in /path/to/cert.pem -text -noout`
2. Test SSL: `openssl s_client -connect adityahospitalnagaon.com:443`
3. Check Nginx config: `sudo nginx -t`
4. Reload Nginx: `sudo systemctl reload nginx`

##  Performance Monitoring

### Key Metrics to Monitor
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Disk space > 20% free
- [ ] Response times < 500ms
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

### Monitoring Tools
- [ ] PM2 monitoring: `pm2 monit`
- [ ] System monitoring: `htop`, `iotop`
- [ ] Log monitoring: `tail -f logs/error.log`
- [ ] Health checks: `curl https://adityahospitalnagaon.com/health`

##  Success Criteria

Your deployment is successful when:
- [ ] Application accessible at `https://adityahospitalnagaon.com`
- [ ] Admin panel working at `https://adityahospitalnagaon.com/admin`
- [ ] All features functional (CRUD operations)
- [ ] Performance metrics within acceptable ranges
- [ ] Security measures in place
- [ ] Backup system working
- [ ] Monitoring configured

---

**Congratulations! Your Aditya Hospital Admin Panel is production-ready!**

For support, contact: support@codemic.in

