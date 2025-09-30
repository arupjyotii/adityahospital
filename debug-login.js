// Debug script to see exactly what's happening during login
async function debugLogin() {
  try {
    console.log('Attempting login...');
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Check the structure
    console.log('\nStructure analysis:');
    console.log('- data exists:', !!data);
    console.log('- data.success:', data?.success);
    console.log('- data.data exists:', !!data?.data);
    console.log('- data.data.user exists:', !!data?.data?.user);
    console.log('- data.data.token exists:', !!data?.data?.token);
    
    if (data?.data) {
      console.log('- data.data keys:', Object.keys(data.data));
    }
    
  } catch (error) {
    console.error('Error during login:', error);
  }
}

debugLogin();