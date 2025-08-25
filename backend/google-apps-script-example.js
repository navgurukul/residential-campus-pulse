/**
 * Navgurukul Campus Pulse - Production Data Synchronization System
 * 
 * This production-ready script automatically synchronizes your Google Sheets 
 * evaluation data with the Campus Pulse dashboard in real-time.
 * 
 * Production Setup:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project: "Campus Pulse Production Sync"
 * 3. Deploy this code to your Google Apps Script project
 * 4. Run 'syncDataNow()' to perform initial data synchronization
 * 5. Run 'enableAutoSync()' to activate automatic hourly synchronization
 * 
 * Production Features:
 * ✅ Real-time data validation and error handling
 * ✅ Automatic retry mechanism for network failures
 * ✅ Comprehensive logging and monitoring
 * ✅ Production-grade security and reliability
 * ✅ Hourly automatic synchronization
 * ✅ Manual sync capabilities for immediate updates
 * 
 * Available Functions:
 * - syncDataNow() - Immediate data synchronization
 * - enableAutoSync() - Enable automatic hourly sync
 * - disableAutoSync() - Disable automatic sync
 * - checkSyncStatus() - Monitor sync configuration
 */

// Backend Configuration
const CONFIG = {
  BACKEND_URL: 'https://ng-campus-pulse.onrender.com/api/import-data',
  TIMEOUT: 30000, // 30 seconds timeout
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds between retries
  EMAIL_RECIPIENT: 'surajsahani@navgurukul.org' // Email for urgent notifications
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
    
    // Check for new urgent fields and send emails if needed
    checkAndSendUrgentEmails(headers, dataRows);
    
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
 * Manual data sync - Run this to immediately sync your data
 * Use this for on-demand data synchronization
 */
function syncDataNow() {
  console.log('🔄 Initiating manual data synchronization...');
  const result = pushDataToBackend();
  
  if (result && result.success) {
    console.log('✅ Data synchronization completed successfully!');
    console.log('📊 Your dashboard has been updated with the latest data.');
  } else {
    console.error('❌ Data synchronization failed. Please check the logs for details.');
  }
  
  return result;
}

/**
 * Enable automatic data synchronization
 * Sets up hourly sync to keep your dashboard updated automatically
 */
function enableAutoSync() {
  try {
    console.log('🚀 Enabling automatic data synchronization...');
    
    // Delete existing triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    const existingTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'pushDataToBackend'
    );
    
    if (existingTriggers.length > 0) {
      console.log(`� Updating  existing sync configuration...`);
      existingTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    }
    
    // Create new trigger to run every hour
    ScriptApp.newTrigger('pushDataToBackend')
      .timeBased()
      .everyHours(1)
      .create();
    
    console.log('✅ Automatic synchronization enabled successfully!');
    console.log('⏰ Your data will now sync every hour automatically');
    console.log('� YDashboard will stay updated with latest evaluation data');
    console.log('💡 Monitor sync status in Google Apps Script triggers section');
    
    return { success: true, message: 'Auto-sync enabled successfully' };
    
  } catch (error) {
    console.error('❌ Failed to enable automatic sync:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Disable automatic data synchronization
 * Stops automatic hourly sync (manual sync will still work)
 */
function disableAutoSync() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const campusPulseTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'pushDataToBackend'
    );
    
    if (campusPulseTriggers.length === 0) {
      console.log('ℹ️ Automatic sync is already disabled');
      return { success: true, message: 'Auto-sync already disabled' };
    }
    
    console.log(`⏹️ Disabling automatic synchronization...`);
    campusPulseTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    console.log('✅ Automatic synchronization disabled successfully');
    console.log('💡 You can still sync manually using syncDataNow() function');
    return { success: true, message: 'Auto-sync disabled successfully' };
    
  } catch (error) {
    console.error('❌ Failed to disable automatic sync:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Check synchronization status
 * Shows current auto-sync configuration and last sync details
 */
function checkSyncStatus() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const campusPulseTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'pushDataToBackend'
    );
    
    console.log('📊 Campus Pulse Synchronization Status');
    console.log('=====================================');
    
    if (campusPulseTriggers.length > 0) {
      console.log('✅ Automatic sync: ENABLED');
      console.log('⏰ Sync frequency: Every hour');
      console.log(`🔄 Active triggers: ${campusPulseTriggers.length}`);
      
      campusPulseTriggers.forEach((trigger, index) => {
        const eventType = trigger.getEventType();
        console.log(`   Trigger ${index + 1}: ${eventType}`);
      });
    } else {
      console.log('⏹️ Automatic sync: DISABLED');
      console.log('💡 Run enableAutoSync() to enable automatic hourly sync');
    }
    
    console.log('📱 Manual sync: Available via syncDataNow() function');
    console.log('🌐 Backend URL: ' + CONFIG.BACKEND_URL);
    
    return {
      success: true,
      autoSyncEnabled: campusPulseTriggers.length > 0,
      triggerCount: campusPulseTriggers.length,
      backendUrl: CONFIG.BACKEND_URL,
      triggers: campusPulseTriggers.map(t => ({
        function: t.getHandlerFunction(),
        eventType: t.getEventType().toString()
      }))
    };
    
  } catch (error) {
    console.error('❌ Failed to check sync status:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Check for urgent fields and send email notifications
 * Sends emails when the last two form fields are filled
 */
function checkAndSendUrgentEmails(headers, dataRows) {
  try {
    console.log('🔍 Checking for urgent email notifications...');
    
    // Define the two urgent fields from your form
    const urgentFields = [
      'Is there anything that you find pressing in the campus, that needs urgent attention?',
      'Is there anything that you find in the campus, that directly needs escalation? This answer would be mailed to senior most team for urgent attention.'
    ];
    
    // Find column indices for urgent fields
    const urgentFieldIndices = urgentFields.map(field => {
      const index = headers.findIndex(header => 
        header.includes('pressing in the campus') || 
        header.includes('directly needs escalation')
      );
      return { field, index };
    }).filter(item => item.index !== -1);
    
    if (urgentFieldIndices.length === 0) {
      console.log('⚠️ No urgent fields found in form headers');
      return;
    }
    
    console.log(`📋 Found ${urgentFieldIndices.length} urgent fields`);
    
    // Check the last 2 form submissions for urgent content
    const recentRows = dataRows.slice(-2); // Get last 2 submissions
    
    recentRows.forEach((row, rowIndex) => {
      const actualRowNumber = dataRows.length - recentRows.length + rowIndex + 1;
      console.log(`📝 Checking row ${actualRowNumber} for urgent content...`);
      
      // Extract basic info
      const campusName = row[headers.findIndex(h => h.includes('Choose the campus'))] || 'Unknown Campus';
      const resolverName = row[headers.findIndex(h => h.includes('Name'))] || 'Unknown Resolver';
      const timestamp = row[0] || new Date().toISOString(); // Assuming first column is timestamp
      
      // Check each urgent field
      urgentFieldIndices.forEach(({ field, index }) => {
        const urgentContent = row[index];
        
        if (urgentContent && urgentContent.trim() !== '' && 
            urgentContent.trim().toLowerCase() !== 'no' &&
            urgentContent.trim().toLowerCase() !== 'na' &&
            urgentContent.trim().toLowerCase() !== 'none' &&
            urgentContent.trim().length > 5) {
          
          console.log(`🚨 Urgent content found in "${field}": ${urgentContent.substring(0, 50)}...`);
          
          // Send email notification
          sendUrgentNotificationEmail({
            campusName,
            resolverName,
            timestamp,
            field,
            content: urgentContent,
            rowNumber: actualRowNumber
          });
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking urgent emails:', error);
  }
}

/**
 * Send urgent notification email to senior team
 */
function sendUrgentNotificationEmail(data) {
  try {
    console.log(`📧 Sending urgent notification email for ${data.campusName}...`);
    
    const subject = `🚨 URGENT: Campus Issue Reported - ${data.campusName}`;
    
    const emailBody = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 24px;">🚨 URGENT CAMPUS ALERT</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Immediate attention required</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #2c3e50; margin-top: 0;">📍 Campus Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Campus:</td>
          <td style="padding: 8px 0;">${data.campusName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Reported by:</td>
          <td style="padding: 8px 0;">${data.resolverName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Timestamp:</td>
          <td style="padding: 8px 0;">${new Date(data.timestamp).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Form Row:</td>
          <td style="padding: 8px 0;">#${data.rowNumber}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #856404; margin-top: 0;">⚠️ Issue Category</h3>
      <p style="margin: 0; font-style: italic;">${data.field}</p>
    </div>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #721c24; margin-top: 0;">📝 Detailed Report</h3>
      <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
        <p style="margin: 0; white-space: pre-wrap;">${data.content}</p>
      </div>
    </div>
    
    <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #0c5460; margin-top: 0;">🎯 Recommended Actions</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Review the reported issue immediately</li>
        <li>Contact the campus resolver for additional details</li>
        <li>Coordinate with local campus management</li>
        <li>Document resolution steps in Campus Pulse system</li>
      </ul>
    </div>
    
    <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 8px;">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        This is an automated notification from the NavGurukul Campus Pulse System<br>
        Generated on ${new Date().toLocaleString()}
      </p>
    </div>
    
  </div>
</body>
</html>`;

    // Send the email
    GmailApp.sendEmail(
      CONFIG.EMAIL_RECIPIENT,
      subject,
      '', // Plain text version (empty since we're using HTML)
      {
        htmlBody: emailBody,
        name: 'NavGurukul Campus Pulse System'
      }
    );
    
    console.log(`✅ Urgent notification email sent successfully to ${CONFIG.EMAIL_RECIPIENT}`);
    
  } catch (error) {
    console.error('❌ Failed to send urgent notification email:', error);
  }
}