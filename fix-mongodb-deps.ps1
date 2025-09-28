# Fix MongoDB Dependencies Script
# This script cleans and reinstalls dependencies for MongoDB setup

Write-Host "Fixing MongoDB dependencies..."

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the project root directory."
    exit 1
}

# Clean npm cache
Write-Host "Cleaning npm cache..."
npm cache clean --force

# Remove node_modules and package-lock.json
Write-Host "Removing node_modules and package-lock.json..."
if (Test-Path "node_modules") { Remove-Item -Recurse -Force node_modules }
if (Test-Path "package-lock.json") { Remove-Item package-lock.json }

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Check if installation was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies."
    exit 1
}

# Verify key dependencies
Write-Host "Verifying key dependencies..."
$dependencies = @("express", "mongoose", "path-to-regexp", "bcryptjs", "jsonwebtoken")

foreach ($dep in $dependencies) {
    try {
        npm list $dep | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK $dep"
        } else {
            Write-Host "NOT FOUND $dep"
        }
    } catch {
        Write-Host "ERROR $dep - $($_.Exception.Message)"
    }
}

Write-Host "MongoDB dependencies fixed successfully!"
Write-Host ""
Write-Host "To start the application, run:"
Write-Host "  npm start"
Write-Host ""
Write-Host "To start the application in development mode, run:"
Write-Host "  npm run dev"