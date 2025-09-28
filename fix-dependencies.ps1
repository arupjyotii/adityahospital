# Fix Dependencies Script for Windows PowerShell
# This script cleans and reinstalls all dependencies to fix missing modules

Write-Host "🔧 Fixing Dependencies for Aditya Hospital" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

Write-Status "Cleaning existing dependencies..."

# Remove node_modules and package-lock.json
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Success "Removed node_modules directory"
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Success "Removed package-lock.json"
}

# Clear npm cache
Write-Status "Clearing npm cache..."
npm cache clean --force

if ($LASTEXITCODE -eq 0) {
    Write-Success "Cache cleared successfully"
} else {
    Write-Error "Failed to clear cache"
    exit 1
}

# Install dependencies
Write-Status "Installing fresh dependencies..."
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed successfully"
} else {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Verify critical dependencies
Write-Status "Verifying critical dependencies..."

# Check for path-to-regexp
$pathToRegexp = npm list path-to-regexp 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "path-to-regexp is installed"
} else {
    Write-Warning "path-to-regexp not found, installing explicitly..."
    npm install path-to-regexp@^6.3.0
}

# Check for express
$express = npm list express 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "express is installed"
} else {
    Write-Error "express is missing"
    exit 1
}

# Check for mongoose
$mongoose = npm list mongoose 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "mongoose is installed"
} else {
    Write-Error "mongoose is missing"
    exit 1
}

Write-Success "All dependencies verified!"

# Test the server startup
Write-Status "Testing server dependencies..."

# Create a test script to check if the server can start
$testScript = @'
// Quick test to see if server dependencies are working
try {
    const express = require('express');
    const mongoose = require('mongoose');
    console.log('✅ Express and Mongoose loaded successfully');
    console.log('✅ Dependencies are working correctly');
    process.exit(0);
} catch (error) {
    console.error('❌ Error loading dependencies:', error.message);
    process.exit(1);
}
'@

$testScript | Out-File -FilePath "test-server.js" -Encoding UTF8

node test-server.js

if ($LASTEXITCODE -eq 0) {
    Write-Success "Server dependencies test passed"
    Remove-Item "test-server.js"
} else {
    Write-Error "Server dependencies test failed"
    Remove-Item "test-server.js"
    exit 1
}

Write-Success "🎉 Dependencies fixed successfully!"
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Try running the server: npm start"
Write-Host "2. For development: npm run dev"
Write-Host "3. Check logs if issues persist"