#!/usr/bin/env node

// Script to verify that all deployment fixes have been applied correctly
import fs from 'fs';
import path from 'path';

console.log('🏥 Aditya Hospital - Deployment Verification Script');
console.log('================================================');

// Function to check if a file exists
function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

// Function to check if a file contains specific content
function fileContains(filePath, content) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent.includes(content);
    } catch (err) {
        return false;
    }
}

// Function to check for merge conflicts (using the same logic as find-merge-conflicts.js)
function hasMergeConflicts(filePath) {
    // Skip our own scripts
    if (filePath.includes('find-merge-conflicts.js') || filePath.includes('fix-actual-merge-conflicts.js') || filePath.includes('verify-deployment.js')) {
        return false;
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check for actual merge conflict markers - all three must be present
        // Look for the specific pattern of conflict markers
        const hasStartMarker = content.includes('<<<<<<< HEAD') || content.includes('<<<<<<< Updated upstream');
        const hasMiddleMarker = content.includes('=======');
        const hasEndMarker = content.includes('>>>>>>> HEAD') || content.includes('>>>>>>> Stashed changes') || content.includes('>>>>>>> main') || content.includes('>>>>>>> master');
        
        return hasStartMarker && hasMiddleMarker && hasEndMarker;
    } catch (err) {
        return false;
    }
}

// Function to recursively search for files with merge conflicts
function searchForMergeConflicts(dir) {
    try {
        const files = fs.readdirSync(dir);
        let conflicts = [];
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            
            // Skip node_modules, .git, dist, and our own scripts
            if (file === 'node_modules' || file === '.git' || file === 'dist' || 
                file === 'find-merge-conflicts.js' || file === 'fix-actual-merge-conflicts.js' || file === 'verify-deployment.js') {
                continue;
            }
            
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                conflicts = conflicts.concat(searchForMergeConflicts(filePath));
            } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                if (hasMergeConflicts(filePath)) {
                    conflicts.push(filePath);
                }
            }
        }
        
        return conflicts;
    } catch (err) {
        return [];
    }
}

// Verification checks
const checks = [
    {
        name: 'Ecosystem config file exists',
        check: () => fileExists(path.join('.', 'ecosystem.config.js'))
    },
    {
        name: 'Ecosystem config uses CommonJS syntax',
        check: () => fileContains(path.join('.', 'ecosystem.config.js'), 'module.exports =')
    },
    {
        name: 'Ecosystem config has correct app name',
        check: () => fileContains(path.join('.', 'ecosystem.config.js'), 'adityahospital')
    },
    {
        name: 'Merge conflict detection script exists',
        check: () => fileExists(path.join('.', 'find-merge-conflicts.js'))
    },
    {
        name: 'Merge conflict fix script exists',
        check: () => fileExists(path.join('.', 'fix-actual-merge-conflicts.js'))
    },
    {
        name: 'Deployment script exists',
        check: () => fileExists(path.join('.', 'deploy-fix-merge-conflicts.sh'))
    },
    {
        name: 'No merge conflicts in project files',
        check: () => {
            const conflicts = searchForMergeConflicts('.');
            return conflicts.length === 0;
        }
    },
    {
        name: 'Frontend build directory exists',
        check: () => fileExists(path.join('.', 'dist', 'public'))
    }
];

// Run verification checks
let passed = 0;
let failed = 0;

console.log('\n🔍 Running verification checks...\n');

checks.forEach((check, index) => {
    const result = check.check();
    if (result) {
        console.log(`✅ ${check.name}`);
        passed++;
    } else {
        console.log(`❌ ${check.name}`);
        failed++;
    }
});

console.log('\n📊 Verification Results:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total:  ${checks.length}`);

if (failed === 0) {
    console.log('\n🎉 All verification checks passed!');
    console.log('✅ The deployment fixes have been applied correctly.');
} else {
    console.log('\n⚠️  Some verification checks failed.');
    console.log('Please review the failed checks and ensure all fixes are properly applied.');
}

console.log('\n💡 Next steps:');
console.log('1. Upload the fixed files to the production server');
console.log('2. Run the deploy-fix-merge-conflicts.sh script on the server');
console.log('3. Verify the application is running correctly with: pm2 logs adityahospital');