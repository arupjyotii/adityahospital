#!/usr/bin/env node

// Script to fix actual merge conflicts in the Aditya Hospital project
import fs from 'fs';
import path from 'path';

console.log('🏥 Aditya Hospital - Fix Actual Merge Conflicts Script');
console.log('===================================================');

// Function to fix merge conflicts in a file
function fixMergeConflicts(filePath) {
    try {
        console.log(`🔧 Checking ${filePath} for merge conflicts...`);
        
        // Read the file content
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file actually has merge conflicts (all three markers)
        const hasRealConflict = content.includes('<<<<<<<') && content.includes('=======') && content.includes('>>>>>>>');
        
        if (hasRealConflict) {
            console.log(`❌ Found real merge conflict in ${filePath}`);
            
            // Create a backup
            fs.writeFileSync(`${filePath}.backup`, content);
            
            // Remove conflict markers - keep the working version (content between <<<<<<< and =======)
            // This regex looks for the conflict pattern and keeps the working version
            content = content.replace(/<<<<<<< HEAD[\s\S]*?=======([\s\S]*?)>>>>>>>.*?\n/g, '$1');
            
            // Write the cleaned content back to the file
            fs.writeFileSync(filePath, content);
            
            console.log(`✅ Fixed merge conflict in ${filePath}`);
        } else {
            console.log(`✅ No real merge conflicts in ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
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
            
            // Skip the fix scripts themselves
            if (file === 'find-merge-conflicts.js' || file === 'fix-actual-merge-conflicts.js') {
                continue;
            }
            
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                searchDirectory(filePath);
            } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                fixMergeConflicts(filePath);
            }
        }
    } catch (err) {
        console.error(`Error searching directory ${dir}:`, err.message);
    }
}

// Start searching from current directory
searchDirectory('.');

console.log('');
console.log('✅ Merge conflict fix complete!');