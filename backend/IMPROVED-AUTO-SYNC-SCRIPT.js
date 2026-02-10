/**
 * IMPROVED AUTO-SYNC VERSION - Google Apps Script for Campus Pulse
 * This version uses onFormSubmit for instant automatic syncing
 * 
 * 🚀 SETUP INSTRUCTIONS:
 * 1. Copy this entire script to your Google Apps Script
 * 2. Set up Form Submit Trigger (see AUTO_TRIGGER_SETUP.md)
 * 3. Test by submitting a form
 * 
 * 📧 Email Recipients: surajsahani@navgurukul.org, priyanka@navgurukul.org
 */

// Backend Configuration
const CONFIG = {
    BACKEND_URL: 'https://ng-campus-pulse.onrender.com/api/import-data',
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    EMAIL_RECIPIENTS: ['surajsahani@navgurukul.org', 'priyanka@navgurukul.org']
};

/**
 * 🎯 PRIMARY FUNCTION: Automatically runs when form is submitted
 * This is triggered by the "On form submit" trigger
 */
function onFormSubmit(e) {
    try {
        console.log('📝 Form submitted! Auto-sync starting...');
        const startTime = new Date();
        
        const sheet = e.range.getSheet();
        const row = e.range.getRow();
        
        // Get the new submission data
        const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        console.log(`📍 New submission in row ${row}`);
        
        // Check for urgent issues FIRST (immediate email)
        console.log('🔍 Checking for urgent issues...');
        checkFormSubmissionForUrgentIssues(headers, rowData);
        
        // Then sync all data to backend
        console.log('📡 Syncing all data to backend...');
        const result = pushDataToBackend();
        
        const duration = (new Date() - startTime) / 1000;
        
        if (result && result.success) {
            console.log(`✅ Auto-sync completed successfully in ${duration}s`);
        } else {
            console.error(`❌ Auto-sync failed after ${duration}s`);
        }
        
    } catch (error) {
        console.error('❌ Error in onFormSubmit:', error);
        // Don't throw - we don't want to break the form submission
    }
}

/**
 * BACKUP: Runs on any edit (use only if onFormSubmit doesn't work)
 */
function onEdit(e) {
    try {
        const range = e.range;
        const sheet = range.getSheet();
        
        // Only process if this is a new row (form submission)
        if (range.getRow() > 1 && range.getColumn() === 1) {
            console.log('📝 New row detected via onEdit - processing...');
            
            const rowData = sheet.getRange(range.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
            
            checkFormSubmissionForUrgentIssues(headers, rowData);
            pushDataToBackend();
        }
    } catch (error) {
        console.error('❌ Error in onEdit:', error);
    }
}

/**
 * Main function to push sheet data to backend
 */
function pushDataToBackend() {
    const startTime = new Date();
    console.log(`🚀 Starting data sync at ${startTime.toISOString()}`);

    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getActiveSheet();

        console.log(`📊 Processing sheet: "${sheet.getName()}"`);

        const range = sheet.getDataRange();
        const values = range.getValues();

        if (values.length <= 1) {
            console.log('⚠️ No data rows found');
            return { success: false, message: 'No data rows found' };
        }

        const headers = values[0];
        const dataRows = values.slice(1);

        console.log(`📋 Found ${headers.length} columns and ${dataRows.length} data rows`);

        // Convert to array of objects
        const data = [];
        let validRows = 0;

        dataRows.forEach((row, index) => {
            const obj = {};
            headers.forEach((header, headerIndex) => {
                obj[header] = row[headerIndex] || '';
            });

            const campusName = obj['Choose the campus you are referring to '] || obj['Choose the campus you are referring to'] || '';
            const resolverName = obj['Name '] || obj['Name'] || '';

            if (campusName.trim() && resolverName.trim()) {
                data.push(obj);
                validRows++;
            }
        });

        console.log(`✅ Valid rows: ${validRows}`);

        if (data.length === 0) {
            return { success: false, message: 'No valid data rows found' };
        }

        // Send data to backend
        const result = sendDataWithRetry(data);

        const duration = (new Date() - startTime) / 1000;
        console.log(`📊 Sync completed in ${duration}s`);

        return result;

    } catch (error) {
        console.error('💥 Critical error:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Check form submission for urgent content and send emails
 */
function checkFormSubmissionForUrgentIssues(headers, submissionValues) {
    try {
        console.log('🚨 Checking for urgent issues...');

        // Find urgent field columns
        const urgentFieldColumn = headers.findIndex(header =>
            header.includes('Is there anything that you find pressing in the campus, that needs urgent attention?')
        );

        const escalationFieldColumn = headers.findIndex(header =>
            header.includes('Is there anything that you find in the campus, that directly needs escalation?')
        );

        if (urgentFieldColumn === -1 && escalationFieldColumn === -1) {
            console.log('⚠️ No urgent field columns found');
            return;
        }

        // Extract basic info
        const timestamp = submissionValues[0] || new Date().toISOString();
        const campusName = submissionValues[headers.findIndex(h => h.toLowerCase().includes('campus'))] || 'Unknown Campus';
        const resolverName = submissionValues[headers.findIndex(h => h.toLowerCase().includes('name'))] || 'Unknown Resolver';

        console.log(`📍 Submission from: ${resolverName} at ${campusName}`);

        // Check urgent field
        if (urgentFieldColumn !== -1) {
            const urgentContent = submissionValues[urgentFieldColumn];
            if (isValidUrgentContent(urgentContent)) {
                console.log(`🚨 URGENT ISSUE: "${urgentContent}"`);
                sendUrgentNotificationEmail({
                    campusName,
                    resolverName,
                    timestamp,
                    field: headers[urgentFieldColumn],
                    content: urgentContent.toString(),
                    rowNumber: 'Latest',
                    type: 'Urgent Campus Issue'
                });
            }
        }

        // Check escalation field
        if (escalationFieldColumn !== -1) {
            const escalationContent = submissionValues[escalationFieldColumn];
            if (isValidUrgentContent(escalationContent)) {
                console.log(`🔴 ESCALATION: "${escalationContent}"`);
                sendUrgentNotificationEmail({
                    campusName,
                    resolverName,
                    timestamp,
                    field: headers[escalationFieldColumn],
                    content: escalationContent.toString(),
                    rowNumber: 'Latest',
                    type: 'Escalation Required'
                });
            }
        }

    } catch (error) {
        console.error('❌ Error checking urgent issues:', error);
    }
}

/**
 * Validate urgent content
 */
function isValidUrgentContent(content) {
    if (!content || typeof content !== 'string') return false;

    const trimmed = content.trim().toLowerCase();

    // Filter out empty or meaningless responses
    if (trimmed === '' ||
        trimmed === 'no' ||
        trimmed === 'na' ||
        trimmed === 'none' ||
        trimmed === 'nil' ||
        trimmed.length < 3) {
        return false;
    }

    return true;
}

/**
 * Send urgent notification email
 */
function sendUrgentNotificationEmail(data) {
    try {
        console.log(`📧 Sending ${data.type} email...`);

        const subject = `URGENT: Campus Issue - ${data.campusName}`;
        const dashboardUrl = 'https://ng-campus-pulse.vercel.app';

        const emailBody = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 24px;">⚠️ URGENT CAMPUS ALERT</h1>
      <p style="margin: 10px 0 0 0;">${data.type}</p>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${dashboardUrl}/#urgent-issues" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
        View Urgent Issues
      </a>
      <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
        Open Dashboard
      </a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #2c3e50; margin-top: 0;">Campus Details</h2>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Campus:</td>
          <td style="padding: 8px 0;"><strong>${data.campusName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Reported by:</td>
          <td style="padding: 8px 0;">${data.resolverName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Time:</td>
          <td style="padding: 8px 0;">${new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #721c24; margin-top: 0;">Issue Report</h3>
      <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
        <p style="margin: 0; white-space: pre-wrap;">${data.content}</p>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 8px;">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        <strong>NavGurukul Campus Pulse System</strong><br>
        Auto-notification • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
    </div>
    
  </div>
</body>
</html>`;

        // Send to all recipients
        CONFIG.EMAIL_RECIPIENTS.forEach(recipient => {
            GmailApp.sendEmail(
                recipient,
                subject,
                '',
                {
                    htmlBody: emailBody,
                    name: 'Campus Pulse System'
                }
            );
        });

        console.log(`✅ Email sent to ${CONFIG.EMAIL_RECIPIENTS.join(', ')}`);

    } catch (error) {
        console.error('❌ Email failed:', error);
    }
}

/**
 * Send data to backend with retry
 */
function sendDataWithRetry(data, attempt = 1) {
    try {
        console.log(`📡 Sending to backend (attempt ${attempt}/${CONFIG.MAX_RETRIES})`);

        const response = UrlFetchApp.fetch(CONFIG.BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            payload: JSON.stringify(data),
            muteHttpExceptions: true
        });

        const responseCode = response.getResponseCode();

        if (responseCode === 200) {
            console.log('✅ Backend sync successful');
            return { success: true };
        } else {
            throw new Error(`HTTP ${responseCode}`);
        }

    } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);

        if (attempt < CONFIG.MAX_RETRIES) {
            Utilities.sleep(CONFIG.RETRY_DELAY);
            return sendDataWithRetry(data, attempt + 1);
        } else {
            return { success: false, message: error.toString() };
        }
    }
}

/**
 * TEST FUNCTIONS - Run these manually to verify setup
 */

function testEmailNotification() {
    console.log('🧪 Testing email system...');
    
    sendUrgentNotificationEmail({
        campusName: 'Test Campus',
        resolverName: 'Test User',
        timestamp: new Date().toISOString(),
        field: 'Test Field',
        content: 'This is a test urgent issue notification.',
        rowNumber: 'TEST',
        type: 'Test Urgent Issue'
    });
    
    console.log('✅ Test email sent! Check: ' + CONFIG.EMAIL_RECIPIENTS.join(', '));
}

function checkTriggerStatus() {
    console.log('🔍 Checking triggers...');
    
    const triggers = ScriptApp.getProjectTriggers();
    const formSubmitTriggers = triggers.filter(t => 
        t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT
    );
    const editTriggers = triggers.filter(t => 
        t.getEventType() === ScriptApp.EventType.ON_EDIT
    );
    
    console.log(`📊 Total triggers: ${triggers.length}`);
    console.log(`📝 Form submit triggers: ${formSubmitTriggers.length}`);
    console.log(`✏️ Edit triggers: ${editTriggers.length}`);
    
    if (formSubmitTriggers.length > 0) {
        console.log('✅ AUTO-SYNC IS ACTIVE (Form Submit)');
        return { success: true, active: true, type: 'form-submit' };
    } else if (editTriggers.length > 0) {
        console.log('⚠️ Using Edit trigger (Form Submit recommended)');
        return { success: true, active: true, type: 'edit' };
    } else {
        console.log('❌ NO TRIGGERS FOUND - Auto-sync NOT active');
        console.log('💡 See AUTO_TRIGGER_SETUP.md for instructions');
        return { success: false, active: false };
    }
}

function syncDataNow() {
    console.log('🔄 Manual sync starting...');
    const result = pushDataToBackend();
    
    if (result && result.success) {
        console.log('✅ Manual sync completed!');
    } else {
        console.error('❌ Manual sync failed');
    }
    
    return result;
}

function runCompleteSystemTest() {
    console.log('🚀 COMPLETE SYSTEM TEST');
    console.log('======================\n');
    
    console.log('1. Checking triggers...');
    const triggerStatus = checkTriggerStatus();
    console.log('');
    
    console.log('2. Testing email...');
    testEmailNotification();
    console.log('');
    
    console.log('3. Syncing data...');
    pushDataToBackend();
    console.log('');
    
    console.log('✅ TEST COMPLETE!');
    console.log('\nNext steps:');
    console.log('- Check your email');
    console.log('- Submit a test form');
    console.log('- Verify dashboard updates');
    
    return triggerStatus;
}
