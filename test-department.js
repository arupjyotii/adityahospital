import fetch from 'node-fetch';

const testDepartmentCreation = async () => {
  try {
    console.log('Testing department creation...');
    
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

    // Now test creating a department with a unique name
    const timestamp = Date.now();
    const departmentData = {
      name: `Test Department ${timestamp}`,
      description: 'Test Description for the department'
    };

    console.log('Sending department data:', departmentData);

    const departmentResponse = await fetch('http://67.211.211.34:4173/api/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    });

    console.log('Department Status:', departmentResponse.status);
    console.log('Department Status Text:', departmentResponse.statusText);
    
    const departmentDataResponse = await departmentResponse.json();
    console.log('Department Response:', JSON.stringify(departmentDataResponse, null, 2));
    
    return departmentDataResponse;
  } catch (error) {
    console.error('Error testing department creation:', error);
  }
};

testDepartmentCreation();