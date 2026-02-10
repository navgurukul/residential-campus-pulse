# 📱 COMPLETE STEP-BY-STEP GUIDE - Campus Pulse Auto-Sync

## 🎯 Goal
Make your form automatically sync data to the dashboard when someone submits it.

---

## PART 1: Open Google Apps Script

### Step 1: Open Your Google Sheet
1. Go to Google Drive: https://drive.google.com
2. Find your **Campus Pulse form responses sheet**
3. Double-click to open it

### Step 2: Open Apps Script Editor
1. In your Google Sheet, look at the top menu bar
2. Click on **Extensions** (in the menu bar)
3. In the dropdown, click **Apps Script**

```
Top Menu: File | Edit | View | Insert | Format | Data | Tools | Extensions | Help
                                                                    ↑
                                                              Click here!
```

4. A new tab will open - this is the **Google Apps Script Editor**

---

## PART 2: Replace the Script Code

### Step 3: Clear Old Code
1. In the Apps Script editor, you'll see a file called `Code.gs` on the left
2. Click on it
3. Select ALL the existing code (Ctrl+A or Cmd+A)
4. Delete it (press Delete or Backspace)

### Step 4: Paste New Code
1. Open the file: `backend/IMPROVED-AUTO-SYNC-SCRIPT.js` (from this project)
2. Copy ALL the code (Ctrl+C or Cmd+C)
3. Go back to Google Apps Script editor
4. Paste the code (Ctrl+V or Cmd+V)

### Step 5: Save the Script
1. Click the **Save** icon (💾 disk icon) at the top
2. Or press Ctrl+S (Cmd+S on Mac)
3. Wait for "Saved" message to appear

---

## PART 3: Set Up Automatic Trigger (MOST IMPORTANT!)

### Step 6: Open Triggers Panel
1. Look at the **LEFT SIDEBAR** in Apps Script editor
2. You'll see icons:
   ```
   📄 Files
   ⏰ Triggers    ← Click this one!
   🔧 Project Settings
   ```
3. Click the **⏰ Triggers** icon (looks like a clock/alarm)

### Step 7: Add New Trigger
1. You'll see a page that says "No triggers set up. Click Add Trigger to get started."
2. Click the **"+ Add Trigger"** button (bottom right corner)
3. A popup window will appear

### Step 8: Configure the Trigger
In the popup, set these options EXACTLY:

```
┌─────────────────────────────────────────────────┐
│ Choose which function to run:                   │
│ [onFormSubmit ▼]  ← Select this                │
├─────────────────────────────────────────────────┤
│ Choose which deployment should run:             │
│ [Head ▼]  ← Keep this                          │
├─────────────────────────────────────────────────┤
│ Select event source:                            │
│ [From spreadsheet ▼]  ← Select this            │
├─────────────────────────────────────────────────┤
│ Select event type:                              │
│ [On form submit ▼]  ← Select this              │
├─────────────────────────────────────────────────┤
│ Failure notification settings:                  │
│ [Notify me daily ▼]  ← Keep this               │
└─────────────────────────────────────────────────┘

           [Cancel]  [Save]  ← Click Save
```

**IMPORTANT:** Make sure you select:
- Function: **onFormSubmit** (NOT onEdit)
- Event source: **From spreadsheet**
- Event type: **On form submit**

### Step 9: Grant Permissions
1. After clicking Save, a popup will appear: "Authorization required"
2. Click **"Review permissions"**
3. Choose your Google account
4. You'll see a warning: "Google hasn't verified this app"
5. Click **"Advanced"** (at the bottom)
6. Click **"Go to [Your Project Name] (unsafe)"**
7. Click **"Allow"**

**Why this warning?** It's your own script, so it's safe. Google shows this for any custom script.

### Step 10: Verify Trigger is Active
1. After granting permissions, you'll return to the Triggers page
2. You should now see your trigger listed:
   ```
   Function: onFormSubmit
   Event: On form submit
   Status: Active ✓
   ```

---

## PART 4: Test Everything

### Step 11: Test the Trigger
1. Go back to your Google Apps Script editor
2. At the top, find the function dropdown
3. Select **"checkTriggerStatus"** from the dropdown
4. Click the **▶ Run** button
5. Look at the **Execution log** at the bottom
6. You should see: "✅ AUTO-SYNC IS ACTIVE (Form Submit)"

### Step 12: Test Email System
1. In the function dropdown, select **"testEmailNotification"**
2. Click **▶ Run**
3. Check the email: surajsahani@navgurukul.org
4. You should receive a test email

### Step 13: Test with Real Form Submission
1. Open your Google Form
2. Fill it out with test data
3. In the urgent fields, type something like "test urgent issue"
4. Submit the form
5. Wait 10-30 seconds
6. Check:
   - ✅ Email should arrive
   - ✅ Dashboard should show new data
   - ✅ No manual script running needed!

---

## PART 5: Verify It's Working

### Step 14: Check Execution History
1. In Google Apps Script, click **"Executions"** in the left sidebar (📊 icon)
2. You should see automatic executions when forms are submitted
3. Each execution should show:
   ```
   Function: onFormSubmit
   Status: Completed ✓
   ```

### Step 15: Monitor Your Dashboard
1. Open your dashboard: https://ng-campus-pulse.vercel.app
2. Submit a test form
3. Refresh the dashboard
4. New data should appear automatically!

---

## 🎉 SUCCESS! What Happens Now?

✅ **Automatic Sync**: Every form submission automatically syncs to dashboard
✅ **Instant Emails**: Urgent issues trigger emails immediately
✅ **No Manual Work**: You never need to run the script manually again
✅ **Real-time Updates**: Dashboard always shows latest data

---

## 🔧 Troubleshooting

### ❌ "onFormSubmit not found" error
**Solution:** Make sure you pasted the IMPROVED-AUTO-SYNC-SCRIPT.js code correctly

### ❌ Trigger not firing
**Solution:** 
1. Delete the trigger
2. Create it again
3. Make sure you selected "On form submit" not "On edit"

### ❌ Emails not sending
**Solution:**
1. Run `testEmailNotification()` function
2. Check if Gmail permissions were granted
3. Verify email addresses in CONFIG section

### ❌ Data not syncing
**Solution:**
1. Check Apps Script execution logs for errors
2. Verify backend URL is correct: https://ng-campus-pulse.onrender.com/api/import-data
3. Test manually by running `syncDataNow()` function

---

## 📞 Quick Commands Reference

Run these functions manually in Apps Script to test:

| Function | What It Does |
|----------|-------------|
| `checkTriggerStatus()` | Verify triggers are active |
| `testEmailNotification()` | Send test email |
| `syncDataNow()` | Manually sync data once |
| `runCompleteSystemTest()` | Test everything at once |

---

## 🎓 Understanding the Setup

**Before:** 
- You had to manually open Google Sheets
- Run the script every time someone submitted a form
- Data would be stale until you ran it

**After:**
- Form submission → Automatic trigger fires
- Script runs automatically
- Data syncs immediately
- Emails sent for urgent issues
- Zero manual work needed!

---

## ✅ Checklist

Use this to verify everything is set up:

- [ ] Opened Google Apps Script from Extensions menu
- [ ] Pasted IMPROVED-AUTO-SYNC-SCRIPT.js code
- [ ] Saved the script
- [ ] Created trigger with "On form submit"
- [ ] Granted all permissions
- [ ] Ran checkTriggerStatus() - shows "ACTIVE"
- [ ] Ran testEmailNotification() - received email
- [ ] Submitted test form - data appeared automatically
- [ ] Checked Executions tab - shows automatic runs

---

**Need Help?** 
- Check the Execution logs in Apps Script for error messages
- Make sure your backend is running: https://ng-campus-pulse.onrender.com
- Verify your Google Form is connected to the correct sheet

**Last Updated:** February 2026
