# 🔧 File Upload Troubleshooting Guide

## Common Issues and Solutions

### 1. "Upload failed: Bucket not found"

**Problem**: The Supabase storage bucket doesn't exist.

**Solutions**:

#### Option A: Manual Setup (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** → **Buckets**
3. Click **"New Bucket"**
4. Settings:
   - **Name**: `client-files`
   - **Public**: `false` (unchecked)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: 
     ```
     text/csv
     application/json
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     ```

#### Option B: SQL Setup
Run this in your Supabase SQL Editor:
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload client files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can view their client files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-files');
```

### 2. "Upload failed: Table 'uploaded_files' doesn't exist"

**Problem**: The database table for tracking uploads doesn't exist.

**Solution**: Run this SQL in your Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  parsed_data JSONB,
  n8n_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_files_client_id ON uploaded_files(client_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can access their uploaded files" ON uploaded_files
  FOR ALL USING (true) WITH CHECK (true);
```

### 3. File uploads work but don't appear in dashboard

**Problem**: Files are uploaded but not showing in the "Uploaded Files" section.

**Solutions**:
1. **Check browser console** for any JavaScript errors
2. **Verify table exists** and has data:
   ```sql
   SELECT * FROM uploaded_files ORDER BY created_at DESC;
   ```
3. **Refresh the page** or wait for auto-refresh (5 seconds)

### 4. N8N webhook errors

**Problem**: Files upload but n8n processing fails.

**Solutions**:
1. **Check your webhook URL** in `.env.local`:
   ```env
   NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/upload-data
   ```
2. **Test webhook manually**:
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/upload-data \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```
3. **Skip n8n for now**: Remove the webhook URL from `.env.local` to disable n8n integration

### 5. File parsing errors

**Problem**: "Failed to parse file" errors.

**Solutions**:
1. **Check file format**:
   - CSV: Must have headers in first row
   - Excel: Only `.xls` and `.xlsx` supported
   - JSON: Must be valid JSON format
2. **File size**: Must be under 10MB
3. **File encoding**: Use UTF-8 encoding

### 6. Permission errors

**Problem**: "Access denied" or "Unauthorized" errors.

**Solutions**:
1. **Check Supabase RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'uploaded_files';
   ```
2. **Verify storage policies**:
   - Go to Supabase Dashboard → Storage → Policies
   - Ensure policies allow INSERT, SELECT, DELETE for `client-files` bucket

### 7. Environment variables missing

**Problem**: Dashboard shows "No configuration" messages.

**Solution**: Check your `.env.local` file has:
```env
# Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional for n8n integration
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/upload-data

# Optional for enhanced features
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Quick Test

To verify everything is working:

1. **Upload a test CSV file**:
   ```csv
   name,email,status
   John Doe,john@example.com,active
   Jane Smith,jane@example.com,inactive
   ```

2. **Check the browser console** for any errors

3. **Verify the file appears** in the "Uploaded Files" section

4. **Check Supabase directly**:
   ```sql
   SELECT file_name, status, created_at FROM uploaded_files ORDER BY created_at DESC LIMIT 5;
   ```

## Still Having Issues?

1. **Check browser developer tools** (F12) → Console tab for errors
2. **Verify Supabase connection** by testing other dashboard features
3. **Test with a simple CSV file** first before trying Excel/JSON
4. **Disable n8n integration temporarily** by removing the webhook URL

## Working Without Supabase Storage

If you can't set up Supabase storage, the system will work in "fallback mode":
- ✅ File parsing still works
- ✅ Data is still sent to n8n
- ✅ Files tracked in local memory
- ❌ Files not permanently stored
- ❌ File history lost on page refresh

This is fine for testing and development!


