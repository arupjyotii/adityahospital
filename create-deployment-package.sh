#!/bin/bash

# Package Creator for Aditya Hospital Deployment
# Creates a compressed deployment package

echo "📦 Creating Aditya Hospital Deployment Package"
echo "=============================================="

# Get current date for versioning
DATE=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="aditya-hospital-deployment-$DATE"

echo "Creating package: $PACKAGE_NAME.tar.gz"

# Create temporary directory
mkdir -p temp_package
cp -r deployment-ready/* temp_package/

# Create the compressed package
tar -czf "$PACKAGE_NAME.tar.gz" -C temp_package .

# Clean up
rm -rf temp_package

echo "✅ Package created successfully: $PACKAGE_NAME.tar.gz"
echo ""
echo "📋 Package Contents:"
tar -tzf "$PACKAGE_NAME.tar.gz" | head -20
echo "..."
echo ""
echo "🚀 Upload to your VPS and extract with:"
echo "tar -xzf $PACKAGE_NAME.tar.gz"
echo "chmod +x setup.sh install.sh"
echo "./setup.sh"