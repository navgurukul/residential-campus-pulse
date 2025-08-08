const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Increase limit for large datasets

app.post('/api/data', (req, res) => {
  const data = req.body;
  console.log('Data received from App Script:', data);
  res.status(200).send({ message: 'Data received successfully' });
});

// New endpoint for importing Google Sheet data
app.post('/api/import-data', (req, res) => {
  try {
    const data = req.body;
    
    // Log the received data for debugging
    console.log('=== Import Data Endpoint Called ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
    console.log('Sample data (first 2 rows):', JSON.stringify(data.slice ? data.slice(0, 2) : data, null, 2));
    
    // Validate that we received an array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: 'Expected an array of objects'
      });
    }
    
    // Log column headers if data exists
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log('Column headers:', headers);
    }
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Data received.',
      recordsReceived: data.length
    });
    
  } catch (error) {
    console.error('Error processing import data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
