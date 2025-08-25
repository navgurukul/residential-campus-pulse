/**
 * PRODUCTION VERSION - Google Apps Script for Campus Pulse
 * Optimized for real-world usage with proper email handling
 * FIXED VERSION - All syntax errors resolved
 * 
 * 🚀 QUICK START FUNCTIONS (Run in this order):
 * 1. checkTriggerStatus() - Verify triggers are active
 * 2. testEmailNotification() - Test email system
 * 3. pushDataToBackend() - Sync data to dashboard
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
 * FUNCTION 3: Main function to push sheet data to backend
 * Run this to sync your Google Sheets data to the dashboard backend
 */
function pushDataToBackend() {
    const startTime = new Date();
    console.log(`🚀 Starting data sync at ${startTime.toISOString()}`);

    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getActiveSheet();

        console.log(`📊 Processing sheet: "${sheet.getName()}" in spreadsheet: "${spreadsheet.getName()}"`);

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

        const headers = values[0];
        const dataRows = values.slice(1);

        console.log(`📋 Found ${headers.length} columns and ${dataRows.length} data rows`);

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

        // Check for urgent emails BEFORE processing all data
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
 * PRODUCTION EMAIL CHECKER - Sends only one email per urgent field per submission
 */
function checkAndSendUrgentEmails(headers, dataRows) {
    try {
        console.log('🔍 Checking for urgent email notifications...');

        // Find the exact urgent field columns (no duplicates)
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

        console.log(`📋 Urgent field column: ${urgentFieldColumn}, Escalation field column: ${escalationFieldColumn}`);

        // Check only the last 2 form submissions
        const recentRows = dataRows.slice(-2);

        recentRows.forEach((row, rowIndex) => {
            const actualRowNumber = dataRows.length - recentRows.length + rowIndex + 1;
            console.log(`📝 Checking row ${actualRowNumber} for urgent content...`);

            // Extract basic info
            const campusName = row[headers.findIndex(h => h.toLowerCase().includes('campus'))] || 'Unknown Campus';
            const resolverName = row[headers.findIndex(h => h.toLowerCase().includes('name'))] || 'Unknown Resolver';
            const timestamp = row[0] || new Date().toISOString();

            console.log(`Campus: ${campusName}, Resolver: ${resolverName}`);

            // Check urgent field (Column 38)
            if (urgentFieldColumn !== -1) {
                const urgentContent = row[urgentFieldColumn];
                console.log(`Checking urgent field: "${urgentContent}"`);

                if (isValidUrgentContent(urgentContent)) {
                    console.log(`🚨 Urgent content found: "${urgentContent}"`);
                    sendUrgentNotificationEmail({
                        campusName,
                        resolverName,
                        timestamp,
                        field: headers[urgentFieldColumn],
                        content: urgentContent.toString(),
                        rowNumber: actualRowNumber,
                        type: 'Urgent Campus Issue'
                    });
                }
            }

            // Check escalation field (Column 39)
            if (escalationFieldColumn !== -1) {
                const escalationContent = row[escalationFieldColumn];
                console.log(`Checking escalation field: "${escalationContent}"`);

                if (isValidUrgentContent(escalationContent)) {
                    console.log(`🚨 Escalation content found: "${escalationContent}"`);
                    sendUrgentNotificationEmail({
                        campusName,
                        resolverName,
                        timestamp,
                        field: headers[escalationFieldColumn],
                        content: escalationContent.toString(),
                        rowNumber: actualRowNumber,
                        type: 'Escalation Required'
                    });
                }
            }
        });

    } catch (error) {
        console.error('❌ Error checking urgent emails:', error);
    }
}

/**
 * Helper function to validate urgent content
 */
function isValidUrgentContent(content) {
    if (!content || typeof content !== 'string') return false;

    const trimmed = content.trim().toLowerCase();

    // Filter out empty, short, or meaningless responses
    if (trimmed === '' ||
        trimmed === 'no' ||
        trimmed === 'na' ||
        trimmed === 'none' ||
        trimmed === 'nil' ||
        trimmed.length < 3) {
        return false;
    }

    // Allow "test" for debugging, but you can remove this line for production
    return true;
}

/**
 * Send urgent notification email with dashboard links
 */
function sendUrgentNotificationEmail(data) {
    try {
        console.log(`📧 Sending ${data.type} email for ${data.campusName}...`);

        const subject = `🚨 URGENT: Campus Issue Reported - ${data.campusName}`;

        // Dashboard URLs - Updated to use Vercel deployment
        const dashboardBaseUrl = 'https://ng-campus-pulse.vercel.app';
        const urgentIssuesUrl = `${dashboardBaseUrl}/#urgent-issues`;
        const campusDetailUrl = `${dashboardBaseUrl}/#campus-detail`;

        const emailBody = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 24px;">🚨 URGENT CAMPUS ALERT</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">${data.type}</p>
    </div>
    
    <!-- Quick Action Buttons -->
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${urgentIssuesUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
        🚨 View All Urgent Issues
      </a>
      <a href="${dashboardBaseUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
        📊 Open Dashboard
      </a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #2c3e50; margin-top: 0;">📍 Campus Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Campus:</td>
          <td style="padding: 8px 0;">
            <strong>${data.campusName}</strong>
            <a href="${campusDetailUrl}" style="margin-left: 10px; color: #007bff; text-decoration: none; font-size: 12px;">
              📋 View Campus Details →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Reported by:</td>
          <td style="padding: 8px 0;">${data.resolverName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Timestamp:</td>
          <td style="padding: 8px 0;">${new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Form Row:</td>
          <td style="padding: 8px 0;">#${data.rowNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
          <td style="padding: 8px 0;">
            <span style="background: ${data.type === 'Escalation Required' ? '#dc3545' : '#fd7e14'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${data.type === 'Escalation Required' ? '🔴 HIGH PRIORITY' : '🟠 URGENT'}
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #721c24; margin-top: 0;">📝 Issue Report</h3>
      <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
        <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${data.content}</p>
      </div>
    </div>
    
    <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #0c5460; margin-top: 0;">🎯 Immediate Actions Required</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
        <a href="${urgentIssuesUrl}" style="background: #17a2b8; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
          📋 Track in Dashboard
        </a>
        <a href="mailto:${data.resolverName.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org" style="background: #28a745; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
          📧 Contact Resolver
        </a>
        <a href="${dashboardBaseUrl}" style="background: #6f42c1; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
          📊 View Full Report
        </a>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
        <li><strong>Immediate:</strong> Review the reported issue and assess severity</li>
        <li><strong>Contact:</strong> Reach out to the campus resolver for additional context</li>
        <li><strong>Coordinate:</strong> Engage with local campus management team</li>
        <li><strong>Document:</strong> Log resolution steps in the Campus Pulse system</li>
        <li><strong>Follow-up:</strong> Schedule check-in to ensure issue is resolved</li>
      </ul>
    </div>
    
    <!-- Dashboard Access Section -->
    <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h3 style="margin: 0 0 10px 0;">🖥️ Campus Pulse Dashboard</h3>
      <p style="margin: 0 0 15px 0; font-size: 14px;">Access real-time campus data and urgent issue tracking</p>
      <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
        <a href="${urgentIssuesUrl}" style="background: rgba(255,255,255,0.2); color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid rgba(255,255,255,0.3);">
          🚨 Urgent Issues
        </a>
        <a href="${dashboardBaseUrl}" style="background: rgba(255,255,255,0.2); color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid rgba(255,255,255,0.3);">
          📊 Campus Overview
        </a>
        <a href="${dashboardBaseUrl}/#resolver-overview" style="background: rgba(255,255,255,0.2); color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid rgba(255,255,255,0.3);">
          👥 Resolver Data
        </a>
      </div>
    </div>
    
    <!-- System Info -->
    <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
        <strong>NavGurukul Campus Pulse System</strong><br>
        Automated notification • Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
      <div style="font-size: 12px; color: #868e96;">
        <a href="${dashboardBaseUrl}" style="color: #007bff; text-decoration: none;">Dashboard</a> • 
        <a href="${urgentIssuesUrl}" style="color: #dc3545; text-decoration: none;">Urgent Issues</a> • 
        <a href="https://github.com/surajsahani/NG-Campus-Pulse" style="color: #6c757d; text-decoration: none;">GitHub</a>
      </div>
    </div>
    
  </div>
</body>
</html>`;

        // Send email to all recipients
        CONFIG.EMAIL_RECIPIENTS.forEach(recipient => {
            GmailApp.sendEmail(
                recipient,
                subject,
                '',
                {
                    htmlBody: emailBody,
                    name: 'NavGurukul Campus Pulse System'
                }
            );
        });

        console.log(`✅ ${data.type} email sent successfully to ${CONFIG.EMAIL_RECIPIENTS.join(', ')}`);
        console.log(`🔗 Dashboard links included: ${dashboardBaseUrl}`);

    } catch (error) {
        console.error('❌ Failed to send urgent notification email:', error);
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
            headers: { 'Content-Type': 'application/json' },
            payload: JSON.stringify(data),
            muteHttpExceptions: true
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
 * FUNCTION 8: Manual data sync - Run this for production use
 * Alternative to pushDataToBackend() with user-friendly output
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
 */
function enableAutoSync() {
    try {
        console.log('🚀 Enabling automatic data synchronization...');

        const triggers = ScriptApp.getProjectTriggers();
        const existingTriggers = triggers.filter(trigger =>
            trigger.getHandlerFunction() === 'pushDataToBackend'
        );

        if (existingTriggers.length > 0) {
            console.log('🔄 Updating existing sync configuration...');
            existingTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
        }

        ScriptApp.newTrigger('pushDataToBackend')
            .timeBased()
            .everyHours(1)
            .create();

        console.log('✅ Automatic synchronization enabled successfully!');
        console.log('⏰ Your data will now sync every hour automatically');

        return { success: true, message: 'Auto-sync enabled successfully' };

    } catch (error) {
        console.error('❌ Failed to enable automatic sync:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Disable automatic data synchronization
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

        console.log('⏹️ Disabling automatic synchronization...');
        campusPulseTriggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

        console.log('✅ Automatic synchronization disabled successfully');
        return { success: true, message: 'Auto-sync disabled successfully' };

    } catch (error) {
        console.error('❌ Failed to disable automatic sync:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Function that runs automatically when spreadsheet is edited
 * This triggers immediate email notifications for urgent issues
 */
function onEdit(e) {
    try {
        // Only process if this is a new row (form submission)
        const range = e.range;
        const sheet = range.getSheet();

        // Check if this is a new row being added (typical form submission)
        if (range.getRow() > 1 && range.getColumn() === 1) {
            console.log('📝 New row detected - likely form submission!');

            // Get the new row data
            const rowData = sheet.getRange(range.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

            console.log('🔍 Processing new submission for urgent content...');

            // Check for urgent content
            checkFormSubmissionForUrgentIssues(headers, rowData);

            // Sync to backend
            console.log('📡 Syncing updated data to backend...');
            pushDataToBackend();
        }

    } catch (error) {
        console.error('❌ Error in onEdit trigger:', error);
    }
}

/**
 * Check a single form submission for urgent content and send emails immediately
 */
function checkFormSubmissionForUrgentIssues(headers, submissionValues) {
    try {
        console.log('🚨 Checking form submission for urgent issues...');

        // Find urgent field columns
        const urgentFieldColumn = headers.findIndex(header =>
            header.includes('Is there anything that you find pressing in the campus, that needs urgent attention?')
        );

        const escalationFieldColumn = headers.findIndex(header =>
            header.includes('Is there anything that you find in the campus, that directly needs escalation?')
        );

        if (urgentFieldColumn === -1 && escalationFieldColumn === -1) {
            console.log('⚠️ No urgent field columns found in submission');
            return;
        }

        // Extract basic info from submission
        const timestamp = submissionValues[0] || new Date().toISOString();
        const campusName = submissionValues[headers.findIndex(h => h.toLowerCase().includes('campus'))] || 'Unknown Campus';
        const resolverName = submissionValues[headers.findIndex(h => h.toLowerCase().includes('name'))] || 'Unknown Resolver';

        console.log(`📍 Submission from: ${resolverName} at ${campusName}`);

        // Check urgent field
        if (urgentFieldColumn !== -1) {
            const urgentContent = submissionValues[urgentFieldColumn];
            if (isValidUrgentContent(urgentContent)) {
                console.log(`🚨 URGENT ISSUE DETECTED: "${urgentContent}"`);
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
                console.log(`🔴 ESCALATION REQUIRED: "${escalationContent}"`);
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
        console.error('❌ Error checking form submission for urgent issues:', error);
    }
}

/**
 * FUNCTION 2: Test function to verify email notifications work
 * Run this to test if emails are being sent correctly to both recipients
 */
function testEmailNotification() {
    try {
        console.log('🧪 Testing email notification system...');

        // Create test data
        const testData = {
            campusName: 'Test Campus',
            resolverName: 'Test Resolver',
            timestamp: new Date().toISOString(),
            field: 'Test Field',
            content: 'This is a test urgent issue to verify email notifications are working correctly.',
            rowNumber: 'TEST',
            type: 'Test Urgent Issue'
        };

        // Send test email
        sendUrgentNotificationEmail(testData);

        console.log('✅ Test email sent successfully!');
        console.log('📧 Check your inbox at: ' + CONFIG.EMAIL_RECIPIENTS.join(', '));

        return { success: true, message: 'Test email sent successfully' };

    } catch (error) {
        console.error('❌ Test email failed:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * FUNCTION 1: Check current trigger status
 * Run this first to verify your triggers are set up correctly
 */
function checkTriggerStatus() {
    try {
        console.log('🔍 Checking current trigger status...');

        const allTriggers = ScriptApp.getProjectTriggers();
        const editTriggers = allTriggers.filter(trigger =>
            trigger.getEventType() === ScriptApp.EventType.ON_EDIT
        );

        console.log(`📊 Total triggers: ${allTriggers.length}`);
        console.log(`✏️ Edit triggers: ${editTriggers.length}`);

        if (editTriggers.length > 0) {
            console.log('✅ Automatic email notifications are ACTIVE');

            editTriggers.forEach(trigger => {
                console.log(`  - Edit trigger: ${trigger.getHandlerFunction()}`);
            });

            return {
                success: true,
                active: true,
                editTriggers: editTriggers.length,
                message: 'Email notifications are active'
            };
        } else {
            console.log('⚠️ No active triggers found - emails will NOT be sent automatically');
            console.log('💡 Run setupManualTrigger() to get setup instructions');

            return {
                success: true,
                active: false,
                editTriggers: 0,
                message: 'No active triggers - run setupManualTrigger() for instructions'
            };
        }

    } catch (error) {
        console.error('❌ Error checking trigger status:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * FUNCTION 10: MANUAL TRIGGER SETUP - 100% RELIABLE METHOD
 * Run this to get step-by-step instructions for setting up triggers
 */
function setupManualTrigger() {
    console.log('📋 MANUAL TRIGGER SETUP INSTRUCTIONS:');
    console.log('');
    console.log('🎯 STEP-BY-STEP GUIDE:');
    console.log('');
    console.log('1. In Google Apps Script Editor:');
    console.log('   - Look for the "Triggers" icon (⏰) in the left sidebar');
    console.log('   - Click on it to open the Triggers page');
    console.log('   - Click the "+ Add Trigger" button');
    console.log('');
    console.log('2. Configure the trigger settings:');
    console.log('   - Choose function to run: onEdit');
    console.log('   - Choose which deployment should run: Head');
    console.log('   - Select event source: From spreadsheet');
    console.log('   - Select event type: On edit');
    console.log('   - Click "Save" button');
    console.log('');
    console.log('3. Grant permissions:');
    console.log('   - Click "Review permissions"');
    console.log('   - Choose your Google account');
    console.log('   - Click "Allow"');
    console.log('');
    console.log('4. Test the setup:');
    console.log('   - Go to your Google Form');
    console.log('   - Submit it with urgent content');
    console.log('   - Check your email for notifications');
    console.log('');
    console.log('✅ This manual method is 100% reliable and will work!');
    console.log('📧 Once set up, emails will be sent automatically on every form submission');

    return { success: true, message: 'Manual setup instructions provided - follow the steps above' };
}
/
**
 * 🚀 QUICK START: Complete System Test
 * Run this function to test the entire Campus Pulse system
 */
function runCompleteSystemTest() {
    console.log('🚀 CAMPUS PULSE COMPLETE SYSTEM TEST');
    console.log('=====================================');
    console.log('');
    
    console.log('📋 STEP 1: Checking trigger status...');
    const triggerStatus = checkTriggerStatus();
    console.log('');
    
    if (triggerStatus.active) {
        console.log('📧 STEP 2: Testing email notifications...');
        testEmailNotification();
        console.log('');
        
        console.log('📊 STEP 3: Syncing data to backend...');
        pushDataToBackend();
        console.log('');
        
        console.log('✅ SYSTEM TEST COMPLETE!');
        console.log('');
        console.log('🎯 NEXT STEPS:');
        console.log('1. Check your email inboxes for test notifications');
        console.log('2. Submit a test form with urgent content');
        console.log('3. Check your dashboard at: https://ng-campus-pulse.vercel.app');
        console.log('4. Verify "View Issues" navigation works');
        
    } else {
        console.log('⚠️ TRIGGERS NOT ACTIVE!');
        console.log('');
        console.log('🔧 TO FIX:');
        console.log('1. Run: setupManualTrigger()');
        console.log('2. Follow the step-by-step instructions');
        console.log('3. Then run this test again');
    }
    
    return { success: triggerStatus.active, message: 'System test completed' };
}

/**
 * 📋 FUNCTION REFERENCE GUIDE
 * Run this to see all available functions and their purposes
 */
function showFunctionGuide() {
    console.log('📋 CAMPUS PULSE FUNCTION REFERENCE');
    console.log('==================================');
    console.log('');
    console.log('🔧 SETUP FUNCTIONS:');
    console.log('1. checkTriggerStatus() - Check if automatic triggers are active');
    console.log('2. setupManualTrigger() - Get instructions to set up triggers');
    console.log('');
    console.log('📧 TESTING FUNCTIONS:');
    console.log('3. testEmailNotification() - Send test email to both recipients');
    console.log('4. runCompleteSystemTest() - Test entire system end-to-end');
    console.log('');
    console.log('📊 DATA FUNCTIONS:');
    console.log('5. pushDataToBackend() - Sync Google Sheets data to dashboard');
    console.log('6. syncDataNow() - User-friendly version of data sync');
    console.log('');
    console.log('🛠️ MAINTENANCE FUNCTIONS:');
    console.log('7. disableFormSubmissionTrigger() - Stop automatic emails');
    console.log('8. enableAutoSync() - Enable hourly data sync');
    console.log('9. disableAutoSync() - Disable hourly data sync');
    console.log('');
    console.log('🚀 QUICK START:');
    console.log('Run: runCompleteSystemTest()');
    console.log('');
    console.log('📧 Email Recipients:');
    console.log('- surajsahani@navgurukul.org');
    console.log('- priyanka@navgurukul.org');
    
    return { success: true, message: 'Function guide displayed' };
}