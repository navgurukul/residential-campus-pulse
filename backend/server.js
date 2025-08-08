const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// In-memory storage for the imported data
let storedData = [];
let lastUpdated = null;

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

    // Store the data in memory
    storedData = data;
    lastUpdated = new Date().toISOString();

    // Log column headers if data exists
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log('Column headers:', headers);
      console.log('Data stored successfully');
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

// New endpoint to serve processed data to frontend
app.get('/api/campus-data', (req, res) => {
  try {
    console.log('=== Campus Data Endpoint Called ===');
    console.log('Stored data length:', storedData.length);
    console.log('Last updated:', lastUpdated);

    if (storedData.length === 0) {
      return res.status(200).json({
        campuses: [],
        resolvers: [],
        evaluations: [],
        lastUpdated: null,
        message: 'No data available yet'
      });
    }

    // Process the raw data into the format expected by frontend
    const processedData = processRawDataForFrontend(storedData);

    res.status(200).json({
      ...processedData,
      lastUpdated,
      recordCount: storedData.length
    });

  } catch (error) {
    console.error('Error serving campus data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Function to process raw Google Sheet data into frontend format
function processRawDataForFrontend(rawData) {
  // This function will transform your Google Sheet data into the format your frontend expects
  // For now, let's create a basic structure - you can customize this based on your actual data

  const campuses = [];
  const resolvers = [];
  const evaluations = [];

  // Process each row from Google Sheet
  rawData.forEach((row, index) => {
    // Extract campus information (customize these field names based on your Google Sheet columns)
    const campusName = row['Campus Name'] || row['campus_name'] || `Campus ${index + 1}`;
    const location = row['Location'] || row['location'] || 'Unknown Location';
    const averageScore = parseFloat(row['Average Score'] || row['average_score'] || Math.random() * 10);
    const totalResolvers = parseInt(row['Total Resolvers'] || row['total_resolvers'] || Math.floor(Math.random() * 20) + 1);
    const ranking = row['Ranking'] || row['ranking'] || (averageScore > 8 ? 'High' : averageScore > 6 ? 'Medium' : 'Low');
    const lastEvaluated = row['Last Evaluated'] || row['last_evaluated'] || new Date().toISOString().split('T')[0];

    // Create campus object
    const campus = {
      id: `campus-${index + 1}`,
      name: campusName,
      location: location,
      averageScore: averageScore,
      totalResolvers: totalResolvers,
      ranking: ranking,
      lastEvaluated: lastEvaluated
    };

    campuses.push(campus);

    // Create sample resolver and evaluation data
    // You can customize this based on your actual data structure
    const resolverName = row['Resolver Name'] || row['resolver_name'] || `Resolver ${index + 1}`;
    const resolver = {
      id: `resolver-${index + 1}`,
      name: resolverName,
      email: `${resolverName.toLowerCase().replace(' ', '.')}@navgurukul.org`,
      campusesEvaluated: 1,
      averageScoreGiven: averageScore,
      totalEvaluations: 1,
      lastActivity: lastEvaluated,
      level: 'Senior',
      framework: 'Standard'
    };

    resolvers.push(resolver);

    // Create evaluation data
    const evaluation = {
      id: `eval-${index + 1}`,
      campusId: campus.id,
      resolverId: resolver.id,
      resolverName: resolverName,
      campusName: campusName,
      overallScore: averageScore,
      competencies: [
        'Vipassana',
        'Nutrition Supplementation + Yoga/Weight Training',
        'Houses and Reward Systems',
        'Etiocracy, Co-Creation & Ownership',
        'Campus interactions',
        'Gratitude',
        'Hackathons',
        'English Communication & Comprehension',
        'Learning Environment & Peer Support',
        'Process Principles Understanding & Implementation',
        'Life Skills Implementation'
      ].map(category => ({
        category,
        score: Math.round((averageScore + (Math.random() - 0.5) * 2) * 10) / 10,
        maxScore: 10
      })),
      feedback: row['Feedback'] || row['feedback'] || `Comprehensive evaluation of ${campusName}. Good performance across most areas with opportunities for improvement.`,
      dateEvaluated: lastEvaluated,
      status: 'Completed'
    };

    evaluations.push(evaluation);
  });

  return {
    campuses,
    resolvers,
    evaluations
  };
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
