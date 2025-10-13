# Fixing Aditya Hospital Deployment Issues

## Problem Analysis

The error logs show:
```
Error: ENOENT: no such file or directory, stat '/root/adityahospital/server/dist/public/index.html'
```

This indicates that the Node.js server is trying to serve static files from the `dist/public` directory, but this directory either doesn't exist or doesn't contain the built React frontend files.

## Root Causes

1. **Missing Build Process**: The frontend React application hasn't been built, so the `dist/public` directory is missing or empty
2. **Incorrect Deployment Sequence**: Dependencies might not be installed correctly before building
3. **Path Configuration Issues**: The server expects built files in a specific location

## Solution Steps

### 1. Run the Fixed Deployment Script

Use the provided `fix-deployment.sh` script which:
- Cleans previous builds
- Installs all dependencies correctly
- Builds the frontend properly
- Verifies the build output
- Initializes the database

```bash
chmod +x fix-deployment.sh
./fix-deployment.sh
```

### 2. Update PM2 Configuration

Replace the existing `ecosystem.config.js` with the fixed version:
```bash
cp ecosystem.config.fixed.js ecosystem.config.js
```

### 3. Start the Application

After running the deployment script:
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save

# Check status
pm2 status

# View logs
pm2 logs adityahospital
```

## Verification Steps

1. Check that `dist/public` directory exists and contains built files:
   ```bash
   ls -la dist/public/
   ```

2. Verify that `index.html` exists in the build directory:
   ```bash
   ls -la dist/public/index.html
   ```

3. Check PM2 process status:
   ```bash
   pm2 status
   ```

4. View application logs:
   ```bash
   pm2 logs adityahospital --lines 50
   ```

## Common Issues and Solutions

### Issue: Build Fails
- Ensure all dependencies are installed with `--force` flag
- Check Node.js version compatibility
- Verify sufficient disk space

### Issue: Database Connection
- Ensure MongoDB is running
- Verify database connection string in `.env` file
- Check firewall settings for database access

### Issue: Port Conflicts
- Check if port 4173 is already in use
- Modify PORT in `.env` and `ecosystem.config.js` if needed

## Prevention for Future Deployments

1. Always run the complete deployment script before starting the application
2. Verify build output before starting PM2 processes
3. Monitor logs after deployment to catch issues early
4. Keep backup of working configuration files