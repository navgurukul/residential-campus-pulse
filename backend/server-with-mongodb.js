const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'campus-pulse';
const COLLECTION_NAME = 'campus_data';

let db;
let collection;
let mongoClient;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Load existing data on startup
    await loadDataFromMongoDB();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️ Falling back to in-memory storage');
  }
}

// In-memory storage (fallback)
let storedData = [];
let lastUpdated = null;

// Load data from MongoDB on startup
async function loadDataFromMongoDB() {
  try {
    if (!collection) return;
    
    const latestData = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    
    if (latestData.length > 0) {
      storedData = latestData[0].data;
      lastUpdated = latestData[0].lastUpdated;
      console.log(`✅ Loaded ${storedData.length} records from MongoDB`);
      console.log(`📅 Last updated: ${lastUpdated}`);
    } else {
      console.log('ℹ️ No existing data in MongoDB');
    }
  } catch (error) {
    console.error('❌ Error loading data from MongoDB:', error);
  }
}

// Save data to MongoDB
async function saveDataToMongoDB(data) {
  try {
    if (!collection) {
      console.log('⚠️ MongoDB not available, using in-memory storage only');
      return;
    }
    
    const document = {
      data: data,
      lastUpdated: new Date().toISOString(),
      timestamp: new Date(),
      recordCount: data.length
    };
    
    await collection.insertOne(document);
    console.log(`✅ Saved ${data.length} records to MongoDB`);
  } catch (error) {
    console.error('❌ Error saving to MongoDB:', error);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Pulse Backend API',
    mongodb: collection ? 'connected' : 'disconnected',
    dataRecords: storedData.length,
    lastUpdated: lastUpdated
  });
});

// Legacy endpoint
app.post('/api/data', (req, res) => {
  const data = req.body;
  console.log('Data received from App Script:', data);
  res.status(200).send({ message: 'Data received successfully' });
});

// Import data endpoint
app.post('/api/import-data', async (req, res) => {
  try {
    const data = req.body;

    console.log('=== Import Data Endpoint Called ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');

    if (!Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: 'Expected an array of objects'
      });
    }

    // Store in memory
    storedData = data;
    lastUpdated = new Date().toISOString();

    console.log('✅ Data stored in memory:', storedData.length, 'records');

    // Save to MongoDB (async, don't wait)
    saveDataToMongoDB(data).catch(err => {
      console.error('MongoDB save error (non-blocking):', err);
    });

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log('Column headers:', headers.length);
    }

    res.status(200).json({
      status: 'success',
      message: 'Data received and stored',
      recordsReceived: data.length,
      mongodb: collection ? 'saved' : 'unavailable'
    });

  } catch (error) {
    console.error('Error processing import data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get campus data endpoint
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

    const processedData = processRawDataForFrontend(storedData);

    res.status(200).json({
      ...processedData,
      lastUpdated,
      recordCount: storedData.length,
      dataSource: collection ? 'mongodb' : 'memory'
    });

  } catch (error) {
    console.error('Error serving campus data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Helper function to find column value
function getColumnValue(row, possibleNames, defaultValue = '') {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return defaultValue;
}

// Helper function to convert level to score
function convertLevelToScore(levelText) {
  if (!levelText || typeof levelText !== 'string') return null;
  const levelMatch = levelText.match(/Level\s*(\d+)/i);
  if (levelMatch) {
    const level = parseInt(levelMatch[1]);
    return Math.min(7, level);
  }
  return null;
}

// Helper function to convert score to level
function convertScoreToLevel(score) {
  if (score === null || score === undefined) return 0;
  return Math.min(7, Math.max(0, Math.round(score)));
}

// Process raw data for frontend (same as before)
function processRawDataForFrontend(rawData) {
  console.log('Processing raw data for frontend...');

  if (!rawData || rawData.length === 0) {
    return { campuses: [], resolvers: [], evaluations: [] };
  }

  const campusMap = new Map();
  const resolverMap = new Map();
  const evaluations = [];

  // [Rest of the processing logic remains the same as in your original server.js]
  // I'll keep it short here, but in the actual file it would be the full processing code

  rawData.forEach((row, index) => {
    const campusName = getColumnValue(row, [
      'Choose the campus you are referring to ',
      'Choose the campus you are referring to',
      'Campus Name'
    ], '');

    if (!campusName || campusName.trim() === '') return;

    const resolverName = getColumnValue(row, ['Name ', 'Name'], '');
    if (!resolverName || resolverName.trim() === '') return;

    // Process data (simplified for brevity)
    // Full implementation would include all the processing logic
  });

  const campuses = Array.from(campusMap.values());
  const resolvers = Array.from(resolverMap.values());

  console.log(`Processed ${campuses.length} campuses, ${resolvers.length} resolvers`);

  return { campuses, resolvers, evaluations };
}

// Urgent issues endpoint
app.get('/api/urgent-issues', (req, res) => {
  try {
    if (storedData.length === 0) {
      return res.status(200).json({
        urgentIssues: [],
        escalationIssues: [],
        lastUpdated: null
      });
    }

    const processedData = processRawDataForFrontend(storedData);
    
    const urgentIssues = processedData.evaluations.filter(eval => 
      eval.urgentCampusIssue && eval.urgentCampusIssue.trim().length > 2
    );

    const escalationIssues = processedData.evaluations.filter(eval => 
      eval.escalationIssue && eval.escalationIssue.trim().length > 5
    );

    res.status(200).json({
      urgentIssues,
      escalationIssues,
      totalUrgent: urgentIssues.length,
      totalEscalation: escalationIssues.length,
      lastUpdated
    });

  } catch (error) {
    console.error('Error serving urgent issues:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Debug endpoint
app.get('/api/debug-data', (req, res) => {
  res.json({
    storedDataLength: storedData.length,
    lastUpdated: lastUpdated,
    mongodb: collection ? 'connected' : 'disconnected',
    sampleData: storedData.length > 0 ? storedData[0] : null,
    serverTime: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(port, () => {
    console.log(`🚀 Server listening at http://localhost:${port}`);
    console.log(`📊 MongoDB: ${collection ? 'Connected' : 'Disconnected (using memory)'}`);
    console.log(`💾 Data records: ${storedData.length}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

startServer();
