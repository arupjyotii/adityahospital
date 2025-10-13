#!/usr/bin/env node

// Diagnostic script to check if build files exist
import fs from 'fs';
import path from 'path';

console.log('🏥 Aditya Hospital - Deployment Diagnostic Tool');
console.log('==============================================');

// Check if we're in the correct directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root directory.');
    process.exit(1);
}

// Check if dist/public directory exists
const distPath = path.join(process.cwd(), 'dist', 'public');
console.log(`\n📁 Checking build directory: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log('✅ Build directory exists');
    
    // Check if it's empty
    const files = fs.readdirSync(distPath);
    if (files.length > 0) {
        console.log(`✅ Build directory contains ${files.length} items`);
        
        // Check specifically for index.html
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html found');
            
            // Check file size
            const stats = fs.statSync(indexPath);
            console.log(`📄 index.html size: ${stats.size} bytes`);
        } else {
            console.log('❌ index.html NOT found');
        }
        
        // Show some of the files
        console.log('\n📋 First 10 files in build directory:');
        files.slice(0, 10).forEach(file => {
            console.log(`  - ${file}`);
        });
    } else {
        console.log('❌ Build directory is EMPTY');
    }
} else {
    console.log('❌ Build directory does NOT exist');
}

// Check if client directory exists
const clientPath = path.join(process.cwd(), 'client');
console.log(`\n📁 Checking client directory: ${clientPath}`);

if (fs.existsSync(clientPath)) {
    console.log('✅ Client directory exists');
    
    // Check if package.json exists in client
    const clientPackageJson = path.join(clientPath, 'package.json');
    if (fs.existsSync(clientPackageJson)) {
        console.log('✅ Client package.json found');
    } else {
        console.log('❌ Client package.json NOT found');
    }
} else {
    console.log('❌ Client directory does NOT exist');
}

console.log('\n🏁 Diagnostic complete');