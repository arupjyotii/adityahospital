#!/bin/bash

echo "🏥 Aditya Hospital - Backend API Test"
echo "==================================="

echo "Testing backend API endpoints..."

# Test the health endpoint
echo -e "\n🔍 Testing /api/health endpoint:"
curl -v http://localhost:4173/api/health 2>&1

# Test departments endpoint
echo -e "\n🔍 Testing /api/departments endpoint:"
curl -v http://localhost:4173/api/departments 2>&1

# Test doctors endpoint
echo -e "\n🔍 Testing /api/doctors endpoint:"
curl -v http://localhost:4173/api/doctors 2>&1

# Test services endpoint
echo -e "\n🔍 Testing /api/services endpoint:"
curl -v http://localhost:4173/api/services 2>&1

# Test if the server is running at all
echo -e "\n🔍 Checking if server is listening on port 4173:"
netstat -tlnp | grep :4173 2>/dev/null || echo "Port 4173 is not in use"

echo -e "\n📋 PM2 process status:"
pm2 status

echo -e "\n📋 PM2 logs (last 20 lines):"
pm2 logs adityahospital --lines 20