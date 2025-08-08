// Test script for the /api/import-data endpoint
const fetch = require('node-fetch');

// Sample data that mimics Google Sheet structure
const sampleData = [
  {
    "Campus Name": "Pune Campus",
    "Location": "Pune, Maharashtra",
    "Average Score": "8.5",
    "Total Resolvers": "12",
    "Ranking": "High",
    "Last Evaluated": "2024-01-15"
  },
  {
    "Campus Name": "Dantewada Campus", 
    "Location": "Dantewada, Chhattisgarh",
    "Average Score": "7.8",
    "Total Resolvers": "8",
    "Ranking": "Medium",
    "Last Evaluated": "2024-01-14"
  },
  {
    "Campus Name": "Himachal Campus",
    "Location": "Dharamshala, Himachal Pradesh", 
    "Average Score": "7.2",
    "Total Resolvers": "6",
    "Ranking": "Medium",
    "Last Evaluated": "2024-01-13"
  }
];

async function testImportEndpoint() {
  try {
    console.log('Testing /api/import-data endpoint...');
    
    const response = await fetch('http://localhost:3001/api/import-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleData)
    });
    
    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Body:', result);
    
    if (response.ok) {
      console.log('✅ Test passed! Endpoint is working correctly.');
    } else {
      console.log('❌ Test failed! Check the server logs.');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.log('Make sure the server is running on http://localhost:3001');
  }
}

// Run the test
testImportEndpoint();