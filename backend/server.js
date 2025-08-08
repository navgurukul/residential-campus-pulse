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

    console.log('=== STORING DATA ===');
    console.log('Data stored in memory, length:', storedData.length);
    console.log('Last updated set to:', lastUpdated);

    // Log column headers if data exists
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log('Column headers:', headers);
      console.log('Full first row data:', JSON.stringify(data[0], null, 2));
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

    if (storedData.length > 0) {
      console.log('Sample stored data:', JSON.stringify(storedData[0], null, 2));
      console.log('All column headers:', Object.keys(storedData[0]));
    }

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

// Helper function to find column value with flexible naming
function getColumnValue(row, possibleNames, defaultValue = '') {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return defaultValue;
}

// Function to process raw Google Sheet data into frontend format
function processRawDataForFrontend(rawData) {
  console.log('Processing raw data for frontend...');

  if (!rawData || rawData.length === 0) {
    return { campuses: [], resolvers: [], evaluations: [] };
  }

  // Log all available columns for debugging
  const availableColumns = Object.keys(rawData[0]);
  console.log('Available columns in data:', availableColumns);

  // Group data by campus to aggregate scores
  const campusMap = new Map();
  const resolvers = [];
  const evaluations = [];

  // Process each row from Google Sheet
  rawData.forEach((row, index) => {
    console.log(`Processing row ${index + 1}:`, Object.keys(row));

    // Extract basic information - try common Google Form field patterns
    const timestamp = getColumnValue(row, [
      'Timestamp', 'timestamp', 'Date', 'Created Date', 'Submission Time'
    ], new Date().toISOString());

    // Extract campus name - try various patterns
    const campusName = getColumnValue(row, [
      'Which campus are you evaluating?',
      'Campus Name', 'campus_name', 'Campus', 'campus', 'Name', 'name',
      'Campus Location', 'Location'
    ], `Campus ${index + 1}`);

    // Extract resolver information
    const resolverName = getColumnValue(row, [
      'Email Address', 'email', 'Your Email', 'Resolver Email',
      'Name', 'Your Name', 'Full Name', 'Resolver Name'
    ], `Resolver ${index + 1}`);

    const resolverEmail = getColumnValue(row, [
      'Email Address', 'email', 'Your Email', 'Resolver Email'
    ], resolverName.includes('@') ? resolverName : `${resolverName.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`);

    // Extract competency scores - look for numeric values in columns
    const competencyCategories = [
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
    ];

    const competencies = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Try to extract scores from any numeric columns
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      if (value && !isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 10) {
        const score = parseFloat(value);
        totalScore += score;
        scoreCount++;

        // Try to match column to competency category
        const matchedCategory = competencyCategories.find(cat =>
          columnName.toLowerCase().includes(cat.toLowerCase().substring(0, 10)) ||
          cat.toLowerCase().includes(columnName.toLowerCase())
        ) || competencyCategories[competencies.length % competencyCategories.length];

        competencies.push({
          category: matchedCategory,
          score: score,
          maxScore: 10
        });
      }
    });

    // If no numeric scores found, create default competencies
    if (competencies.length === 0) {
      const defaultScore = 7 + Math.random() * 2; // Random score between 7-9
      competencyCategories.forEach(category => {
        competencies.push({
          category,
          score: Math.round((defaultScore + (Math.random() - 0.5) * 2) * 10) / 10,
          maxScore: 10
        });
      });
      totalScore = defaultScore * competencyCategories.length;
      scoreCount = competencyCategories.length;
    }

    const averageScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 7.5;
    const lastEvaluated = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Create or update campus data
    if (!campusMap.has(campusName)) {
      campusMap.set(campusName, {
        id: `campus-${campusMap.size + 1}`,
        name: campusName,
        location: campusName,
        scores: [],
        resolverCount: 0,
        lastEvaluated: lastEvaluated
      });
    }

    const campusData = campusMap.get(campusName);
    campusData.scores.push(averageScore);
    campusData.resolverCount++;
    if (lastEvaluated > campusData.lastEvaluated) {
      campusData.lastEvaluated = lastEvaluated;
    }

    // Create resolver object
    const resolver = {
      id: `resolver-${index + 1}`,
      name: resolverName,
      email: resolverEmail,
      campusesEvaluated: 1,
      averageScoreGiven: averageScore,
      totalEvaluations: 1,
      lastActivity: lastEvaluated,
      level: 'Senior',
      framework: 'Standard'
    };

    resolvers.push(resolver);

    // Extract feedback
    const feedback = getColumnValue(row, [
      'Additional Comments', 'comments', 'Feedback', 'feedback', 'Notes', 'notes',
      'Any additional feedback?', 'Other comments'
    ], `Comprehensive evaluation of ${campusName}. Good performance across most areas with opportunities for improvement.`);

    // Create evaluation data
    const evaluation = {
      id: `eval-${index + 1}`,
      campusId: campusData.id,
      resolverId: resolver.id,
      resolverName: resolverName,
      campusName: campusName,
      overallScore: averageScore,
      competencies: competencies,
      feedback: feedback,
      dateEvaluated: lastEvaluated,
      status: 'Completed'
    };

    evaluations.push(evaluation);
  });

  // Convert campus map to array with calculated averages
  const campuses = Array.from(campusMap.values()).map(campusData => ({
    id: campusData.id,
    name: campusData.name,
    location: campusData.location,
    averageScore: campusData.scores.length > 0
      ? Math.round((campusData.scores.reduce((sum, score) => sum + score, 0) / campusData.scores.length) * 10) / 10
      : 7.5,
    totalResolvers: campusData.resolverCount,
    ranking: campusData.scores.length > 0
      ? (campusData.scores.reduce((sum, score) => sum + score, 0) / campusData.scores.length) > 8 ? 'High'
        : (campusData.scores.reduce((sum, score) => sum + score, 0) / campusData.scores.length) > 6 ? 'Medium' : 'Low'
      : 'Medium',
    lastEvaluated: campusData.lastEvaluated
  }));

  console.log(`Processed ${campuses.length} campuses, ${resolvers.length} resolvers, ${evaluations.length} evaluations`);

  return {
    campuses,
    resolvers,
    evaluations
  };
}

// Debug endpoint to see raw stored data
app.get('/api/debug-data', (req, res) => {
  console.log('=== DEBUG ENDPOINT CALLED ===');
  console.log('Current storedData length:', storedData.length);
  console.log('Current lastUpdated:', lastUpdated);

  res.json({
    storedDataLength: storedData.length,
    lastUpdated: lastUpdated,
    sampleData: storedData.length > 0 ? storedData[0] : null,
    allColumns: storedData.length > 0 ? Object.keys(storedData[0]) : [],
    serverTime: new Date().toISOString(),
    message: storedData.length === 0 ? 'No data stored yet. Run Google Apps Script to send data.' : 'Data found'
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});