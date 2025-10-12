import fetch from 'node-fetch';

const testDuplicateDepartment = async () => {
  try {
    console.log('Testing duplicate department creation...');
    
    // First, let's login to get a valid token
    const loginResponse = await fetch('http://67.211.211.34:4173/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('Login failed');
      return;
    }

    const token = loginData.data.token;
    console.log('Token:', token);

    // First, create a department
    const departmentData = {
      name: `Unique Department ${Date.now()}`,
      description: 'Test Description for the department'
    };

    console.log('Creating first department:', departmentData);

    const createResponse = await fetch('http://67.211.211.34:4173/api/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    });

    const createData = await createResponse.json();
    console.log('First department creation response:', createData);

    // Now try to create the same department again
    console.log('Attempting to create duplicate department...');
    
    const duplicateResponse = await fetch('http://67.211.211.34:4173/api/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    });

    console.log('Duplicate department Status:', duplicateResponse.status);
    console.log('Duplicate department Status Text:', duplicateResponse.statusText);
    
    const duplicateData = await duplicateResponse.json();
    console.log('Duplicate department Response:', JSON.stringify(duplicateData, null, 2));
    
    // Log additional details about the response
    console.log('Response headers:', [...duplicateResponse.headers.entries()]);
    
    return duplicateData;
  } catch (error) {
    console.error('Error testing duplicate department:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

testDuplicateDepartment();