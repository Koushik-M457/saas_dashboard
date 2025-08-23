# Google Sheets Environment Setup

## Environment Variables Required

Add these variables to your `.env.local` file:

```env
# Google Sheets API Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourActualPrivateKeyHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## How to Get These Values

### 1. Create Google Cloud Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Sheets API
4. Go to "IAM & Admin" > "Service Accounts"
5. Create a new service account
6. Download the JSON key file

### 2. Extract Values from JSON
The downloaded JSON file will look like:
```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

### 3. Set Environment Variables
- `GOOGLE_CLIENT_EMAIL`: Copy the `client_email` value
- `GOOGLE_PRIVATE_KEY`: Copy the `private_key` value (keep the quotes and \n characters)
- `GOOGLE_SHEET_ID`: Get from your Google Sheet URL

### 4. Share Your Google Sheet
1. Open your Google Sheet
2. Click "Share"
3. Add the `client_email` from your service account
4. Give it "Editor" or "Viewer" permissions

## Testing the Connection

After setting up the environment variables:
1. Restart your Next.js server: `npm run dev`
2. Visit the Google Sheets tab in your dashboard
3. Check the browser console for connection logs
4. The warning message should disappear if credentials are valid

## Troubleshooting

- **Private Key Issues**: Make sure to include the full private key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Newline Characters**: Keep the `\n` characters in the private key
- **Sheet Access**: Ensure the service account email has access to your Google Sheet
- **Sheet ID**: Double-check the sheet ID from the URL (between `/d/` and `/edit`)

## API Endpoint

The dashboard now uses `/api/sheet` which:
- Automatically detects if environment variables are set
- Falls back to mock data if credentials are missing
- Returns JSON data in the same format as before
- Preserves all existing UI styling and functionality
