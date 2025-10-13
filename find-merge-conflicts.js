#!/usr/bin/env node

// Script to find files with merge conflicts
import fs from 'fs';
import path from 'path';

console.log('🔍 Searching for files with merge conflicts...');

// Function to search for merge conflict markers in a file
function hasMergeConflict(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes('<<<<<<<') || content.includes('>>>>>>>') || content.includes('=======');
    } catch (err) {
        return false;
    }
}

// Function to recursively search directories
function searchDirectory(dir) {
    try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            
            // Skip node_modules and other directories we don't need to check
            if (file === 'node_modules' || file === '.git' || file === 'dist') {
                continue;
            }
            
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                searchDirectory(filePath);
            } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                if (hasMergeConflict(filePath)) {
                    console.log(`❌ Found merge conflict in: ${filePath}`);
                }
            }
        }
    } catch (err) {
        console.error(`Error searching directory ${dir}:`, err.message);
    }
}

// Start searching from current directory
searchDirectory('.');

console.log('✅ Search complete!');