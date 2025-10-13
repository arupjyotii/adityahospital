# Troubleshooting Build Environment Issues

## Problem
The build is failing with permission errors:
```
failed to load config from /root/adityahospital/vite.config.js
error during build:
Error: The service was stopped: spawn /root/adityahospital/node_modules/@esbuild/linux-x64/bin/esbuild EACCES
```

## Root Cause
This error occurs due to permission issues with the esbuild binary, which is a core dependency for Vite's build process. The `EACCES` error indicates that the system doesn't have permission to execute the esbuild binary.

## Solution

### 1. Fix Permissions for esbuild
```bash
# Fix permissions for the esbuild binary
chmod +x node_modules/@esbuild/linux-x64/bin/esbuild

# Fix permissions for all esbuild-related files
find node_modules -path "*/esbuild/*" -name "esbuild" -type f -exec chmod +x {} \;
```

### 2. Clean and Reinstall Dependencies
```bash
# Remove node_modules directories
rm -rf node_modules
rm -rf client/node_modules

# Reinstall dependencies
npm install --force
cd client
npm install --force
cd ..
```

### 3. Fix Permissions for All Binaries
```bash
# Fix permissions for all binaries
chmod +x node_modules/.bin/*
chmod +x client/node_modules/.bin/*
```

### 4. Increase Memory for Build Process
If the build still fails, it might be due to memory issues:
```bash
# Build with increased memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Prevention

1. Always ensure proper permissions when deploying to Linux servers
2. Use consistent user accounts for deployment and running the application
3. Regularly clean and reinstall dependencies to avoid corruption
4. Monitor system resources during build processes

## Additional Notes

The esbuild permission issue is common when:
1. Files are copied between different systems with different permission schemes
2. The application is deployed using different user accounts
3. File system permissions are not preserved during deployment

By ensuring proper permissions and clean installations, these issues can be resolved.