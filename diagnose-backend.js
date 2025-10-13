// Diagnostic script to test backend API endpoints
import http from 'http';
import { spawn } from 'child_process';

console.log('🏥 Aditya Hospital - Backend API Diagnostic');
console.log('========================================');

// Test endpoints
const endpoints = [
  '/api/health',
  '/api/departments',
  '/api/doctors',
  '/api/services'
];

// Test function
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4173,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${endpoint} - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(jsonData).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        resolve({ endpoint, status: res.statusCode });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
      resolve({ endpoint, status: 'error', error: error.message });
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${endpoint} - Timeout`);
      req.destroy();
      resolve({ endpoint, status: 'timeout' });
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🔍 Testing backend API endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 Checking server process...');
  
  const pm2 = spawn('pm2', ['status']);
  
  pm2.stdout.on('data', (data) => {
    console.log(`PM2 Status: ${data}`);
  });
  
  pm2.stderr.on('data', (data) => {
    console.log(`PM2 Error: ${data}`);
  });
  
  pm2.on('close', (code) => {
    console.log(`PM2 process exited with code ${code}`);
    console.log('\n✅ Diagnostic complete!');
  });
}

runTests().catch(console.error);