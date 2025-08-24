# 🚀 SaaS Dashboard - Next.js App

A modern, real-time analytics dashboard built with Next.js 15, TypeScript, Tailwind CSS, and integrated with Supabase, Google Sheets, and N8N.

## ✨ Features

- **Real-time Analytics**: Live stats cards with workflow metrics
- **Interactive Charts**: Line charts, pie charts, and bar charts using Recharts
- **File Upload**: CSV/Excel file processing with Supabase storage
- **Google Sheets Integration**: Live data from Google Sheets API
- **N8N Workflow Monitoring**: Track workflow executions and status
- **Auto-refresh**: Dashboard updates every 5 seconds
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **File Processing**: Papa Parse, XLSX
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)

### Manual Deployment Steps:

1. **Fork/Clone this repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Set Environment Variables** in Vercel Dashboard:

## 🔧 Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

### Required (Supabase)
```env
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

### Optional (Google Sheets)
```env
REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_SHEET_ID=your-google-sheet-id
```

### Optional (N8N Integration)
```env
REACT_APP_N8N_URL=your-n8n-instance-url
REACT_APP_N8N_API_KEY=your-n8n-api-key
REACT_APP_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

## 🔧 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd your-repo-name
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📊 Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run this SQL in your Supabase SQL Editor:

```sql
-- Create workflow_logs table
CREATE TABLE workflow_logs (
  id SERIAL PRIMARY KEY,
  workflow_name VARCHAR(255),
  status VARCHAR(50),
  execution_time INTEGER,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create uploaded_files table
CREATE TABLE uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  client_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO workflow_logs (workflow_name, status, execution_time, message) VALUES
('Email Campaign', 'success', 45, 'Campaign sent successfully'),
('Data Backup', 'failed', 120, 'Database connection timeout'),
('Payment Processing', 'success', 15, 'Processed 25 transactions'),
('User Analytics', 'success', 180, 'Generated monthly report'),
('Notification System', 'failed', 30, 'SMTP server unavailable');
```

## 🔗 API Integrations

### Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a service account
3. Download the JSON credentials
4. Share your Google Sheet with the service account email
5. Add the credentials to your environment variables

### N8N Integration

1. Set up an N8N instance
2. Create webhook endpoints
3. Configure the webhook URLs in environment variables

## 📂 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── FileUploadModal.js
│   ├── Layout.js
│   └── WorkflowLogs.js
├── lib/                   # Utility libraries
│   └── supabase.js       # Supabase client
├── pages/api/             # API routes
│   ├── executions.js     # N8N executions
│   ├── sheet.js          # Google Sheets data
│   └── sheets.js         # Google Sheets API
├── public/               # Static assets
├── styles/               # Global styles
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS config
└── vercel.json          # Vercel deployment config
```

## 🎯 Features Overview

### Dashboard Stats
- **Total Workflows**: Count from N8N API
- **Total Executions**: Count from Supabase
- **Success Rate**: Calculated percentage
- **Avg Response Time**: Average execution time
- **Google Sheet Count**: Total rows from sheets

### Charts
- **Executions per Day**: Line chart showing daily activity
- **Success vs Failed**: Pie chart with success rates
- **Sheet Data by Status**: Bar chart from Google Sheets

### Real-time Updates
- Auto-refresh every 5 seconds
- Loading states and error handling
- Toast notifications for user actions

## 🔒 Security Notes

- Environment variables are handled securely
- API keys are never exposed to the client
- CORS is properly configured
- Authentication can be added via Supabase Auth

## 📈 Performance

- Server-side rendering with Next.js
- Optimized images and fonts
- Minimal bundle size
- Edge-optimized deployment on Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review environment variable setup

---
The password for postegsql are

Username: postgres

Password: StrongPassword123!

Database: postgres



**Made with ❤️ using Next.js and deployed on Vercel**

