# Aditya Hospital - VPS Deployment Script (PowerShell)
# This script deploys the application to the VPS environment

Write-Host "🚀 Starting Aditya Hospital deployment..."

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
}

# Install dependencies with force to resolve any version conflicts
Write-Host "📦 Installing dependencies..."
npm cache clean --force
if (Test-Path "node_modules") { Remove-Item -Recurse -Force node_modules }
if (Test-Path "package-lock.json") { Remove-Item package-lock.json }
npm install --force

# Check if installation was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to install dependencies."
    exit 1
}

# Build the frontend
Write-Host "🏗️  Building frontend..."
npm run build

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to build frontend."
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..."
    @"
# Environment Configuration
NODE_ENV=production
PORT=3001
HOST=localhost

# Database Configuration
DB_NAME=aditya_hospital
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=https://adityahospitalnagaon.com,https://www.adityahospitalnagaon.com

# Frontend URL
FRONTEND_URL=https://adityahospitalnagaon.com
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Create .env file for client if it doesn't exist
if (-not (Test-Path "client\.env")) {
    Write-Host "📝 Creating client .env file..."
    @"
VITE_API_URL=https://adityahospitalnagaon.com/api
"@ | Out-File -FilePath "client\.env" -Encoding UTF8
}

Write-Host "✅ Deployment completed successfully!"
Write-Host ""
Write-Host "To start the application, run:"
Write-Host "  npm start"
Write-Host ""
Write-Host "To start the application with PM2 (recommended for production):"
Write-Host "  pm2 start ecosystem.config.js"