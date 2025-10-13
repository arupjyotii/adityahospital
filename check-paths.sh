#!/bin/bash

echo "🏥 Aditya Hospital - Production Path Check"
echo "========================================"

echo "Current directory: $(pwd)"
echo "Home directory: $HOME"

echo -e "\n📁 Checking project structure:"
ls -la

echo -e "\n📁 Checking if dist directory exists:"
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    ls -la dist
else
    echo "❌ dist directory does NOT exist"
fi

echo -e "\n📁 Checking if dist/public directory exists:"
if [ -d "dist/public" ]; then
    echo "✅ dist/public directory exists"
    ls -la dist/public
else
    echo "❌ dist/public directory does NOT exist"
fi

echo -e "\n📁 Checking server directory:"
if [ -d "server" ]; then
    echo "✅ server directory exists"
    ls -la server
else
    echo "❌ server directory does NOT exist"
fi

echo -e "\n🔍 Checking where build files should be:"
echo "Server __dirname would be: $(pwd)/server"
echo "Static path would be: $(pwd)/server/../dist/public = $(pwd)/dist/public"
echo "Index path would be: $(pwd)/server/../dist/public/index.html = $(pwd)/dist/public/index.html"