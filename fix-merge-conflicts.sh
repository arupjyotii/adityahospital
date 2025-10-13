#!/bin/bash

echo "🏥 Aditya Hospital - Fix Merge Conflicts Script"
echo "============================================"

# Function to resolve merge conflicts in a file
resolve_conflicts() {
    local file=$1
    echo "🔧 Resolving conflicts in $file..."
    
    # Create a backup
    cp "$file" "$file.backup"
    
    # Remove conflict markers and keep the working version
    # This removes the conflict markers and keeps the content between them
    sed -i '/^<<<<<<< HEAD/,/^>>>>>>> /{//!b}; /^<<<<<<< HEAD/,/^======= /d; /^======= /,/^>>>>>>> /d' "$file"
    
    echo "✅ Resolved conflicts in $file"
}

# Find and fix all files with merge conflicts
echo "🔍 Searching for files with merge conflicts..."

# Look for files with conflict markers
CONFLICT_FILES=$(grep -rl "<<<<<<<" . 2>/dev/null || true)

if [ -n "$CONFLICT_FILES" ]; then
    echo "❌ Found merge conflicts in the following files:"
    echo "$CONFLICT_FILES"
    
    # Resolve each file
    for file in $CONFLICT_FILES; do
        resolve_conflicts "$file"
    done
    
    echo "✅ All merge conflicts resolved!"
else
    echo "✅ No merge conflicts found"
fi

echo ""
echo "🔄 Restarting application..."
pm2 restart adityahospital

echo ""
echo "📋 Checking status..."
pm2 status

echo ""
echo "✅ Merge conflict fix complete!"