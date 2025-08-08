/**
 * Navgurukul Campus Pulse - Google Apps Script Data Sync
 * 
 * This script automatically syncs your Google Sheets evaluation data 
 * with the Campus Pulse dashboard backend.
 * 
 * Setup Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project and name it "Campus Pulse Data Sync"
 * 3. Replace the default code with this code
 * 4. Run 'testPushData()' function once to test the connection
 * 5. Run 'createTrigger()' function once to set up automatic sync
 * 
 * Features:
 * - Validates data before sending
 * - Handles errors gracefully
 * - Provides detailed logging
 * - Automatic hourly sync
 */

// Backend Configuration
const CONFIG = {
  BACKEND_URL: 'https://ng-campus-pulse.onrender.com/api/import-data',
  TIMEOUT: 30000, // 30 seconds timeout
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000 // 2 seconds between retries
};

/**
 * Main function to push sheet data to backend
 * This function is called by the trigger every hour
 */
function pushDataToBackend() {
  const startTime = new Date();
  console.log(`🚀 Starting data sync at ${startTime.toISOString()}`);
  
  try {
    // Get the active spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    console.log(`📊 Processing sheet: "${sheet.getName()}" in spreadsheet: "${spreadsheet.getName()}"`);
    
    // Get all data from the sheet
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      console.log('⚠️ No data found in sheet');
      return { success: false, message: 'No data found' };
    }
    
    if (values.length === 1) {
      console.log('⚠️ Only headers found, no data rows');
      return { success: false, message: 'No data rows found' };
    }
    
    // First row contains headers
    const headers = values[0];
    const dataRows = values.slice(1);
    
    console.log(`📋 Found ${headers.length} columns and ${dataRows.length} data rows`);
    console.log(`📝 Headers: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
    
    // Validate required columns
    const requiredColumns = [
      'Choose the campus you are referring to',
      'Name',
      'Email Address'
    ];
    
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(header => header.includes(col.substring(0, 10)))
    );
    
    if (missingColumns.length > 0) {
      console.error(`❌ Missing required columns: ${missingColumns.join(', ')}`);
      return { success: false, message: `Missing columns: ${missingColumns.join(', ')}` };
    }
    
    // Convert to array of objects and validate data
    const data = [];
    let validRows = 0;
    let skippedRows = 0;
    
    dataRows.forEach((row, index) => {
      const obj = {};
      let hasRequiredData = true;
      
      headers.forEach((header, headerIndex) => {
        obj[header] = row[headerIndex] || '';
      });
      
      // Check if row has essential data
      const campusName = obj['Choose the campus you are referring to '] || obj['Choose the campus you are referring to'] || '';
      const resolverName = obj['Name '] || obj['Name'] || '';
      
      if (!campusName.trim() || !resolverName.trim()) {
        console.log(`⚠️ Skipping row ${index + 2}: Missing campus (${campusName}) or name (${resolverName})`);
        skippedRows++;
        hasRequiredData = false;
      }
      
      if (hasRequiredData) {
        data.push(obj);
        validRows++;
      }
    });
    
    console.log(`✅ Valid rows: ${validRows}, Skipped rows: ${skippedRows}`);
    
    if (data.length === 0) {
      console.log('❌ No valid data rows to send');
      return { success: false, message: 'No valid data rows found' };
    }
    
    // Send data to backend with retry logic
    const result = sendDataWithRetry(data);
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    if (result.success) {
      console.log(`🎉 Data sync completed successfully in ${duration}s`);
      console.log(`📊 Sent ${data.length} valid records to backend`);
    } else {
      console.error(`❌ Data sync failed after ${duration}s: ${result.message}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 Critical error in pushDataToBackend:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Send data to backend with retry logic
 */
function sendDataWithRetry(data, attempt = 1) {
  try {
    console.log(`📡 Sending data to backend (attempt ${attempt}/${CONFIG.MAX_RETRIES})`);
    
    const response = UrlFetchApp.fetch(CONFIG.BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(data),
      muteHttpExceptions: true // Don't throw on HTTP errors
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`📨 Backend response: ${responseCode}`);
    
    if (responseCode === 200) {
      try {
        const responseData = JSON.parse(responseText);
        console.log('✅ Backend confirmed:', responseData);
        return { success: true, data: responseData };
      } catch (parseError) {
        console.log('✅ Data sent successfully (response not JSON)');
        return { success: true, message: 'Data sent successfully' };
      }
    } else {
      throw new Error(`HTTP ${responseCode}: ${responseText}`);
    }
    
  } catch (error) {
    console.error(`❌ Attempt ${attempt} failed:`, error.toString());
    
    if (attempt < CONFIG.MAX_RETRIES) {
      console.log(`⏳ Waiting ${CONFIG.RETRY_DELAY}ms before retry...`);
      Utilities.sleep(CONFIG.RETRY_DELAY);
      return sendDataWithRetry(data, attempt + 1);
    } else {
      return { 
        success: false, 
        message: `Failed after ${CONFIG.MAX_RETRIES} attempts: ${error.toString()}` 
      };
    }
  }
}

/**
 * Test function to run manually
 * Use this to test the connection before setting up automatic sync
 */
function testPushData() {
  console.log('🧪 Running manual test of data sync...');
  const result = pushDataToBackend();
  
  if (result && result.success) {
    console.log('🎉 Test completed successfully! You can now set up automatic sync.');
  } else {
    console.error('❌ Test failed. Please check the logs and fix any issues before setting up automatic sync.');
  }
  
  return result;
}

/**
 * Set up a time-based trigger to run this function periodically
 * Run this function once to set up automatic data sync
 */
function createTrigger() {
  try {
    console.log('⚙️ Setting up automatic data sync...');
    
    // Delete existing triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    const existingTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'pushDataToBackend'
    );
    
    if (existingTriggers.length > 0) {
      console.log(`🗑️ Removing ${existingTriggers.length} existing triggers...`);
      existingTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    }
    
    // Create new trigger to run every hour
    ScriptApp.newTrigger('pushDataToBackend')
      .timeBased()
      .everyHours(1)
      .create();
    
    console.log('✅ Automatic sync trigger created successfully!');
    console.log('📅 Data will now sync every hour automatically');
    console.log('💡 You can view trigger status in the Google Apps Script dashboard');
    
    return { success: true, message: 'Trigger created successfully' };
    
  } catch (error) {
    console.error('❌ Failed to create trigger:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Remove all triggers (useful for debugging or stopping automatic sync)
 */
function removeTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const campusPulseTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'pushDataToBackend'
    );
    
    if (campusPulseTriggers.length === 0) {
      console.log('ℹ️ No Campus Pulse triggers found');
      return { success: true, message: 'No triggers to remove' };
    }
    
    console.log(`🗑️ Removing ${campusPulseTriggers.length} Campus Pulse triggers...`);
    campusPulseTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    console.log('✅ All Campus Pulse triggers removed successfully');
    return { success: true, message: 'Triggers removed successfully' };
    
  } catch (error) {
    console.error('❌ Failed to remove triggers:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get status of current triggers
 */
function getTriggerStatus() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const campusPulseTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'pushDataToBackend'
    );
    
    console.log(`📊 Found ${campusPulseTriggers.length} Campus Pulse triggers`);
    
    campusPulseTriggers.forEach((trigger, index) => {
      const eventType = trigger.getEventType();
      console.log(`Trigger ${index + 1}: ${eventType} - ${trigger.getHandlerFunction()}`);
    });
    
    return {
      success: true,
      triggerCount: campusPulseTriggers.length,
      triggers: campusPulseTriggers.map(t => ({
        function: t.getHandlerFunction(),
        eventType: t.getEventType().toString()
      }))
    };
    
  } catch (error) {
    console.error('❌ Failed to get trigger status:', error);
    return { success: false, message: error.toString() };
  }
}