const axios = require('axios');

// Create axios instance similar to frontend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'x-mock-role': 'attendee'
  },
});

async function testProfileUpdate() {
  try {
    console.log('Testing profile update...');
    
    const updateData = {
      name: 'Updated Attendee Name',
      bio: 'This is a test bio update from frontend test',
      phone: '+917302752999'
    };
    
    console.log('Sending request with data:', updateData);
    
    const response = await api.put('/users/profile', updateData);
    
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error updating profile:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  }
}

testProfileUpdate();
