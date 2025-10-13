#!/bin/bash

# Aditya Hospital - Production Fix Deployment Script
# This script deploys all the necessary fixes to resolve the ENOENT errors

echo "🏥 Starting Aditya Hospital PRODUCTION FIX deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Backup current files
echo "🔄 Backing up current files..."
cp client/src/index.css client/src/index.css.backup
cp tailwind.config.js tailwind.config.js.backup 2>/dev/null || echo "No existing tailwind.config.js to backup"

# Apply CSS fix (if not already applied)
echo "🎨 Applying CSS fixes..."
sed -i 's/@apply border-border;/border-color: hsl(var(--border));/g' client/src/index.css

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

# Build the frontend
echo "🏗️  Building frontend..."
cd client
npm run build
cd ..

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    echo "Restoring backups..."
    mv client/src/index.css.backup client/src/index.css
    mv tailwind.config.js.backup tailwind.config.js 2>/dev/null || echo "No backup to restore"
    exit 1
fi

# Verify that the build directory exists and has content
if [ ! -d "dist/public" ] || [ -z "$(ls -A dist/public)" ]; then
    echo "❌ Error: Build directory is missing or empty."
    echo "Restoring backups..."
    mv client/src/index.css.backup client/src/index.css
    mv tailwind.config.js.backup tailwind.config.js 2>/dev/null || echo "No backup to restore"
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

echo "✅ Production fixes deployed successfully!"
echo ""
echo "To restart the application with PM2:"
echo "  pm2 restart adityahospital"
echo ""
echo "To view logs:"
echo "  pm2 logs adityahospital"