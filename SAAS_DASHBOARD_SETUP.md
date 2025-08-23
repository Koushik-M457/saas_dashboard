# 🚀 SaaS Dashboard Setup Guide

## 📋 Overview

Your SaaS Dashboard provides real-time monitoring and analytics with:
- **Live Stats Cards**: Total workflows, executions, success rate, response time, Google Sheet count
- **Interactive Charts**: Line chart (executions/day), pie chart (success vs failed), bar chart (Google Sheets data)
- **Recent Activity**: Latest workflow executions and Google Sheet entries
- **Auto-refresh**: Updates every 5 seconds automatically

## 🔧 Setup Instructions

### 1. Dependencies
All required dependencies are already installed:
- ✅ **Recharts**: For beautiful, responsive charts
- ✅ **Supabase**: For real-time database operations
- ✅ **Google Sheets API**: For sheet data integration
- ✅ **Tailwind CSS**: For modern UI styling

### 2. Database Setup (Supabase)

#### Create the workflow_logs table:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the query to create the table and sample data

#### Table Schema:
```sql
workflow_logs:
- id (SERIAL PRIMARY KEY)
- workflow_name (VARCHAR)
- status (VARCHAR) - 'success', 'failed', 'running', etc.
- execution_time (INTEGER) - in milliseconds
- message (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 3. Environment Variables

Ensure your `.env.local` has all required variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Sheets Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id

# N8N Configuration (if using)
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
```

### 4. Start the Dashboard

```bash
npm run dev
```

Navigate to `http://localhost:3000` to see your dashboard!

## 📊 Dashboard Features

### Stats Cards (Top Row)
1. **Total Workflows**: Fetched from N8N API
2. **Total Executions**: Count from Supabase workflow_logs table
3. **Success Rate**: Calculated percentage of successful executions
4. **Avg Response Time**: Average execution_time from workflow_logs
5. **Google Sheet Count**: Total rows from your Google Sheet

### Charts Section
1. **Executions per Day**: Line chart showing workflow activity over the last 7 days
2. **Success vs Failed**: Pie chart with color-coded success/failure rates
3. **Sheet Data by Status**: Bar chart showing Google Sheets data grouped by status

### Recent Activity Tables
1. **Recent Workflow Executions**: Last 10 executions with status and timestamps
2. **Recent Google Sheet Entries**: Latest 5 rows from your Google Sheet

### Auto-refresh
- **5-second intervals**: Dashboard updates automatically
- **Visual indicators**: Loading spinner shows when refreshing
- **Error handling**: Displays error messages if any data source fails

## 🎨 UI Features

### Design Elements
- **Rounded Cards**: Modern card-based layout
- **Soft Shadows**: Subtle depth with shadow effects
- **Color-coded Status**: Green (success), red (failed), blue (running)
- **Responsive Grid**: Adapts to different screen sizes
- **Loading States**: Smooth loading animations

### Icons & Visual Cues
- **📊 Analytics Icon**: For workflows
- **⚡ Execution Icon**: For executions
- **✅ Success Icon**: For success rate
- **⏱️ Time Icon**: For response time
- **📋 Sheet Icon**: For Google Sheets data

## 🔄 Real-time Updates

The dashboard automatically refreshes every 5 seconds:

1. **Stats Cards** update with latest numbers
2. **Charts** refresh with new data points
3. **Recent Activity** shows newest entries
4. **Error handling** maintains stability if any API fails

## 🛠️ Customization

### Adding New Stats
To add a new stat card, modify the `fetchStatsData()` function in `SaaSDashboard.js`:

```javascript
// Add your custom stat calculation
const customStat = await fetchCustomData()

setStats(prevStats => ({
  ...prevStats,
  customStat
}))
```

### Custom Charts
Add new charts by:
1. Installing chart type: `npm install recharts`
2. Import the chart component
3. Add data processing function
4. Update the charts grid layout

### Styling Changes
Modify Tailwind classes in the component:
- **Card colors**: Change `bg-white` to `bg-gray-100`, etc.
- **Accent colors**: Update icon backgrounds (`bg-blue-100`, etc.)
- **Layout**: Adjust grid columns (`grid-cols-5`, etc.)

## 🐛 Troubleshooting

### Common Issues

#### Dashboard shows loading forever
- Check Supabase connection and environment variables
- Verify `workflow_logs` table exists
- Check browser console for error messages

#### Charts not displaying
- Ensure Recharts is installed: `npm install recharts`
- Check that data is being fetched correctly
- Verify chart data format matches expected structure

#### Google Sheets data not showing
- Verify Google Sheets API credentials
- Check that sheet ID is correct
- Ensure service account has access to the sheet

#### Stats cards show zeros
- Check that Supabase table has data
- Verify N8N API is accessible
- Check network requests in browser dev tools

### Debug Mode
Add console logging to track data flow:

```javascript
console.log('Stats data:', stats)
console.log('Chart data:', chartData)
console.log('Recent activity:', recentActivity)
```

## 🚀 Production Deployment

### Performance Optimization
1. **Database indexing**: Ensure indexes exist on frequently queried columns
2. **API caching**: Consider caching API responses for better performance
3. **Error boundaries**: Add React error boundaries for better error handling

### Security
1. **Environment variables**: Never commit `.env.local` to version control
2. **API limits**: Implement rate limiting for production
3. **Authentication**: Add user authentication if needed

### Monitoring
1. **Error tracking**: Set up error monitoring (Sentry, etc.)
2. **Performance**: Monitor API response times
3. **Uptime**: Set up uptime monitoring for your APIs

---

🎉 **Your SaaS Dashboard is ready!** 

The dashboard provides a comprehensive view of your system with beautiful visualizations, real-time updates, and a modern UI that works great on both desktop and mobile devices.

