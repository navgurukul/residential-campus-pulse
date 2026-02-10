# 🚀 AUTO-SYNC SETUP GUIDE - Campus Pulse

## Problem
Data doesn't sync automatically when someone fills the form. You have to manually run the script each time.

## Solution: Set Up Automatic Form Submit Trigger

### Method 1: Form Submit Trigger (RECOMMENDED)

This is the BEST method because it triggers immediately when someone submits the form.

#### Steps:

1. **Open Google Apps Script Editor**
   - Go to your Google Sheet
   - Click `Extensions` → `Apps Script`

2. **Open Triggers Panel**
   - Click the **clock icon** ⏰ in the left sidebar (Triggers)
   - Or go to: https://script.google.com/home/triggers

3. **Add New Trigger**
   - Click `+ Add Trigger` button (bottom right)

4. **Configure the Trigger**
   ```
   Choose which function to run: onFormSubmit
   Choose which deployment should run: Head
   Select event source: From spreadsheet
   Select event type: On form submit
   ```

5. **Save and Authorize**
   - Click `Save`
   - Click `Review permissions`
   - Choose your Google account
   - Click `Allow`

6. **Test It**
   - Submit a test form
   - Check if data appears in your dashboard automatically
   - Check your email for urgent notifications

---

### Method 2: On Edit Trigger (Alternative)

If Method 1 doesn't work, use this:

1. **Open Triggers Panel** (same as above)

2. **Add New Trigger**
   - Click `+ Add Trigger`

3. **Configure**
   ```
   Choose which function to run: onEdit
   Choose which deployment should run: Head
   Select event source: From spreadsheet
   Select event type: On edit
   ```

4. **Save and Authorize** (same as above)

---

### Method 3: Time-Based Trigger (Backup)

If you want data to sync every hour automatically:

1. **Open Triggers Panel**

2. **Add New Trigger**
   ```
   Choose which function to run: pushDataToBackend
   Choose which deployment should run: Head
   Select event source: Time-driven
   Select type of time based trigger: Hour timer
   Select hour interval: Every hour
   ```

3. **Save**

---

## Better Solution: Use onFormSubmit Function

Your current script uses `onEdit()` which triggers on ANY edit. It's better to use `onFormSubmit()` which only triggers on form submissions.

### Updated Function (Already in your script)

Add this function to your Google Apps Script if it's not there:

```javascript
/**
 * Automatically runs when form is submitted
 * This is the BEST method for automatic sync
 */
function onFormSubmit(e) {
    try {
        console.log('📝 Form submitted! Processing automatically...');
        
        const sheet = e.range.getSheet();
        const row = e.range.getRow();
        
        // Get the new submission data
        const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        console.log('🔍 Checking for urgent issues...');
        checkFormSubmissionForUrgentIssues(headers, rowData);
        
        console.log('📡 Syncing to backend...');
        pushDataToBackend();
        
        console.log('✅ Auto-sync completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in onFormSubmit:', error);
    }
}
```

---

## Verify It's Working

### 1. Check Trigger Status
Run this function in Apps Script:
```javascript
checkTriggerStatus()
```

### 2. Test Form Submission
1. Fill out your Google Form
2. Submit it
3. Wait 10-30 seconds
4. Check your dashboard - data should appear automatically
5. Check email if you included urgent content

### 3. View Execution Logs
- In Apps Script, click `Executions` (left sidebar)
- You should see automatic executions when forms are submitted

---

## Troubleshooting

### ❌ Trigger Not Working
- Make sure you selected "On form submit" not "On edit"
- Verify the function name is exactly `onFormSubmit`
- Check that permissions were granted

### ❌ Data Not Syncing
- Check Apps Script execution logs for errors
- Verify your backend URL is correct in CONFIG
- Test manually by running `pushDataToBackend()`

### ❌ Emails Not Sending
- Verify Gmail permissions are granted
- Check email addresses in CONFIG.EMAIL_RECIPIENTS
- Run `testEmailNotification()` to test

---

## What Happens Now

✅ **Automatic Sync**: Data syncs immediately when form is submitted
✅ **Instant Emails**: Urgent issues trigger emails automatically
✅ **No Manual Work**: You never need to run the script manually
✅ **Real-time Dashboard**: Your dashboard always shows latest data

---

## Quick Commands

Run these in Google Apps Script to manage your setup:

```javascript
// Check if triggers are active
checkTriggerStatus()

// Test email system
testEmailNotification()

// Manual sync (if needed)
pushDataToBackend()

// Complete system test
runCompleteSystemTest()
```

---

**Need Help?** Check the execution logs in Google Apps Script for detailed error messages.
