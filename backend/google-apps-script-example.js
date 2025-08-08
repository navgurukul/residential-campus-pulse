/**
 * Google Apps Script code to push sheet data to your backend
 * 
 * Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project
 * 3. Replace the default code with this code
 * 4. Update the BACKEND_URL to your deployed backend URL
 * 5. Set up a trigger to run this function periodically
 */

// Update this URL to your deployed backend URL
// const BACKEND_URL = 'http://localhost:3001/api/import-data'; // For local testing
const BACKEND_URL = 'https://ng-campus-pulse.onrender.com/api/import-data'; // For production

function pushDataToBackend() {
  try {
    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Get all data from the sheet
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      console.log('No data found in sheet');
      return;
    }
    
    // First row contains headers
    const headers = values[0];
    const dataRows = values.slice(1);
    
    // Convert to array of objects
    const data = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    console.log(`Preparing to send ${data.length} rows to backend`);
    
    // Send data to backend
    const response = UrlFetchApp.fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(data)
    });
    
    const responseText = response.getContentText();
    const responseData = JSON.parse(responseText);
    
    console.log('Backend response:', responseData);
    
    if (response.getResponseCode() === 200) {
      console.log('✅ Data successfully sent to backend');
    } else {
      console.log('❌ Error sending data to backend:', response.getResponseCode());
    }
    
  } catch (error) {
    console.error('Error in pushDataToBackend:', error);
  }
}

/**
 * Test function to run manually
 */
function testPushData() {
  pushDataToBackend();
}

/**
 * Set up a time-based trigger to run this function periodically
 * Run this function once to set up automatic data sync
 */
function createTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new trigger to run every hour
  ScriptApp.newTrigger('pushDataToBackend')
    .timeBased()
    .everyHours(1)
    .create();
    
  console.log('Trigger created to run every hour');
}