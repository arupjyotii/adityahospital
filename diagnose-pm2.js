#!/usr/bin/env node

// Diagnostic script to check PM2 configuration and environment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏥 Aditya Hospital - PM2 Environment Diagnostic');
console.log('==============================================');

// Check if ecosystem.config.js exists
const ecosystemPath = path.join(__dirname, 'ecosystem.config.js');
console.log(`\n📁 Checking ecosystem config: ${ecosystemPath}`);

if (fs.existsSync(ecosystemPath)) {
    console.log('✅ Ecosystem config exists');
    
    try {
        // Import the ecosystem config
        const ecosystemConfig = await import(`file://${ecosystemPath}`);
        console.log('✅ Ecosystem config loaded successfully');
        
        // Check the configuration
        if (ecosystemConfig.default && ecosystemConfig.default.apps) {
            const appConfig = ecosystemConfig.default.apps[0];
            console.log('\n📋 PM2 App Configuration:');
            console.log(`  Name: ${appConfig.name || 'Not specified'}`);
            console.log(`  Script: ${appConfig.script || 'Not specified'}`);
            console.log(`  CWD: ${appConfig.cwd || 'Not specified'}`);
            console.log(`  Environment: ${appConfig.env ? appConfig.env.NODE_ENV : 'Not specified'}`);
            console.log(`  Production Environment: ${appConfig.env_production ? appConfig.env_production.NODE_ENV : 'Not specified'}`);
            
            // Check if the working directory exists
            if (appConfig.cwd) {
                console.log(`\n📁 Checking CWD: ${appConfig.cwd}`);
                if (fs.existsSync(appConfig.cwd)) {
                    console.log('✅ CWD exists');
                    
                    // Check if dist/public exists in CWD
                    const distPath = path.join(appConfig.cwd, 'dist/public');
                    console.log(`📁 Checking dist/public in CWD: ${distPath}`);
                    if (fs.existsSync(distPath)) {
                        console.log('✅ dist/public exists in CWD');
                        
                        const indexPath = path.join(distPath, 'index.html');
                        if (fs.existsSync(indexPath)) {
                            console.log('✅ index.html found in CWD/dist/public');
                        } else {
                            console.log('❌ index.html NOT found in CWD/dist/public');
                        }
                    } else {
                        console.log('❌ dist/public does NOT exist in CWD');
                    }
                } else {
                    console.log('❌ CWD does NOT exist');
                }
            }
        }
    } catch (error) {
        console.log('❌ Failed to load ecosystem config:', error.message);
    }
} else {
    console.log('❌ Ecosystem config does NOT exist');
}

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`  PORT: ${process.env.PORT || 'Not set'}`);
console.log(`  HOST: ${process.env.HOST || 'Not set'}`);

// Check current working directory
console.log(`\n📁 Current working directory: ${process.cwd()}`);

// Check if dist/public exists in current directory
const currentDistPath = path.join(process.cwd(), 'dist/public');
console.log(`📁 Checking dist/public in current directory: ${currentDistPath}`);
if (fs.existsSync(currentDistPath)) {
    console.log('✅ dist/public exists in current directory');
    
    const indexPath = path.join(currentDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        console.log('✅ index.html found in current directory/dist/public');
    } else {
        console.log('❌ index.html NOT found in current directory/dist/public');
    }
} else {
    console.log('❌ dist/public does NOT exist in current directory');
}