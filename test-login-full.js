import fetch from 'node-fetch';

async function testLogin() {
  try {
    const response = await fetch('http://67.211.211.34:4173/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // Check the structure
    console.log('\nResponse structure analysis:');
    console.log('- success:', data.success);
    console.log('- message:', data.message);
    console.log('- data:', data.data);
    console.log('- data.user:', data.data?.user);
    console.log('- data.token:', data.data?.token);
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();