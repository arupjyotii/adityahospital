#!/bin/bash

# Script to fix merge conflicts in the codebase
# This should be run on the production server

echo "🔍 Checking for merge conflicts in the codebase..."

# Look for merge conflict markers
CONFLICT_FILES=$(grep -rl "<<<<<<<" /root/adityahospital/client/src/ 2>/dev/null || true)

if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ Found merge conflicts in the following files:"
    echo "$CONFLICT_FILES"
    
    echo "🔧 Attempting to resolve merge conflicts..."
    
    # For each file with conflicts, try to resolve them
    for file in $CONFLICT_FILES; do
        echo "Processing $file..."
        
        # Create a backup
        cp "$file" "$file.backup"
        
        # Remove conflict markers and keep the working version
        # This removes the conflict markers and keeps the content between them
        sed -i '/^<<<<<<< HEAD/,/^>>>>>>> /{//!b}; /^<<<<<<< HEAD/,/^======= /d; /^======= /,/^>>>>>>> /d' "$file"
        
        echo "Resolved conflicts in $file"
    done
    
    echo "✅ Merge conflicts resolved!"
else
    echo "✅ No merge conflicts found"
fi

# Now run the deploy-fixes.sh script
echo "🚀 Running deployment fixes..."
chmod +x /root/adityahospital/deploy-fixes.sh
/root/adityahospital/deploy-fixes.sh