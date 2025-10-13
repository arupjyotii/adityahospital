#!/bin/bash

echo "🏥 Aditya Hospital - Fix Missing Build Files"
echo "=========================================="

echo "Current directory: $(pwd)"

echo -e "\n🔍 Checking if dist/public directory exists:"
if [ -d "dist/public" ]; then
    echo "✅ dist/public directory exists"
    echo "Contents:"
    ls -la dist/public
else
    echo "❌ dist/public directory does NOT exist"
fi

echo -e "\n🔍 Checking if index.html exists:"
if [ -f "dist/public/index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html does NOT exist"
fi

echo -e "\n🏗️  Building frontend..."
cd client
npm run build
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    exit 1
fi

echo -e "\n🔍 Checking build output:"
if [ -d "dist/public" ]; then
    echo "✅ dist/public directory exists after build"
    echo "Contents:"
    ls -la dist/public
else
    echo "❌ dist/public directory does NOT exist after build"
fi

if [ -f "dist/public/index.html" ]; then
    echo "✅ index.html exists after build"
    echo "File size: $(ls -la dist/public/index.html | awk '{print $5}') bytes"
else
    echo "❌ index.html does NOT exist after build"
fi

echo -e "\n🔄 Restarting PM2 process..."
pm2 restart adityahospital

echo -e "\n📋 PM2 status:"
pm2 status

echo -e "\n✅ Fix complete! Check https://adityahospitalnagaon.com/ in a few moments."