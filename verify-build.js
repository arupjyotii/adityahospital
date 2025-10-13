#!/usr/bin/env node

// Script to verify that the frontend build files exist
// This should be run on the VPS after deployment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = __dirname;

console.log('🏥 Aditya Hospital - Build Verification Script');
console.log('==============================================');

// Check if dist/public directory exists
const distPublicPath = path.join(projectRoot, 'dist', 'public');
console.log(`\n📁 Checking build directory: ${distPublicPath}`);

if (fs.existsSync(distPublicPath)) {
    console.log('✅ Build directory exists');
    
    // Check if it's empty
    const files = fs.readdirSync(distPublicPath);
    if (files.length > 0) {
        console.log(`✅ Build directory contains ${files.length} items`);
        
        // Check specifically for index.html
        const indexPath = path.join(distPublicPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html found');
            
            // Check file size
            const stats = fs.statSync(indexPath);
            console.log(`📄 index.html size: ${stats.size} bytes`);
        } else {
            console.log('❌ index.html NOT found');
            process.exit(1);
        }
        
        // Show some of the files
        console.log('\n📋 First 10 files in build directory:');
        files.slice(0, 10).forEach(file => {
            console.log(`  - ${file}`);
        });
    } else {
        console.log('❌ Build directory is EMPTY');
        process.exit(1);
    }
} else {
    console.log('❌ Build directory does NOT exist');
    console.log('💡 Please run "npm run build" to generate the build files');
    process.exit(1);
}

// Also check if the server can access the file
const serverIndexPath = path.join(__dirname, 'dist/public/index.html');
console.log(`\n🔍 Checking server-accessible path: ${serverIndexPath}`);

fs.access(serverIndexPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.log('❌ Server cannot access index.html');
        console.log('💡 This might be a path configuration issue');
        process.exit(1);
    } else {
        console.log('✅ Server can access index.html');
        console.log('\n🎉 All checks passed! The build appears to be correct.');
        process.exit(0);
    }
});