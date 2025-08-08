# Backend API for Campus Pulse

This backend provides REST API endpoints for the Campus Pulse application.

## New Endpoint: `/api/import-data`

### Description
A POST endpoint that accepts Google Sheet data and processes it for the frontend application.

### Endpoint Details
- **URL**: `POST /api/import-data`
- **Content-Type**: `application/json`
- **Body**: Array of objects where each object represents a row from Google Sheet

### Request Format
```json
[
  {
    "Campus Name": "Pune Campus",
    "Location": "Pune, Maharashtra", 
    "Average Score": "8.5",
    "Total Resolvers": "12",
    "Ranking": "High",
    "Last Evaluated": "2024-01-15"
  },
  {
    "Campus Name": "Dantewada Campus",
    "Location": "Dantewada, Chhattisgarh",
    "Average Score": "7.8", 
    "Total Resolvers": "8",
    "Ranking": "Medium",
    "Last Evaluated": "2024-01-14"
  }
]
```

### Response Format
```json
{
  "status": "success",
  "message": "Data received.",
  "recordsReceived": 2
}
```

## Local Development

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm run dev
```
The server will start on `http://localhost:3001`

### 3. Test the Endpoint
```bash
node test-import.js
```

## Testing with curl
```bash
curl -X POST http://localhost:3001/api/import-data \
  -H "Content-Type: application/json" \
  -d '[{"Campus Name": "Test Campus", "Location": "Test Location"}]'
```

## Deployment Options

### Option 1: Heroku
1. Install Heroku CLI
2. Create a new Heroku app: `heroku create your-app-name`
3. Deploy: `git push heroku main`
4. Your endpoint will be: `https://your-app-name.herokuapp.com/api/import-data`

### Option 2: Railway
1. Connect your GitHub repo to Railway
2. Deploy automatically
3. Your endpoint will be: `https://your-app.railway.app/api/import-data`

### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in the backend directory
3. Your endpoint will be: `https://your-app.vercel.app/api/import-data`

## Google Apps Script Integration

1. Copy the code from `google-apps-script-example.js`
2. Update the `BACKEND_URL` to your deployed URL
3. Set up triggers to run the sync function periodically

## Environment Variables (for production)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Next Steps
- Add database integration (MongoDB, PostgreSQL, etc.)
- Add authentication/authorization
- Add data validation and transformation
- Add error handling and logging
- Add rate limiting