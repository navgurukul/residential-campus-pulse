# 🗄️ MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### 1. Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Complete the registration

### 2. Create a Free Cluster

1. Choose **FREE** tier (M0 Sandbox - 512MB storage)
2. Select cloud provider: **AWS** (recommended)
3. Select region: Choose closest to your users (e.g., Mumbai for India)
4. Cluster name: `campus-pulse-cluster` (or keep default)
5. Click **Create Cluster** (takes 1-3 minutes)

### 3. Create Database User

1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `campus-pulse-admin`
5. Password: Click **Autogenerate Secure Password** (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 4. Configure Network Access

1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds 0.0.0.0/0)
   - This allows your Render backend to connect
4. Click **Confirm**

### 5. Get Connection String

1. Go back to **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://campus-pulse-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Add database name before the `?`:
   ```
   mongodb+srv://campus-pulse-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/campus-pulse?retryWrites=true&w=majority
   ```

### 6. Save Your Credentials

**IMPORTANT:** Save these somewhere safe:
- MongoDB Connection String: `mongodb+srv://...`
- Database Name: `campus-pulse`
- Username: `campus-pulse-admin`
- Password: `[your generated password]`

---

## What Happens Next

Once you provide the connection string:
1. I'll add MongoDB integration to your backend
2. Data will be stored permanently in MongoDB
3. Backend restarts won't lose data anymore
4. No more manual data pushing needed!

---

## Troubleshooting

### Can't connect?
- Make sure IP whitelist includes 0.0.0.0/0
- Verify password is correct (no special characters causing issues)
- Check connection string format

### Cluster creation taking long?
- Usually takes 1-3 minutes
- Refresh the page if it seems stuck

### Forgot password?
- Go to Database Access
- Click Edit on your user
- Click "Edit Password"
- Generate new password

---

## Security Notes

- Connection string contains password - keep it secret!
- We'll store it as environment variable in Render
- Never commit connection string to GitHub
- Use environment variables for production

---

**Ready?** Once you have the connection string, paste it and we'll integrate it! 🚀
