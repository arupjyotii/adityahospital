#!/bin/bash

# Aditya Hospital - Complete Production Fix Script
# This script fixes all known issues and deploys the application

echo "🏥 Starting Aditya Hospital COMPLETE PRODUCTION FIX..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Function to resolve merge conflicts
resolve_merge_conflicts() {
    echo "🔍 Checking for merge conflicts..."
    
    # Look for merge conflict markers
    CONFLICT_FILES=$(grep -rl "<<<<<<<" . 2>/dev/null || true)
    
    if [ -n "$CONFLICT_FILES" ]; then
        echo "❌ Found merge conflicts in the following files:"
        echo "$CONFLICT_FILES"
        
        echo "🔧 Resolving merge conflicts..."
        
        # For each file with conflicts, resolve them
        for file in $CONFLICT_FILES; do
            echo "Processing $file..."
            
            # Create a backup
            cp "$file" "$file.conflict.backup"
            
            # Remove conflict markers - keep the working version (content between <<<<<<< and =======)
            # This is a simple approach that keeps the first version and removes the conflict markers
            awk '
            /^<<<<<<< HEAD/ { skip = 1; next }
            /^=======/ { skip = 0; next }
            /^>>>>>>> / { skip = 0; next }
            !skip { print }
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            
            echo "Resolved conflicts in $file"
        done
        
        echo "✅ Merge conflicts resolved!"
    else
        echo "✅ No merge conflicts found"
    fi
}

# Function to fix build environment issues
fix_build_environment() {
    echo "🔧 Fixing build environment issues..."
    
    # Fix permissions for node_modules
    echo "🔧 Fixing node_modules permissions..."
    chmod -R 755 node_modules 2>/dev/null || echo "No node_modules directory or permission issue"

    # Specifically fix esbuild permissions
    echo "🔧 Fixing esbuild permissions..."
    find node_modules -name "esbuild" -type d -exec chmod 755 {} \; 2>/dev/null || echo "No esbuild directory found"
    find node_modules -name "esbuild" -type d -exec chmod +x {} \; 2>/dev/null || echo "Could not make esbuild executable"

    # Fix permissions for esbuild binaries specifically
    find node_modules -path "*/esbuild/*" -name "esbuild" -type f -exec chmod +x {} \; 2>/dev/null || echo "Could not make esbuild binaries executable"

    # Fix any remaining permission issues
    echo "🔧 Fixing remaining permission issues..."
    chmod +x node_modules/.bin/* 2>/dev/null || echo "Could not fix bin permissions"
    chmod +x client/node_modules/.bin/* 2>/dev/null || echo "Could not fix client bin permissions"
}

# Resolve any merge conflicts first
resolve_merge_conflicts

# Backup current files
echo "🔄 Backing up current files..."
cp client/src/index.css client/src/index.css.backup 2>/dev/null || echo "No index.css to backup"
cp tailwind.config.js tailwind.config.js.backup 2>/dev/null || echo "No existing tailwind.config.js to backup"

# Apply CSS fix (if not already applied)
echo "🎨 Applying CSS fixes..."
# Replace @apply border-border; with border-color: hsl(var(--border));
sed -i 's/@apply border-border;/border-color: hsl(var(--border));/g' client/src/index.css 2>/dev/null || echo "border-border not found in CSS"

# Create tailwind.config.js if it doesn't exist
echo "⚙️  Creating Tailwind configuration..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './client/src/**/*.{ts,tsx,js,jsx}',
    './client/src/components/**/*.{ts,tsx,js,jsx}',
    './client/src/app/**/*.{ts,tsx,js,jsx}',
    './client/index.html',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOF

# Copy tailwind.config.js to client directory
cp tailwind.config.js client/

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --force
cd client
npm install --force
cd ..

# Fix build environment issues
fix_build_environment

# Build the frontend
echo "🏗️  Building frontend..."
cd client
npm run build
cd ..

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    echo "Restoring backups..."
    mv client/src/index.css.backup client/src/index.css 2>/dev/null || echo "No CSS backup to restore"
    mv tailwind.config.js.backup tailwind.config.js 2>/dev/null || echo "No config backup to restore"
    exit 1
fi

# Verify that the build directory exists and has content
if [ ! -d "dist/public" ] || [ -z "$(ls -A dist/public)" ]; then
    echo "❌ Error: Build directory is missing or empty."
    echo "Restoring backups..."
    mv client/src/index.css.backup client/src/index.css 2>/dev/null || echo "No CSS backup to restore"
    mv tailwind.config.js.backup tailwind.config.js 2>/dev/null || echo "No config backup to restore"
    exit 1
fi

echo "✅ Frontend build completed successfully!"
echo "📁 Build output is in: dist/public/"

# List build files
echo "📋 Build files:"
ls -la dist/public/

# Verify the build
echo "🔍 Verifying build..."
node verify-build.js

# Check if verification was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Build verification failed."
    exit 1
fi

# Clean up backups
rm -f client/src/index.css.backup
rm -f tailwind.config.js.backup
rm -f client/src/*.conflict.backup 2>/dev/null || true

echo "✅ Production fixes deployed successfully!"
echo ""
echo "To restart the application with PM2:"
echo "  pm2 restart adityahospital"
echo ""
echo "To view logs:"
echo "  pm2 logs adityahospital"