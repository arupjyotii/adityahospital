#!/usr/bin/env node

// Diagnostic script to check if static files are accessible
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏥 Aditya Hospital - Static File Diagnostic');
console.log('==========================================');

// Check paths from both server and project root perspectives
const serverStaticPath = path.join(__dirname, '../../adityahospital/dist/public');
const projectStaticPath = path.join(__dirname, 'dist/public');

console.log(`\n📁 Checking server perspective path: ${serverStaticPath}`);
console.log(`📁 Checking project perspective path: ${projectStaticPath}`);

// Check server perspective
if (fs.existsSync(serverStaticPath)) {
    console.log('✅ Server perspective path exists');
    
    const files = fs.readdirSync(serverStaticPath);
    if (files.length > 0) {
        console.log(`✅ Server path contains ${files.length} items`);
        
        const indexPath = path.join(serverStaticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html found in server path');
            const stats = fs.statSync(indexPath);
            console.log(`📄 index.html size: ${stats.size} bytes`);
        } else {
            console.log('❌ index.html NOT found in server path');
        }
    } else {
        console.log('❌ Server path is EMPTY');
    }
} else {
    console.log('❌ Server perspective path does NOT exist');
}

// Check project perspective
if (fs.existsSync(projectStaticPath)) {
    console.log('\n✅ Project perspective path exists');
    
    const files = fs.readdirSync(projectStaticPath);
    if (files.length > 0) {
        console.log(`✅ Project path contains ${files.length} items`);
        
        const indexPath = path.join(projectStaticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html found in project path');
            const stats = fs.statSync(indexPath);
            console.log(`📄 index.html size: ${stats.size} bytes`);
        } else {
            console.log('❌ index.html NOT found in project path');
        }
    } else {
        console.log('❌ Project path is EMPTY');
    }
} else {
    console.log('\n❌ Project perspective path does NOT exist');
}

// Test the actual path the server will use
const serverIndexPath = path.join(__dirname, '../../adityahospital/dist/public/index.html');
console.log(`\n🔍 Testing server-accessible path: ${serverIndexPath}`);

fs.access(serverIndexPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.log('❌ Server cannot access index.html at expected path');
        console.log('💡 This might be a path configuration issue');
        
        // Try alternative path
        const altIndexPath = path.join(__dirname, '../dist/public/index.html');
        console.log(`\n🔍 Trying alternative path: ${altIndexPath}`);
        
        fs.access(altIndexPath, fs.constants.F_OK, (err2) => {
            if (err2) {
                console.log('❌ Server cannot access index.html at alternative path either');
                console.log('💡 The build files may not exist or are in a different location');
            } else {
                console.log('✅ Server can access index.html at alternative path');
                console.log('💡 Consider updating the path configuration in server/index.js');
            }
        });
    } else {
        console.log('✅ Server can access index.html at expected path');
        console.log('\n🎉 Static file paths appear to be correct.');
    }
});