#!/usr/bin/env node

/**
 * Google Sheets Setup Helper Script
 * 
 * This script helps you set up Google Sheets integration for your dashboard.
 * Run with: node setup-sheets.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Google Sheets Setup Helper')
console.log('===============================\n')

// Check if credentials.json exists
const credentialsPath = path.join(process.cwd(), 'credentials.json')
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(credentialsPath)) {
  console.log('❌ credentials.json not found')
  console.log('   Please download your service account JSON file from Google Cloud Console')
  console.log('   and save it as "credentials.json" in your project root.\n')
} else {
  console.log('✅ credentials.json found')
  
  // Try to read and validate credentials
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    console.log('   Service Account Email:', credentials.client_email)
    console.log('   Project ID:', credentials.project_id)
    console.log('')
  } catch (err) {
    console.log('   ⚠️  Warning: credentials.json exists but may be invalid')
    console.log('')
  }
}

// Check environment variables
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found')
  console.log('   Creating .env.local template...')
  
  const envTemplate = `# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=your_actual_spreadsheet_id_here

# Replace 'your_actual_spreadsheet_id_here' with your real spreadsheet ID
# You can find this in your Google Sheet URL: 
# https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
`
  
  fs.writeFileSync(envPath, envTemplate)
  console.log('   ✅ .env.local created - please update GOOGLE_SPREADSHEET_ID')
  console.log('')
} else {
  console.log('✅ .env.local found')
  
  // Check if GOOGLE_SPREADSHEET_ID is set
  const envContent = fs.readFileSync(envPath, 'utf8')
  if (envContent.includes('your_actual_spreadsheet_id_here')) {
    console.log('   ⚠️  Please update GOOGLE_SPREADSHEET_ID in .env.local')
  } else {
    console.log('   ✅ GOOGLE_SPREADSHEET_ID appears to be configured')
  }
  console.log('')
}

console.log('📋 Next Steps:')
console.log('1. Create a Google Sheet with headers in row 1 (e.g., ID, Name, Email, Status)')
console.log('2. Share the sheet with your service account email (from credentials.json)')
console.log('3. Copy the spreadsheet ID from the URL and update .env.local')
console.log('4. Restart your Next.js development server: npm run dev')
console.log('\n🔗 Useful Links:')
console.log('   Google Cloud Console: https://console.cloud.google.com/')
console.log('   Google Sheets API Documentation: https://developers.google.com/sheets/api')
console.log('\n✨ Your dashboard will automatically switch to live data once configured!')
