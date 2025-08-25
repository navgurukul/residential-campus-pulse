# Campus Pulse Backend Deployment Guide

## Updated Features

✅ **New Form Fields Support:**
- "Is there anything that you find pressing in the campus, that needs urgent attention?"
- "Is there anything that you find in the campus, that directly needs escalation?"

✅ **Email Notifications:**
- Automatic email alerts to surajsahani@navgurukul.org
- Sends only the last 2 form submissions with urgent content
- Beautiful HTML email formatting with campus details

✅ **Backend API:**
- New `/api/urgent-issues` endpoint
- Enhanced data processing for urgent fields
- Real-time urgent issue tracking

## Deployment Steps

### 1. Update Google Apps Script

1. Open your existing Google Apps Script project at [script.google.com](https://script.google.com)
2. Replace the entire code with the updated `google-apps-script-example.js`
3. Save the project (Ctrl+S)
4. Test the new functionality:
   ```javascript
   // Run this in the Apps Script editor to test
   syncDataNow()
   ```

### 2. Deploy Backend Updates

If you're using the Node.js backend:

1. Update your `server.js` with the new code
2. Deploy to your hosting platform (Render, Heroku, etc.)
3. Test the new endpoint:
   ```bash
   curl https://your-backend-url.com/api/urgent-issues
   ```

### 3. Frontend Updates

The frontend has been updated with:
- New "Urgent Issues" tab in navigation
- Real-time urgent issue dashboard
- Email notification status indicators

## Email Configuration

The system will automatically send emails when:
- Someone fills the "pressing in the campus" field with meaningful content
- Someone fills the "directly needs escalation" field with meaningful content
- Only processes the last 2 form submissions to avoid spam

### Email Features:
- 🚨 **Urgent Priority Alerts** - Orange badges for pressing issues
- ⚠️ **Escalation Required** - Red badges for critical issues
- 📧 **Auto-notification** - Emails sent to surajsahani@navgurukul.org
- 🎨 **Rich HTML formatting** - Professional email layout
- 📊 **Campus context** - Includes resolver name, campus, timestamp

## Testing the Integration

### 1. Test Form Submission
1. Fill out your Google Form with test data
2. Include text in the two new urgent fields
3. Submit the form

### 2. Verify Email Delivery
- Check that email was sent to surajsahani@navgurukul.org
- Verify email formatting and content

### 3. Check Dashboard
1. Open the Campus Pulse dashboard
2. Navigate to "Urgent Issues" tab
3. Verify issues appear correctly
4. Test the refresh functionality

## Troubleshooting

### No Emails Being Sent
1. Check Google Apps Script execution logs
2. Verify Gmail permissions are granted
3. Ensure email address is correct in CONFIG

### Backend Errors
1. Check server logs for API errors
2. Verify database/storage is working
3. Test the `/api/urgent-issues` endpoint directly

### Frontend Issues
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Test with browser developer tools

## Security Notes

- Emails are only sent for meaningful content (filters out "no", "na", etc.)
- Only last 2 submissions are processed to prevent spam
- All data is validated before processing
- Email content is sanitized for security

## Support

If you encounter issues:
1. Check the execution logs in Google Apps Script
2. Verify all permissions are granted
3. Test each component individually
4. Contact the development team with specific error messages

---

**Last Updated:** January 2025
**Version:** 2.0 with Urgent Issues Support