import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    console.log('Testing login with admin credentials...');
    
    const response = await fetch('http://localhost:4173/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing login:', error);
  }
};

testLogin();