# ⚡ QUICK SETUP CARD - 5 Minutes to Auto-Sync

## 🎯 What You Need
- Your Google Sheet with form responses
- 5 minutes of time
- This guide

---

## 📋 SETUP STEPS

### 1️⃣ OPEN APPS SCRIPT (1 min)
```
Google Sheet → Extensions → Apps Script
```
A new tab opens with code editor

---

### 2️⃣ PASTE NEW CODE (1 min)
1. Select all old code (Ctrl+A)
2. Delete it
3. Copy code from: `backend/IMPROVED-AUTO-SYNC-SCRIPT.js`
4. Paste it (Ctrl+V)
5. Save (Ctrl+S)

---

### 3️⃣ CREATE TRIGGER (2 min)
1. Click ⏰ **Triggers** icon (left sidebar)
2. Click **+ Add Trigger** button
3. Set these options:
   ```
   Function: onFormSubmit
   Event source: From spreadsheet
   Event type: On form submit
   ```
4. Click **Save**
5. Click **Review permissions** → Choose account → **Allow**

---

### 4️⃣ TEST IT (1 min)
1. In Apps Script, select function: `checkTriggerStatus`
2. Click ▶ **Run**
3. Check log: Should say "✅ AUTO-SYNC IS ACTIVE"

---

### 5️⃣ VERIFY (30 sec)
1. Submit your Google Form
2. Wait 10 seconds
3. Check dashboard - new data appears!
4. Check email - urgent notifications arrive!

---

## ✅ DONE!

Your form now automatically:
- ✅ Syncs data to dashboard
- ✅ Sends urgent email alerts
- ✅ Updates in real-time
- ✅ No manual work needed!

---

## 🆘 HELP

**Trigger not working?**
→ Make sure you selected "On form submit" not "On edit"

**No emails?**
→ Run `testEmailNotification()` function to test

**Data not syncing?**
→ Check Executions tab for error messages

---

## 📞 Test Functions

Run these in Apps Script to test:

```javascript
checkTriggerStatus()        // Check if trigger is active
testEmailNotification()     // Send test email
syncDataNow()              // Manual sync once
runCompleteSystemTest()    // Test everything
```

---

## 🎓 What Changed?

| Before | After |
|--------|-------|
| Manual script running | Automatic on form submit |
| Stale data | Real-time updates |
| You do the work | Script does the work |
| Delayed emails | Instant notifications |

---

## 🔗 Important Links

- Dashboard: https://ng-campus-pulse.vercel.app
- Backend API: https://ng-campus-pulse.onrender.com
- Apps Script: https://script.google.com

---

**That's it! You're done! 🎉**

Now every form submission automatically syncs without you doing anything!
