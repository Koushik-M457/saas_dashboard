# Google Sheets Integration Setup Guide

## Current Status
✅ **Demo Mode Active**: The dashboard is currently showing mock Google Sheets data for demonstration purposes.

## To Enable Real Google Sheets Integration

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project

### 2. Create a Service Account
1. In Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name (e.g., "saas-dashboard-sheets")
4. Grant it the "Editor" role for Google Sheets
5. Create and download the JSON key file

### 3. Set Up Your Google Sheet
1. Create a new Google Sheet or use an existing one
2. Share the sheet with your service account email (found in the JSON file)
3. Give it "Editor" permissions
4. Copy the Spreadsheet ID from the URL (the long string between /d/ and /edit)

### 4. Configure Your Project
1. Place the downloaded JSON file in your project root as `credentials.json`
2. Add your spreadsheet ID to `.env.local`:
   ```
   GOOGLE_SPREADSHEET_ID=your_actual_spreadsheet_id_here
   ```

### 5. Enable Real API
1. Open `pages/api/sheets.js`
2. Comment out the mock data section (lines 8-35)
3. Uncomment the real Google Sheets API implementation (lines 37-75)

### 6. Restart Your Development Server
```bash
npm run dev
```

## Data Format
Your Google Sheet should have headers in the first row, for example:
```
ID | Name | Email | Status | Last Updated
1  | John | john@example.com | Active | 2024-01-15
2  | Jane | jane@example.com | Inactive | 2024-01-14
```

## Current Features
- ✅ Mock data display with realistic sample data
- ✅ Responsive table with status color coding
- ✅ Email links for email columns
- ✅ Loading states and error handling
- ✅ Refresh functionality
- ✅ Integration with existing dashboard tabs

## Security Notes
- Never commit `credentials.json` to version control
- Add `credentials.json` to your `.gitignore` file
- Use environment variables for sensitive configuration
- Consider using Google Cloud Secret Manager for production deployments
