/**
 * DEBUG VERSION - Google Apps Script for Campus Pulse
 * This version helps identify column headers and debug urgent field processing
 */

// Backend Configuration
const CONFIG = {
  BACKEND_URL: 'https://ng-campus-pulse.onrender.com/api/import-data',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  EMAIL_RECIPIENT: 'surajsahani@navgurukul.org'
};

/**
 * DEBUG FUNCTION - Run this to see your exact column headers and data
 */
function debugFormStructure() {
  try {
    console.log('🔍 DEBUGGING FORM STRUCTURE...');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      console.log('❌ No data found in sheet');
      return;
    }
    
    // Get headers (first row)
    const headers = values[0];
    console.log('📋 TOTAL COLUMNS FOUND:', headers.length);
    console.log('📝 ALL COLUMN HEADERS:');
    
    headers.forEach((header, index) => {
      console.log(`Column ${index + 1}: "${header}"`);
    });
    
    // Check for urgent field patterns
    console.log('\n🚨 SEARCHING FOR URGENT FIELDS:');
    
    const urgentPatterns = [
      'pressing in the campus',
      'urgent attention',
      'directly needs escalation',
      'escalation',
      'mailed to senior'
    ];
    
    urgentPatterns.forEach(pattern => {
      const foundColumns = headers.filter((header, index) => {
        const match = header.toLowerCase().includes(pattern.toLowerCase());
        if (match) {
          console.log(`✅ Found "${pattern}" in column ${index + 1}: "${header}"`);
        }
        return match;
      });
      
      if (foundColumns.length === 0) {
        console.log(`❌ Pattern "${pattern}" not found in any column`);
      }
    });
    
    // Show last row data (most recent submission)
    if (values.length > 1) {
      const lastRow = values[values.length - 1];
      console.log('\n📊 LAST ROW DATA:');
      lastRow.forEach((value, index) => {
        if (value && value.toString().trim() !== '') {
          console.log(`Column ${index + 1} (${headers[index]}): "${value}"`);
        }
      });
    }
    
    return {
      totalColumns: headers.length,
      headers: headers,
      totalRows: values.length - 1,
      lastRowData: values.length > 1 ? values[values.length - 1] : null
    };
    
  } catch (error) {
    console.error('💥 Debug error:', error);
    return { error: error.toString() };
  }
}

/**
 * ENHANCED URGENT EMAIL CHECKER - More flexible pattern matching
 */
function checkAndSendUrgentEmails(headers, dataRows) {
  try {
    console.log('🔍 ENHANCED URGENT EMAIL CHECKING...');
    
    // More flexible patterns to find urgent fields
    const urgentFieldPatterns = [
      {
        name: 'Urgent Campus Issue',
        patterns: ['pressing', 'urgent', 'attention', 'campus.*urgent', 'urgent.*campus']
      },
      {
        name: 'Escalation Issue', 
        patterns: ['escalation', 'escalate', 'mailed.*senior', 'senior.*team', 'directly.*needs']
      }
    ];
    
    // Find columns that match urgent patterns
    const urgentColumns = [];
    
    urgentFieldPatterns.forEach(fieldType => {
      fieldType.patterns.forEach(pattern => {
        headers.forEach((header, index) => {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(header)) {
            urgentColumns.push({
              index: index,
              header: header,
              type: fieldType.name,
              pattern: pattern
            });
            console.log(`✅ Found ${fieldType.name} at column ${index + 1}: "${header}"`);
          }
        });
      });
    });
    
    if (urgentColumns.length === 0) {
      console.log('⚠️ No urgent field columns found with flexible patterns');
      return;
    }
    
    console.log(`📋 Found ${urgentColumns.length} urgent field columns`);
    
    // Check the last 2 form submissions
    const recentRows = dataRows.slice(-2);
    
    recentRows.forEach((row, rowIndex) => {
      const actualRowNumber = dataRows.length - recentRows.length + rowIndex + 1;
      console.log(`📝 Checking row ${actualRowNumber} for urgent content...`);
      
      // Extract basic info
      const campusName = row[headers.findIndex(h => h.toLowerCase().includes('campus'))] || 'Unknown Campus';
      const resolverName = row[headers.findIndex(h => h.toLowerCase().includes('name'))] || 'Unknown Resolver';
      const timestamp = row[0] || new Date().toISOString();
      
      console.log(`Campus: ${campusName}, Resolver: ${resolverName}`);
      
      // Check each urgent column
      urgentColumns.forEach(urgentCol => {
        const urgentContent = row[urgentCol.index];
        console.log(`Checking ${urgentCol.type} (Column ${urgentCol.index + 1}): "${urgentContent}"`);
        
        // More lenient filtering - allow "test" for debugging
        if (urgentContent && urgentContent.toString().trim() !== '' && 
            urgentContent.toString().trim().toLowerCase() !== 'no' &&
            urgentContent.toString().trim().toLowerCase() !== 'na' &&
            urgentContent.toString().trim().toLowerCase() !== 'none' &&
            urgentContent.toString().trim().length > 2) { // Allow "test" (length > 2)
          
          console.log(`🚨 Urgent content found: "${urgentContent}"`);
          
          // Send email notification
          sendUrgentNotificationEmail({
            campusName,
            resolverName,
            timestamp,
            field: urgentCol.header,
            content: urgentContent.toString(),
            rowNumber: actualRowNumber,
            type: urgentCol.type
          });
        } else {
          console.log(`⏭️ Skipping content: "${urgentContent}" (too short or filtered)`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error in enhanced urgent email checking:', error);
  }
}

/**
 * Enhanced email sending function
 */
function sendUrgentNotificationEmail(data) {
  try {
    console.log(`📧 Sending urgent notification email for ${data.campusName}...`);
    console.log(`Email data:`, JSON.stringify(data, null, 2));
    
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
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Issue Type:</td>
          <td style="padding: 8px 0;">${data.type}</td>
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

/**
 * Enhanced main sync function with better debugging
 */
function debugSyncDataNow() {
  console.log('🔄 STARTING DEBUG SYNC...');
  
  try {
    // First, debug the structure
    const debugInfo = debugFormStructure();
    
    if (debugInfo.error) {
      console.error('❌ Debug failed:', debugInfo.error);
      return { success: false, message: debugInfo.error };
    }
    
    // Get the data
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      console.log('⚠️ No data rows found');
      return { success: false, message: 'No data rows found' };
    }
    
    const headers = values[0];
    const dataRows = values.slice(1);
    
    console.log(`📊 Processing ${dataRows.length} data rows...`);
    
    // Check for urgent emails with enhanced logic
    checkAndSendUrgentEmails(headers, dataRows);
    
    // Continue with normal sync...
    console.log('📡 Sending data to backend...');
    
    // Convert to objects
    const data = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    // Send to backend
    const response = UrlFetchApp.fetch(CONFIG.BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(data),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    console.log(`📨 Backend response: ${responseCode}`);
    
    if (responseCode === 200) {
      console.log('✅ Debug sync completed successfully!');
      return { success: true, message: 'Debug sync completed' };
    } else {
      console.error(`❌ Backend error: ${response.getContentText()}`);
      return { success: false, message: `Backend error: ${responseCode}` };
    }
    
  } catch (error) {
    console.error('💥 Debug sync error:', error);
    return { success: false, message: error.toString() };
  }
}