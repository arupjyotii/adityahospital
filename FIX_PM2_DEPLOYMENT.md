# Fix PM2 Deployment Issue

## Problem
The PM2 process is trying to run from the `/root` directory instead of the correct project directory `/domains/adityahospitalnagaon.com/public_html`, causing it to fail because it can't find the package.json file.

## Solution

### Step 1: Stop and Delete Current PM2 Process
```bash
pm2 stop aditya-hospital
pm2 delete aditya-hospital
```

### Step 2: Navigate to Correct Directory
```bash
cd /domains/adityahospitalnagaon.com/public_html
```

### Step 3: Start Application with Correct Configuration
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### Step 4: Verify Application is Running
```bash
pm2 list
pm2 logs aditya-hospital
```

## Alternative Solution: Manual Start

If the above doesn't work, you can manually start the application:

### Step 1: Navigate to Project Directory
```bash
cd /domains/adityahospitalnagaon.com/public_html
```

### Step 2: Start Application Directly
```bash
NODE_ENV=production node server/index.js
```

## Environment Configuration

Make sure your `.env` file in `/domains/adityahospitalnagaon.com/public_html` contains the correct configuration:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
DOMAIN=adityahospitalnagaon.com
FRONTEND_URL=https://adityahospitalnagaon.com
VITE_API_URL=/api
CORS_ORIGINS=https://adityahospitalnagaon.com,https://www.adityahospitalnagaon.com
```

## Troubleshooting

### Check if Dependencies are Installed
```bash
cd /domains/adityahospitalnagaon.com/public_html
npm list path-to-regexp
```

### Reinstall Dependencies if Needed
```bash
cd /domains/adityahospitalnagaon.com/public_html
npm install
```

### Check PM2 Logs
```bash
pm2 logs aditya-hospital
```

### Check Application Health
Visit: http://your-server-ip:3001/api/health

## Prevention

To prevent this issue in the future, always ensure:
1. PM2 is started from the correct project directory
2. The ecosystem.config.cjs file has the correct `cwd` property
3. All file paths in the configuration are absolute paths pointing to the correct deployment directory

## Support
If you continue to experience issues, please check the PM2 logs and ensure all environment variables are correctly configured.