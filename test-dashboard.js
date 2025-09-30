import fetch from 'node-fetch';

const testDashboard = async () => {
  try {
    console.log('Testing dashboard endpoint...');
    
    // First, let's login to get a valid token
    const loginResponse = await fetch('http://localhost:4173/api/auth/login', {
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

    // Now test the dashboard endpoint
    const dashboardResponse = await fetch('http://localhost:4173/api/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Dashboard Status:', dashboardResponse.status);
    console.log('Dashboard Status Text:', dashboardResponse.statusText);
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard Response:', JSON.stringify(dashboardData, null, 2));
    
    return dashboardData;
  } catch (error) {
    console.error('Error testing dashboard:', error);
  }
};

testDashboard();