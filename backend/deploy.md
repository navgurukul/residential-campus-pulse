# Deployment Guide for Campus Pulse Backend

## Render.com Deployment

### Method 1: Using render.yaml (Automatic)
1. Push the `render.yaml` file in your root directory to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect the configuration

### Method 2: Manual Configuration
1. Go to Render.com and create a new Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: campus-pulse-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: Yes

### Method 3: Deploy Backend as Separate Repo
1. Create a new GitHub repository for just the backend
2. Copy all files from the `backend/` directory to the new repo
3. Deploy the new repo to Render with:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Environment Variables
Set these in Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: (Render will set this automatically)

## Testing Your Deployed API
Once deployed, your endpoint will be available at:
```
https://your-app-name.onrender.com/api/import-data
```

Test with curl:
```bash
curl -X POST https://your-app-name.onrender.com/api/import-data \
  -H "Content-Type: application/json" \
  -d '[{"Campus Name": "Test Campus", "Location": "Test Location"}]'
```

## Troubleshooting
- Check Render logs for any errors
- Ensure all dependencies are in package.json
- Verify the start command is correct
- Make sure PORT environment variable is used in server.js