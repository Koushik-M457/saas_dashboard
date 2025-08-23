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
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
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
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
