# Troubleshooting 500 Internal Server Error

## Problem
The website https://adityahospitalnagaon.com/ is showing a 500 Internal Server Error.

## Root Causes
A 500 Internal Server Error can be caused by several issues:
1. Server-side code errors
2. Incorrect file paths for static assets
3. Environment configuration issues
4. Missing dependencies
5. Permission problems

## Diagnosis Steps

### 1. Check PM2 Logs
```bash
# Check the application logs
pm2 logs adityahospital

# Check only the error logs
pm2 logs adityahospital --err

# Check recent logs with more lines
pm2 logs adityahospital --lines 100
```

### 2. Verify Static File Paths
The most likely issue is incorrect static file paths. Run the diagnostic script:
```bash
node diagnose-static-files.js
```

### 3. Check PM2 Configuration
Verify the PM2 configuration is correct:
```bash
node diagnose-pm2.js
```

### 4. Test API Endpoints
Check if the API is working:
```bash
# Test the health endpoint
curl -v https://adityahospitalnagaon.com/api/health

# Test other API endpoints
curl -v https://adityahospitalnagaon.com/api/departments
```

## Solutions

### 1. Fix Static File Paths
If the diagnostic shows path issues, update the paths in [server/index.js](file:///f:/Codemic%20Projects/adityahospital/server/index.js):

```javascript
// Correct path from server directory to dist/public
app.use(express.static(path.join(__dirname, '../dist/public')));

// For the index.html file
const indexPath = path.join(__dirname, '../dist/public/index.html');
```

### 2. Verify Build Files Exist
Make sure the frontend has been built:
```bash
# Check if dist/public exists
ls -la dist/public/

# If not, build the frontend
cd client
npm run build
cd ..
```

### 3. Check Environment Variables
Ensure environment variables are set correctly:
```bash
# Check current environment
echo $NODE_ENV
echo $PORT

# Check .env file
cat .env
```

### 4. Restart the Application
After making changes:
```bash
# Restart the PM2 process
pm2 restart adityahospital

# Save the PM2 configuration
pm2 save

# Check the status
pm2 status
```

## Prevention

1. Always verify static file paths match the actual build output location
2. Test API endpoints independently of the frontend
3. Monitor PM2 logs regularly
4. Keep environment configurations consistent between development and production

## Additional Debugging

### Enable Detailed Logging
Add more detailed logging to [server/index.js](file:///f:/Codemic%20Projects/adityahospital/server/index.js):

```javascript
// Add this before the static file serving
console.log('Static files directory:', path.join(__dirname, '../dist/public'));
console.log('Index file path:', path.join(__dirname, '../dist/public/index.html'));

// Check if directory exists
fs.access(path.join(__dirname, '../dist/public'), fs.constants.F_OK, (err) => {
  if (err) {
    console.error('Static files directory not accessible:', err);
  } else {
    console.log('Static files directory is accessible');
  }
});
```

### Test Server Locally
Test the server locally to isolate issues:
```bash
# Set production environment
export NODE_ENV=production

# Start the server
node server/index.js
```

This will help identify if the issue is specific to the production environment or a general server problem.