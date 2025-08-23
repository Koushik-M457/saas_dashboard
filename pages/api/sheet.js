import { google } from 'googleapis'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check for required environment variables
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
    
    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      // Fallback to mock data if environment variables are missing
      console.log('⚠️ Google Sheets environment variables not found, using mock data')
      console.log('Missing:', {
        GOOGLE_CLIENT_EMAIL: !GOOGLE_CLIENT_EMAIL,
        GOOGLE_PRIVATE_KEY: !GOOGLE_PRIVATE_KEY,
        GOOGLE_SHEET_ID: !GOOGLE_SHEET_ID
      })
      
      const mockSheetData = [
        ['ID', 'Name', 'Email', 'Status', 'Last Updated'],
        ['1', 'John Doe', 'john@example.com', 'Active', '2024-01-15'],
        ['2', 'Jane Smith', 'jane@example.com', 'Inactive', '2024-01-14'],
        ['3', 'Bob Johnson', 'bob@example.com', 'Active', '2024-01-13'],
        ['4', 'Alice Brown', 'alice@example.com', 'Pending', '2024-01-12'],
        ['5', 'Charlie Wilson', 'charlie@example.com', 'Active', '2024-01-11']
      ]

      return res.status(200).json({
        success: true,
        data: mockSheetData,
        headers: mockSheetData[0],
        rows: mockSheetData.slice(1),
        totalRows: mockSheetData.length - 1,
        message: 'Mock data - Add GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID to .env.local'
      })
    }

    // LIVE GOOGLE SHEETS API IMPLEMENTATION using environment variables
    // Handle private key formatting - support both escaped and actual newlines
    let privateKey = GOOGLE_PRIVATE_KEY;
    
    // If the key contains literal \n strings, replace them with actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Remove quotes if they exist around the key
    privateKey = privateKey.replace(/^"(.*)"$/, '$1');
    
    console.log('🔑 Private key format check:', {
      hasEscapedNewlines: GOOGLE_PRIVATE_KEY.includes('\\n'),
      hasActualNewlines: GOOGLE_PRIVATE_KEY.includes('\n'),
      keyLength: privateKey.length,
      startsWithBegin: privateKey.startsWith('-----BEGIN'),
      endsWithEnd: privateKey.endsWith('-----')
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    const RANGE = 'Sheet1!A1:Z1000' // Read first 1000 rows of all columns

    console.log('🔗 Connecting to Google Sheets:', GOOGLE_SHEET_ID)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: RANGE,
    })

    const values = response.data.values || []
    
    if (values.length === 0) {
      return res.status(404).json({ 
        error: 'No data found in the specified range',
        message: 'The Google Sheet is empty or the range is invalid'
      })
    }

    const headers = values[0]
    const rows = values.slice(1)

    console.log('✅ Successfully fetched data from Google Sheets:', rows.length, 'rows')

    res.status(200).json({
      success: true,
      data: values,
      headers: headers,
      rows: rows,
      totalRows: rows.length,
      range: RANGE,
      spreadsheetId: GOOGLE_SHEET_ID,
      message: 'Live data from Google Sheets'
    })

  } catch (error) {
    console.error('Error fetching Google Sheets data:', error)
    
    // Provide specific error messages for common issues
    let errorMessage = error.message;
    let suggestions = [];
    
    if (error.code === 'ERR_OSSL_UNSUPPORTED' || error.message.includes('DECODER routines')) {
      errorMessage = 'Invalid private key format';
      suggestions = [
        'Ensure your GOOGLE_PRIVATE_KEY starts with "-----BEGIN PRIVATE KEY-----" and ends with "-----END PRIVATE KEY-----"',
        'Make sure the private key is properly quoted in your .env.local file',
        'Check that newlines in the private key are properly escaped as \\n',
        'Verify you copied the entire private key from your service account JSON file'
      ];
    } else if (error.message.includes('Unable to retrieve access token')) {
      errorMessage = 'Authentication failed';
      suggestions = [
        'Verify your GOOGLE_CLIENT_EMAIL is correct',
        'Ensure your service account has access to the Google Sheet',
        'Check that the Google Sheets API is enabled in your Google Cloud Console'
      ];
    } else if (error.message.includes('Requested entity was not found')) {
      errorMessage = 'Google Sheet not found';
      suggestions = [
        'Verify your GOOGLE_SHEET_ID is correct',
        'Make sure the sheet is shared with your service account email',
        'Check that the sheet exists and is accessible'
      ];
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage,
      suggestions: suggestions,
      originalError: error.message
    })
  }
}
