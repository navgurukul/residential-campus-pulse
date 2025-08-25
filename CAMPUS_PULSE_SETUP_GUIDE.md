# 🚀 Campus Pulse Complete Setup Guide

## 📋 **End-to-End Setup Instructions**

Follow these steps in order to set up your complete Campus Pulse system with automatic email notifications.

---

## **STEP 1: Google Apps Script Setup**

### **1.1 Copy the Script**
1. Open your **Google Spreadsheet** (the one receiving form responses)
2. Go to **Extensions → Apps Script**
3. Delete any existing code
4. Copy and paste the content from: `backend/production-google-apps-script-fixed.js`
5. **Save** the script (Ctrl+S)

### **1.2 Set Up Trigger (Manual Method)**
1. Click the **Triggers** icon (⏰) in the left sidebar
2. Click **"+ Add Trigger"**
3. Configure:
   - **Function:** `onEdit`
   - **Deployment:** `Head`
   - **Event source:** `From spreadsheet`
   - **Event type:** `On edit`
4. Click **"Save"**
5. Grant permissions when prompted

---

## **STEP 2: Test Functions (Run in Order)**

### **Function 1: Check Trigger Status**
```javascript
checkTriggerStatus()
```
**Expected Output:**
```
✅ Automatic email notifications are ACTIVE
✏️ Edit triggers: 1
- Edit trigger: onEdit
```

### **Function 2: Test Email System**
```javascript
testEmailNotification()
```
**Expected Result:** 
- Email sent to both `surajsahani@navgurukul.org` and `priyanka@navgurukul.org`
- Check both inboxes for test email

### **Function 3: Sync Current Data**
```javascript
pushDataToBackend()
```
**Expected Output:**
```
🚀 Starting data sync...
📊 Processing sheet data...
✅ Data sync completed successfully
```

---

## **STEP 3: Create Test Urgent Issues**

### **3.1 Submit Test Form**
Fill out your Google Form with:
- **Campus:** Any campus name
- **Name:** Test User  
- **Email:** test@navgurukul.org
- **Urgent Field:** "URGENT TEST: Critical infrastructure issue in dormitory requires immediate campus management attention."
- **Escalation Field:** "ESCALATION TEST: Safety concern with electrical systems needs senior team review immediately."

### **Function 4: Check Automatic Processing**
After form submission, check **Google Apps Script execution history**:
- Should show `onEdit` function ran automatically
- Look for logs showing urgent issue detection

### **Function 5: Manual Sync (if needed)**
```javascript
pushDataToBackend()
```
**Expected Output:**
```
🚨 Urgent content found: "URGENT TEST..."
📧 Sending email...
✅ Email sent successfully to surajsahani@navgurukul.org, priyanka@navgurukul.org
```

---

## **STEP 4: Test Dashboard**

### **4.1 Run Dashboard Locally**
```bash
npm run dev
```
Open: http://localhost:5173

### **4.2 Test API Endpoint**
Open: `debug-urgent-issues.html` in browser
**Expected Result:** Shows urgent issues data

### **4.3 Test Navigation**
1. Dashboard should show: **"1 Urgent Issue Requires Attention"** banner
2. Click **"View Issues →"** button
3. Should navigate to: `http://localhost:5173/#urgent-issues`
4. Should display: Urgent Issues page with your test data

---

## **STEP 5: Production Deployment**

### **Function 6: Final Data Sync**
```javascript
pushDataToBackend()
```

### **5.1 Deploy to Vercel**
Your changes are already pushed to GitHub, so Vercel will auto-deploy.
Check: https://ng-campus-pulse.vercel.app

### **5.2 Test Production**
1. Go to: https://ng-campus-pulse.vercel.app
2. Should show urgent issues banner
3. Click "View Issues →" should work
4. Submit another test form to verify end-to-end flow

---

## **STEP 6: Ongoing Maintenance Functions**

### **Function 7: Check System Status**
```javascript
checkTriggerStatus()
```
Run this periodically to ensure triggers are still active.

### **Function 8: Manual Data Refresh**
```javascript
syncDataNow()
```
Use this if you need to manually sync data to dashboard.

### **Function 9: Disable Triggers (if needed)**
```javascript
disableFormSubmissionTrigger()
```
Use this to stop automatic emails temporarily.

### **Function 10: Re-enable Triggers**
```javascript
setupManualTrigger()
```
Use this to get instructions to re-enable triggers.

---

## **🔍 Troubleshooting Functions**

### **Debug Function A: Test Email Only**
```javascript
testEmailNotification()
```

### **Debug Function B: Check Data**
```javascript
pushDataToBackend()
```

### **Debug Function C: Verify Triggers**
```javascript
checkTriggerStatus()
```

---

## **📧 Expected Email Flow**

1. **Form submitted** → `onEdit` trigger fires automatically
2. **Urgent content detected** → Emails sent to both recipients
3. **Data synced** → Backend updated with urgent issues
4. **Dashboard updated** → Shows urgent issues banner
5. **Navigation works** → "View Issues" button navigates correctly

---

## **✅ Success Criteria**

- ✅ **Triggers active:** `checkTriggerStatus()` shows 1 edit trigger
- ✅ **Emails working:** Both recipients receive test emails
- ✅ **Auto-detection:** Form submissions trigger emails automatically  
- ✅ **Dashboard sync:** Urgent issues appear in dashboard
- ✅ **Navigation:** "View Issues" button works correctly

---

## **🚨 Emergency Functions**

If something breaks:

1. **Reset triggers:** Run `setupManualTrigger()` and follow instructions
2. **Test emails:** Run `testEmailNotification()`  
3. **Force sync:** Run `pushDataToBackend()`
4. **Check status:** Run `checkTriggerStatus()`

---

**Your Campus Pulse system is now ready for production! 🎉**