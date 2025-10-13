// Debug script to check the doctors API response
import fetch from 'node-fetch';

async function debugDoctorsAPI() {
  try {
    console.log('Testing doctors API endpoint...');
    
    const response = await fetch('http://localhost:4173/api/doctors');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if the data structure matches what the frontend expects
    if (data.success && data.data && data.data.doctors) {
      console.log('\n✅ Data structure looks correct');
      console.log('Number of doctors:', data.data.doctors.length);
      
      if (data.data.doctors.length > 0) {
        console.log('\nFirst doctor object:');
        console.log(JSON.stringify(data.data.doctors[0], null, 2));
      }
    } else {
      console.log('\n❌ Data structure does not match expected format');
      console.log('Expected: { success: true, data: { doctors: [...] } }');
      console.log('Actual structure keys:', Object.keys(data));
    }
  } catch (error) {
    console.error('Error testing doctors API:', error);
  }
}

debugDoctorsAPI();