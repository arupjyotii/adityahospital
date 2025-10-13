#!/usr/bin/env node

// Diagnostic script to check actual file locations on the production server
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏥 Aditya Hospital - Production Path Diagnostic');
console.log('=============================================');

// Check the actual server directory
console.log('Current directory:', __dirname);
console.log('Server directory:', path.join(__dirname, 'server'));

// Check where the server thinks the static files should be
const serverStaticPath = path.join(__dirname, 'server', '../dist/public');
const serverIndexPath = path.join(__dirname, 'server', '../dist/public/index.html');

console.log('\n📁 Server perspective:');
console.log('Static path:', serverStaticPath);
console.log('Index path:', serverIndexPath);

// Check if these paths exist
console.log('\n🔍 Checking server perspective paths:');
if (fs.existsSync(serverStaticPath)) {
    console.log('✅ Server static path exists');
    if (fs.existsSync(serverIndexPath)) {
        console.log('✅ Server index file exists');
    } else {
        console.log('❌ Server index file does NOT exist');
    }
} else {
    console.log('❌ Server static path does NOT exist');
}

// Check the actual expected paths from logs
const expectedStaticPath = path.join('/root/adityahospital', 'dist/public');
const expectedIndexPath = path.join('/root/adityahospital', 'dist/public/index.html');

console.log('\n📁 Expected perspective (from logs):');
console.log('Static path:', expectedStaticPath);
console.log('Index path:', expectedIndexPath);

console.log('\n🔍 Checking expected paths:');
if (fs.existsSync(expectedStaticPath)) {
    console.log('✅ Expected static path exists');
    if (fs.existsSync(expectedIndexPath)) {
        console.log('✅ Expected index file exists');
    } else {
        console.log('❌ Expected index file does NOT exist');
    }
} else {
    console.log('❌ Expected static path does NOT exist');
}

// Check relative to current directory
const relativeStaticPath = path.join(__dirname, 'dist/public');
const relativeIndexPath = path.join(__dirname, 'dist/public/index.html');

console.log('\n📁 Relative perspective:');
console.log('Static path:', relativeStaticPath);
console.log('Index path:', relativeIndexPath);

console.log('\n🔍 Checking relative paths:');
if (fs.existsSync(relativeStaticPath)) {
    console.log('✅ Relative static path exists');
    if (fs.existsSync(relativeIndexPath)) {
        console.log('✅ Relative index file exists');
    } else {
        console.log('❌ Relative index file does NOT exist');
    }
} else {
    console.log('❌ Relative static path does NOT exist');
}

// List what's actually in the current directory
console.log('\n📋 Current directory contents:');
try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
        console.log(`  - ${file}`);
    });
} catch (err) {
    console.log('Error reading current directory:', err.message);
}

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('\n📋 dist directory contents:');
    try {
        const distFiles = fs.readdirSync(distPath);
        distFiles.forEach(file => {
            console.log(`  - ${file}`);
        });
        
        // Check public directory
        const publicPath = path.join(distPath, 'public');
        if (fs.existsSync(publicPath)) {
            console.log('\n📋 dist/public directory contents:');
            const publicFiles = fs.readdirSync(publicPath);
            publicFiles.forEach(file => {
                console.log(`  - ${file}`);
            });
        }
    } catch (err) {
        console.log('Error reading dist directory:', err.message);
    }
} else {
    console.log('\n❌ dist directory does NOT exist');
}