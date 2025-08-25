/**
 * PRODUCTION VERSION - Google Apps Script for Campus Pulse
 * CLEAN VERSION - Fixed emoji encoding issues
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
 * Send urgent notification email with dashboard links - CLEAN VERSION
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
      <h1 style="margin: 0; font-size: 24px;">⚠️ URGENT CAMPUS ALERT</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">${data.type}</p>
    </div>
    
    <!-- Quick Action Buttons -->
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${urgentIssuesUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
        ⚠️ View All Urgent Issues
      </a>
      <a href="${dashboardBaseUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px;">
        📊 Open Dashboard
      </a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #2c3e50; margin-top: 0;">🏫 Campus Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Campus:</td>
          <td style="padding: 8px 0;">
            <strong>${data.campusName}</strong>
            <a href="${campusDetailUrl}" style="margin-left: 10px; color: #007bff; text-decoration: none; font-size: 12px;">
              📋 View Campus Details
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
              ${data.type === 'Escalation Required' ? '⚠️ HIGH PRIORITY' : '⚠️ URGENT'}
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #721c24; margin-top: 0;">📋 Issue Report</h3>
      <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
        <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${data.content}</p>
      </div>
    </div>
    
    <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #0c5460; margin-top: 0;">⚡ Immediate Actions Required</h3>
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