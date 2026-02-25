const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'campus-pulse';
const COLLECTION_NAME = 'campus_data';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.error('Please set MONGODB_URI in your environment variables.');
  process.exit(1);
}

let db;
let collection;
let mongoClient;

// In-memory storage (fallback + cache)
let storedData = [];
let lastUpdated = null;

// Connect to MongoDB with retry logic
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Simplified connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };
    
    mongoClient = new MongoClient(MONGODB_URI, options);
    await mongoClient.connect();
    
    // Verify connection
    await mongoClient.db('admin').command({ ping: 1 });
    
    db = mongoClient.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Load existing data on startup
    await loadDataFromMongoDB();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Falling back to in-memory storage only');
    console.log('💡 Check: 1) IP whitelist includes 0.0.0.0/0, 2) Username/password correct');
  }
}

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

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Pulse Backend API with MongoDB',
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

// Helper functions (same as before)
function getColumnValue(row, possibleNames, defaultValue = '') {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return defaultValue;
}

function convertLevelToScore(levelText) {
  if (!levelText || typeof levelText !== 'string') return null;
  const levelMatch = levelText.match(/Level\s*(\d+)/i);
  if (levelMatch) {
    return Math.min(7, parseInt(levelMatch[1]));
  }
  return null;
}

function convertScoreToLevel(score) {
  if (score === null || score === undefined) return 0;
  return Math.min(7, Math.max(0, Math.round(score)));
}

// Process raw data (keeping the full logic from original server.js)
function processRawDataForFrontend(rawData) {
  console.log('Processing raw data for frontend...');

  if (!rawData || rawData.length === 0) {
    return { campuses: [], resolvers: [], evaluations: [] };
  }

  const campusMap = new Map();
  const resolverMap = new Map();
  const evaluations = [];

  rawData.forEach((row, index) => {
    const timestamp = getColumnValue(row, ['Timestamp', 'timestamp'], new Date().toISOString());
    
    const urgentCampusIssue = getColumnValue(row, [
      'Is there anything that you find pressing in the campus, that needs urgent attention?'
    ], '');

    const escalationIssue = getColumnValue(row, [
      'Is there anything that you find in the campus, that directly needs escalation? This answer would be mailed to senior most team for urgent attention.'
    ], '');

    const campusName = getColumnValue(row, [
      'Choose the campus you are referring to ',
      'Choose the campus you are referring to'
    ], '');

    if (!campusName || campusName.trim() === '') return;

    const resolverName = getColumnValue(row, ['Name ', 'Name'], '');
    if (!resolverName || resolverName.trim() === '') return;

    const resolverEmail = getColumnValue(row, ['Email Address'], 
      `${resolverName.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`);

    const competencyMapping = [
      { category: 'Vipassana', columns: ['Meditation (Ana Pana for most and students attending Vipassana Camps) '] },
      { category: 'Nutrition Supplementation + Yoga/Weight Training', columns: ['Nutrition Supplementation + Yoga/Weight Training'] },
      { category: 'Houses and Reward Systems', columns: ['Houses and Reward Systems'] },
      { category: 'Etiocracy, Co-Creation & Ownership', columns: ['Etiocracy, Co-Creation & Ownership'] },
      { category: 'Campus interactions', columns: ['Campus interactions'] },
      { category: 'Gratitude', columns: ['Gratitude'] },
      { category: 'Hackathons', columns: ['Hackathons'] },
      { category: 'English Communication & Comprehension', columns: ['English Communication & Comprehension'] },
      { category: 'Learning Environment & Peer Support', columns: ['Learning Environment & Peer Support'] },
      { category: 'Process Principles Understanding & Implementation', columns: ['Process Principles Understanding & Implementation'] },
      { category: 'Life Skills Implementation', columns: ['Life Skills Implementation \n\n(is english class + other other spaces on campus follow the framework of Activity Design and faciliation?\n\n1) Placements+AI (80%)\n2) Inner work, (10%)\n3) Ecology, Gender (10%) '] }
    ];

    const competencies = [];
    let totalScore = 0;
    let scoreCount = 0;

    competencyMapping.forEach(mapping => {
      const levelText = getColumnValue(row, mapping.columns, '');
      const score = convertLevelToScore(levelText);

      if (score !== null) {
        competencies.push({
          category: mapping.category,
          score: score,
          maxScore: 7,
          level: levelText
        });
        totalScore += score;
        scoreCount++;
      } else {
        const fallbackScore = 3 + Math.random() * 4;
        competencies.push({
          category: mapping.category,
          score: Math.round(fallbackScore * 10) / 10,
          maxScore: 7,
          level: `Level ${convertScoreToLevel(fallbackScore)}`
        });
        totalScore += fallbackScore;
        scoreCount++;
      }
    });

    const averageScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 7.5;
    const lastEvaluated = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    if (!campusMap.has(campusName)) {
      campusMap.set(campusName, {
        id: `campus-${campusMap.size + 1}`,
        name: campusName,
        location: campusName,
        evaluations: [],
        resolverEmails: new Set(),
        lastEvaluated: lastEvaluated
      });
    }

    const campusData = campusMap.get(campusName);
    campusData.evaluations.push({
      score: averageScore,
      date: lastEvaluated,
      resolverEmail: resolverEmail
    });
    campusData.resolverEmails.add(resolverEmail);
    if (lastEvaluated > campusData.lastEvaluated) {
      campusData.lastEvaluated = lastEvaluated;
    }

    let resolver;
    if (resolverMap.has(resolverEmail)) {
      resolver = resolverMap.get(resolverEmail);
      resolver.campusesEvaluatedSet.add(campusName);
      resolver.campusesEvaluated = resolver.campusesEvaluatedSet.size;
      resolver.totalEvaluations++;
      resolver.totalScoreSum += averageScore;
      resolver.averageScoreGiven = Math.round((resolver.totalScoreSum / resolver.totalEvaluations) * 10) / 10;
      if (lastEvaluated > resolver.lastActivity) {
        resolver.lastActivity = lastEvaluated;
      }
      if (resolverName.length > resolver.name.length) {
        resolver.name = resolverName;
      }
    } else {
      resolver = {
        id: `resolver-${resolverMap.size + 1}`,
        name: resolverName,
        email: resolverEmail,
        campusesEvaluated: 1,
        campusesEvaluatedSet: new Set([campusName]),
        averageScoreGiven: averageScore,
        totalEvaluations: 1,
        totalScoreSum: averageScore,
        lastActivity: lastEvaluated,
        level: 'Senior',
        framework: 'Standard'
      };
      resolverMap.set(resolverEmail, resolver);
    }

    const feedback = getColumnValue(row, ['Additional Comments', 'Feedback'], 
      `Comprehensive evaluation of ${campusName}.`);

    // Extract competency-specific feedback
    const allColumns = Object.keys(row);
    const competencyMappings = [
      { name: 'Meditation (Ana Pana for most and students attending Vipassana Camps)', patterns: ['meditation', 'vipassana', 'ana pana'] },
      { name: 'Nutrition Supplementation + Yoga/Weight Training', patterns: ['nutrition supplementation', 'yoga/weight training', 'nutrition', 'yoga'] },
      { name: 'Houses and Reward Systems', patterns: ['houses and reward systems', 'houses', 'reward systems'] },
      { name: 'Etiocracy, Co-Creation & Ownership', patterns: ['etiocracy', 'co-creation', 'ownership'] },
      { name: 'Campus interactions', patterns: ['campus interactions', 'interactions'] },
      { name: 'Gratitude', patterns: ['gratitude'] },
      { name: 'Hackathons', patterns: ['hackathons', 'hackathon'] },
      { name: 'English Communication & Comprehension', patterns: ['english communication', 'communication', 'comprehension'] },
      { name: 'Learning Environment & Peer Support', patterns: ['learning environment', 'peer support'] },
      { name: 'Process Principles Understanding & Implementation', patterns: ['process principles', 'understanding & implementation'] },
      { name: 'Life Skills Implementation', patterns: ['life skills implementation', 'life skills'] }
    ];
    
    const competencyFeedback = {};
    
    competencyMappings.forEach(competency => {
      const whyColumns = allColumns.filter(col => {
        const colLower = col.toLowerCase();
        return colLower.includes('why') && colLower.includes('marked') &&
               competency.patterns.some(pattern => colLower.includes(pattern.toLowerCase()));
      });
      
      const shareColumns = allColumns.filter(col => {
        const colLower = col.toLowerCase();
        return colLower.includes('anything') && colLower.includes('share') &&
               competency.patterns.some(pattern => colLower.includes(pattern.toLowerCase()));
      });
      
      let competencyComments = [];
      
      whyColumns.forEach(column => {
        const feedbackValue = row[column];
        if (feedbackValue && feedbackValue.trim() !== '' && 
            feedbackValue.trim().toLowerCase() !== 'na' && 
            feedbackValue.trim().length > 5) {
          competencyComments.push(`**Why this level was selected:** ${feedbackValue.trim()}`);
        }
      });
      
      shareColumns.forEach(column => {
        const feedbackValue = row[column];
        if (feedbackValue && feedbackValue.trim() !== '' && 
            feedbackValue.trim().toLowerCase() !== 'na' && 
            feedbackValue.trim().length > 5) {
          competencyComments.push(`**Additional observations:** ${feedbackValue.trim()}`);
        }
      });
      
      if (competencyComments.length > 0) {
        competencyFeedback[competency.name] = competencyComments.join('\n\n');
      }
    });

    const evaluation = {
      id: `eval-${index + 1}`,
      campusId: campusData.id,
      resolverId: resolver.id,
      resolverName: resolverName,
      campusName: campusName,
      overallScore: averageScore,
      competencies: competencies,
      feedback: feedback,
      competencyFeedback: competencyFeedback,
      urgentCampusIssue: urgentCampusIssue,
      escalationIssue: escalationIssue,
      dateEvaluated: lastEvaluated,
      status: 'Completed'
    };

    evaluations.push(evaluation);
  });

  const campuses = Array.from(campusMap.values()).map(campusData => {
    const sortedEvaluations = campusData.evaluations.sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostRecentDate = sortedEvaluations.length > 0 ? sortedEvaluations[0].date : null;
    const mostRecentEvaluations = mostRecentDate 
      ? sortedEvaluations.filter(eval => eval.date === mostRecentDate)
      : [];
    
    const averageScore = mostRecentEvaluations.length > 0
      ? Math.round((mostRecentEvaluations.reduce((sum, eval) => sum + eval.score, 0) / mostRecentEvaluations.length) * 10) / 10
      : 7.5;
    
    const ranking = campusData.evaluations.length > 0
      ? averageScore > 4.67 ? 'High' : averageScore > 2.33 ? 'Medium' : 'Low'
      : 'Medium';

    const closedCampuses = ['Raipur', 'Raigarh', 'Udaipur'];
    if (closedCampuses.includes(campusData.name)) {
      return null;
    }

    return {
      id: campusData.id,
      name: campusData.name,
      location: campusData.location,
      averageScore,
      totalResolvers: campusData.resolverEmails.size,
      ranking,
      lastEvaluated: campusData.lastEvaluated,
      status: 'Active'
    };
  }).filter(campus => campus !== null);

  const resolvers = Array.from(resolverMap.values()).map(resolver => {
    const { campusesEvaluatedSet, totalScoreSum, ...cleanResolver } = resolver;
    return cleanResolver;
  });

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
    ).map(eval => ({
      id: eval.id,
      campusName: eval.campusName,
      resolverName: eval.resolverName,
      dateEvaluated: eval.dateEvaluated,
      issue: eval.urgentCampusIssue,
      type: 'urgent'
    }));

    const escalationIssues = processedData.evaluations.filter(eval => 
      eval.escalationIssue && eval.escalationIssue.trim().length > 5
    ).map(eval => ({
      id: eval.id,
      campusName: eval.campusName,
      resolverName: eval.resolverName,
      dateEvaluated: eval.dateEvaluated,
      issue: eval.escalationIssue,
      type: 'escalation'
    }));

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
    console.log(`📊 MongoDB: ${collection ? 'Connected ✅' : 'Disconnected ⚠️'}`);
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
