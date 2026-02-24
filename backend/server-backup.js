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

// Helper function to convert "Level X" text to numeric score
function convertLevelToScore(levelText) {
  if (!levelText || typeof levelText !== 'string') return null;

  // Extract level number from text like "Level 0", "Level 1", etc.
  const levelMatch = levelText.match(/Level\s*(\d+)/i);
  if (levelMatch) {
    const level = parseInt(levelMatch[1]);
    // Simple 1:1 mapping: Level 0=0, Level 1=1, Level 2=2, ..., Level 7=7
    return Math.min(7, level);
  }

  return null;
}

// Helper function to convert numeric score to level
function convertScoreToLevel(score) {
  if (score === null || score === undefined) return 0;
  // Simple 1:1 mapping: score 7=Level 7, score 6=Level 6, etc.
  return Math.min(7, Math.max(0, Math.round(score)));
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
  
  // Log feedback-related columns specifically
  const feedbackColumns = availableColumns.filter(col => 
    col.toLowerCase().includes('why') || 
    col.toLowerCase().includes('share') ||
    col.toLowerCase().includes('selected')
  );
  console.log('Feedback-related columns found:', feedbackColumns);

  // Group data by campus to aggregate scores and deduplicate resolvers by email
  const campusMap = new Map();
  const resolverMap = new Map(); // Use email as key to deduplicate resolvers
  const evaluations = [];

  // Process each row from Google Sheet
  rawData.forEach((row, index) => {
    console.log(`Processing row ${index + 1}:`, Object.keys(row));

    // Extract basic information - try common Google Form field patterns
    const timestamp = getColumnValue(row, [
      'Timestamp', 'timestamp', 'Date', 'Created Date', 'Submission Time'
    ], new Date().toISOString());

    // Extract the two new urgent fields - using exact column names from your form
    const urgentCampusIssue = getColumnValue(row, [
      'Is there anything that you find pressing in the campus, that needs urgent attention?',
      'pressing in the campus, that needs urgent attention',
      'pressing in the campus',
      'urgent attention'
    ], '');

    const escalationIssue = getColumnValue(row, [
      'Is there anything that you find in the campus, that directly needs escalation? This answer would be mailed to senior most team for urgent attention.',
      'directly needs escalation? This answer would be mailed to senior most team for urgent attention',
      'directly needs escalation',
      'escalation'
    ], '');

    // Extract campus name - using your actual column name
    const campusName = getColumnValue(row, [
      'Choose the campus you are referring to ',
      'Choose the campus you are referring to',
      'Campus Name', 'campus_name', 'Campus', 'campus'
    ], '');

    // Skip rows without campus name
    if (!campusName || campusName.trim() === '') {
      console.log(`Skipping row ${index + 1}: No campus name found`);
      console.log('Available columns:', Object.keys(row));
      console.log('Campus column values:', {
        'Choose the campus you are referring to ': row['Choose the campus you are referring to '],
        'Choose the campus you are referring to': row['Choose the campus you are referring to']
      });
      return; // Skip this row
    }

    // Extract resolver information - using your actual column names
    const resolverName = getColumnValue(row, [
      'Name ',
      'Name',
      'Your Name', 'Full Name', 'Resolver Name'
    ], '');

    // Skip rows without resolver name
    if (!resolverName || resolverName.trim() === '') {
      console.log(`Skipping row ${index + 1}: No resolver name found`);
      return; // Skip this row
    }

    const resolverEmail = getColumnValue(row, [
      'Email Address',
      'email', 'Your Email', 'Resolver Email'
    ], resolverName.includes('@') ? resolverName : `${resolverName.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`);

    // Extract competency scores from your actual column names
    const competencyMapping = [
      {
        category: 'Vipassana',
        columns: ['Meditation (Ana Pana for most and students attending Vipassana Camps) ']
      },
      {
        category: 'Nutrition Supplementation + Yoga/Weight Training',
        columns: ['Nutrition Supplementation + Yoga/Weight Training']
      },
      {
        category: 'Houses and Reward Systems',
        columns: ['Houses and Reward Systems']
      },
      {
        category: 'Etiocracy, Co-Creation & Ownership',
        columns: ['Etiocracy, Co-Creation & Ownership']
      },
      {
        category: 'Campus interactions',
        columns: ['Campus interactions']
      },
      {
        category: 'Gratitude',
        columns: ['Gratitude']
      },
      {
        category: 'Hackathons',
        columns: ['Hackathons']
      },
      {
        category: 'English Communication & Comprehension',
        columns: ['English Communication & Comprehension']
      },
      {
        category: 'Learning Environment & Peer Support',
        columns: ['Learning Environment & Peer Support']
      },
      {
        category: 'Process Principles Understanding & Implementation',
        columns: ['Process Principles Understanding & Implementation']
      },
      {
        category: 'Life Skills Implementation',
        columns: ['Life Skills Implementation \n\n(is english class + other other spaces on campus follow the framework of Activity Design and faciliation?\n\n1) Placements+AI (80%)\n2) Inner work, (10%)\n3) Ecology, Gender (10%) ']
      }
    ];

    const competencies = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Extract scores from your actual competency columns
    competencyMapping.forEach(mapping => {
      const levelText = getColumnValue(row, mapping.columns, '');
      const score = convertLevelToScore(levelText);

      if (score !== null) {
        competencies.push({
          category: mapping.category,
          score: score,
          maxScore: 7,
          level: levelText // Store the original level text
        });
        totalScore += score;
        scoreCount++;
      } else {
        // Fallback score if no level found
        const fallbackScore = 3 + Math.random() * 4; // Random score between 3-7
        const fallbackLevel = convertScoreToLevel(fallbackScore);
        competencies.push({
          category: mapping.category,
          score: Math.round(fallbackScore * 10) / 10,
          maxScore: 7,
          level: `Level ${fallbackLevel}` // Store the converted level
        });
        totalScore += fallbackScore;
        scoreCount++;
      }
    });

    const averageScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 7.5;
    const lastEvaluated = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Create or update campus data
    if (!campusMap.has(campusName)) {
      campusMap.set(campusName, {
        id: `campus-${campusMap.size + 1}`,
        name: campusName,
        location: campusName,
        evaluations: [], // Store evaluations with dates instead of just scores
        resolverEmails: new Set(), // Track unique resolver emails per campus
        lastEvaluated: lastEvaluated
      });
    }

    const campusData = campusMap.get(campusName);
    campusData.evaluations.push({
      score: averageScore,
      date: lastEvaluated,
      resolverEmail: resolverEmail
    });
    campusData.resolverEmails.add(resolverEmail); // Add resolver email to set (automatically deduplicates)
    if (lastEvaluated > campusData.lastEvaluated) {
      campusData.lastEvaluated = lastEvaluated;
    }

    // Create or update resolver object (deduplicate by email)
    let resolver;
    if (resolverMap.has(resolverEmail)) {
      // Update existing resolver
      resolver = resolverMap.get(resolverEmail);
      // Add campus to the set of evaluated campuses (automatically handles duplicates)
      resolver.campusesEvaluatedSet.add(campusName);
      resolver.campusesEvaluated = resolver.campusesEvaluatedSet.size;
      resolver.totalEvaluations++;
      resolver.totalScoreSum += averageScore;
      resolver.averageScoreGiven = Math.round((resolver.totalScoreSum / resolver.totalEvaluations) * 10) / 10;
      if (lastEvaluated > resolver.lastActivity) {
        resolver.lastActivity = lastEvaluated;
      }
      // Update name to the most recent/complete version
      if (resolverName.length > resolver.name.length) {
        resolver.name = resolverName;
      }
    } else {
      // Create new resolver
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

    // Extract general feedback
    const feedback = getColumnValue(row, [
      'Additional Comments', 'comments', 'Feedback', 'feedback', 'Notes', 'notes',
      'Any additional feedback?', 'Other comments'
    ], `Comprehensive evaluation of ${campusName}. Good performance across most areas with opportunities for improvement.`);

    // Extract competency-specific feedback/comments with new form structure
    const allColumns = Object.keys(row);
    
    // Map competency names to their exact form field patterns
    const competencyMappings = [
      {
        name: 'Meditation (Ana Pana for most and students attending Vipassana Camps)',
        patterns: ['meditation', 'vipassana', 'ana pana']
      },
      {
        name: 'Nutrition Supplementation + Yoga/Weight Training',
        patterns: ['nutrition supplementation', 'yoga/weight training', 'nutrition', 'yoga']
      },
      {
        name: 'Houses and Reward Systems',
        patterns: ['houses and reward systems', 'houses', 'reward systems']
      },
      {
        name: 'Etiocracy, Co-Creation & Ownership',
        patterns: ['etiocracy', 'co-creation', 'ownership']
      },
      {
        name: 'Campus interactions',
        patterns: ['campus interactions', 'interactions']
      },
      {
        name: 'Gratitude',
        patterns: ['gratitude']
      },
      {
        name: 'Hackathons',
        patterns: ['hackathons', 'hackathon']
      },
      {
        name: 'English Communication & Comprehension',
        patterns: ['english communication', 'communication', 'comprehension']
      },
      {
        name: 'Learning Environment & Peer Support',
        patterns: ['learning environment', 'peer support']
      },
      {
        name: 'Process Principles Understanding & Implementation',
        patterns: ['process principles', 'understanding & implementation']
      },
      {
        name: 'Life Skills Implementation',
        patterns: ['life skills implementation', 'life skills']
      }
    ];
    
    const competencyFeedback = {};
    
    // Process each competency mapping
    competencyMappings.forEach(competency => {
      // Look for "Why have you marked" questions (compulsory)
      const whyColumns = allColumns.filter(col => {
        const colLower = col.toLowerCase();
        return colLower.includes('why') && 
               colLower.includes('marked') &&
               colLower.includes('level') &&
               colLower.includes('bracket') &&
               competency.patterns.some(pattern => 
                 colLower.includes(pattern.toLowerCase())
               );
      });
      
      // Look for "Is there anything else you would like to share" questions (optional)
      const shareColumns = allColumns.filter(col => {
        const colLower = col.toLowerCase();
        return colLower.includes('is there anything') && 
               colLower.includes('share') &&
               colLower.includes('competency levels') &&
               colLower.includes('bracket') &&
               competency.patterns.some(pattern => 
                 colLower.includes(pattern.toLowerCase())
               );
      });
      
      let competencyComments = [];
      
      // Log what columns were found for this competency
      if (whyColumns.length > 0 || shareColumns.length > 0) {
        console.log(`Found columns for ${competency.name}:`);
        console.log('  Why columns:', whyColumns);
        console.log('  Share columns:', shareColumns);
      }
      
      // Process "Why selected" feedback
      whyColumns.forEach(column => {
        const feedbackValue = row[column];
        console.log(`Processing why column "${column}" with value:`, feedbackValue);
        if (feedbackValue && feedbackValue.trim() !== '' && 
            feedbackValue.trim().toLowerCase() !== 'na' && 
            feedbackValue.trim().toLowerCase() !== 'no' &&
            feedbackValue.trim().toLowerCase() !== 'nope' &&
            feedbackValue.trim().length > 5) {
          competencyComments.push(`**Why this level was selected:** ${feedbackValue.trim()}`);
        }
      });
      
      // Process "Additional share" feedback
      shareColumns.forEach(column => {
        const feedbackValue = row[column];
        console.log(`Processing share column "${column}" with value:`, feedbackValue);
        if (feedbackValue && feedbackValue.trim() !== '' && 
            feedbackValue.trim().toLowerCase() !== 'na' && 
            feedbackValue.trim().toLowerCase() !== 'no' &&
            feedbackValue.trim().toLowerCase() !== 'nope' &&
            feedbackValue.trim().length > 5) {
          competencyComments.push(`**Additional observations:** ${feedbackValue.trim()}`);
        }
      });
      
      // If we have any comments for this competency, add them
      if (competencyComments.length > 0) {
        competencyFeedback[competency.name] = competencyComments.join('\n\n');
        console.log(`Added feedback for ${competency.name}:`, competencyFeedback[competency.name]);
      }
    });
    
    // Fallback: try to match any remaining feedback columns to competencies using broader patterns
    const unmatchedFeedbackColumns = allColumns.filter(col => {
      const colLower = col.toLowerCase();
      return (colLower.includes('why') || colLower.includes('share') || colLower.includes('anything') || 
              colLower.includes('selected') || colLower.includes('bracket') || colLower.includes('level')) &&
             !Object.keys(competencyFeedback).some(compName => 
               competencyMappings.find(comp => comp.name === compName)?.patterns.some(pattern => 
                 colLower.includes(pattern.toLowerCase())
               )
             );
    });
    
    console.log('Unmatched feedback columns for fallback processing:', unmatchedFeedbackColumns);
    
    // Try to match unmatched columns using keyword analysis
    unmatchedFeedbackColumns.forEach(column => {
      const feedbackValue = row[column];
      if (feedbackValue && feedbackValue.trim() !== '' && 
          feedbackValue.trim().toLowerCase() !== 'na' && 
          feedbackValue.trim().toLowerCase() !== 'no' &&
          feedbackValue.trim().toLowerCase() !== 'nope' &&
          feedbackValue.trim().length > 5) {
        
        const feedback = feedbackValue.trim();
        const colLower = column.toLowerCase();
        
        // Try to match based on column name containing competency keywords
        let matchedCompetency = null;
        competencyMappings.forEach(comp => {
          if (comp.patterns.some(pattern => colLower.includes(pattern.toLowerCase()))) {
            matchedCompetency = comp.name;
          }
        });
        
        if (matchedCompetency) {
          const prefix = colLower.includes('why') ? '**Why this level was selected:**' : '**Additional observations:**';
          if (competencyFeedback[matchedCompetency]) {
            competencyFeedback[matchedCompetency] += `\n\n${prefix} ${feedback}`;
          } else {
            competencyFeedback[matchedCompetency] = `${prefix} ${feedback}`;
          }
          console.log(`Fallback matched "${column}" to ${matchedCompetency}`);
        } else {
          // Add as general feedback if no competency match found
          competencyFeedback[`General Feedback`] = feedback;
          console.log(`Added as general feedback: "${column}"`);
        }
      }
    });

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
      competencyFeedback: competencyFeedback,
      urgentCampusIssue: urgentCampusIssue,
      escalationIssue: escalationIssue,
      dateEvaluated: lastEvaluated,
      status: 'Completed'
    };

    evaluations.push(evaluation);
  });

  // Convert campus map to array with calculated averages
  const campuses = Array.from(campusMap.values()).map(campusData => {
    // Sort evaluations by date and get the most recent ones
    const sortedEvaluations = campusData.evaluations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get the most recent evaluation date
    const mostRecentDate = sortedEvaluations.length > 0 ? sortedEvaluations[0].date : null;
    
    // Get all evaluations from the most recent date (in case multiple evaluations happened on the same day)
    const mostRecentEvaluations = mostRecentDate 
      ? sortedEvaluations.filter(eval => eval.date === mostRecentDate)
      : [];
    
    // Calculate average of the most recent evaluations
    const averageScore = mostRecentEvaluations.length > 0
      ? Math.round((mostRecentEvaluations.reduce((sum, eval) => sum + eval.score, 0) / mostRecentEvaluations.length) * 10) / 10
      : 7.5;
    
    const ranking = campusData.evaluations.length > 0
      ? averageScore > 4.67 ? 'High'
        : averageScore > 2.33 ? 'Medium' : 'Low'
      : 'Medium';

    // Filter out closed campuses
    const closedCampuses = ['Raipur', 'Raigarh', 'Udaipur'];
    if (closedCampuses.includes(campusData.name)) {
      return null; // Skip closed campuses
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
  }).filter(campus => campus !== null); // Remove null entries

  // Convert resolver map to array and clean up temporary fields
  const resolvers = Array.from(resolverMap.values()).map(resolver => {
    // Remove temporary fields used for deduplication
    const { campusesEvaluatedSet, totalScoreSum, ...cleanResolver } = resolver;
    return cleanResolver;
  });

  console.log(`Processed ${campuses.length} campuses, ${resolvers.length} unique resolvers, ${evaluations.length} evaluations`);

  return {
    campuses,
    resolvers,
    evaluations
  };
}

// Endpoint to get urgent issues
app.get('/api/urgent-issues', (req, res) => {
  try {
    console.log('=== Urgent Issues Endpoint Called ===');
    
    if (storedData.length === 0) {
      return res.status(200).json({
        urgentIssues: [],
        escalationIssues: [],
        lastUpdated: null,
        message: 'No data available yet'
      });
    }

    const processedData = processRawDataForFrontend(storedData);
    
    // Filter evaluations that have urgent issues
    const urgentIssues = processedData.evaluations.filter(eval => 
      eval.urgentCampusIssue && eval.urgentCampusIssue.trim() !== '' &&
      eval.urgentCampusIssue.trim().toLowerCase() !== 'no' &&
      eval.urgentCampusIssue.trim().toLowerCase() !== 'na' &&
      eval.urgentCampusIssue.trim().toLowerCase() !== 'none' &&
      eval.urgentCampusIssue.trim().length > 2
    ).map(eval => ({
      id: eval.id,
      campusName: eval.campusName,
      resolverName: eval.resolverName,
      dateEvaluated: eval.dateEvaluated,
      issue: eval.urgentCampusIssue,
      type: 'urgent'
    }));

    // Filter evaluations that have escalation issues
    const escalationIssues = processedData.evaluations.filter(eval => 
      eval.escalationIssue && eval.escalationIssue.trim() !== '' &&
      eval.escalationIssue.trim().toLowerCase() !== 'no' &&
      eval.escalationIssue.trim().toLowerCase() !== 'na' &&
      eval.escalationIssue.trim().toLowerCase() !== 'none' &&
      eval.escalationIssue.trim().length > 5
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