-- Create uploaded_files table for file upload tracking
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, processed, failed
  parsed_data JSONB,
  n8n_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_files_client_id ON uploaded_files(client_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);

-- Create storage bucket for client files
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for client files
CREATE POLICY "Authenticated users can upload client files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can view their client files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can delete their client files" ON storage.objects
  FOR DELETE USING (bucket_id = 'client-files');

-- Enable Row Level Security
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policy for uploaded_files table
CREATE POLICY "Users can access their uploaded files" ON uploaded_files
  FOR ALL USING (true) WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_uploaded_files_updated_at 
    BEFORE UPDATE ON uploaded_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO uploaded_files (file_name, file_path, file_type, file_size, client_id, status, parsed_data) VALUES
('sample-customers.csv', 'demo/sample-customers.csv', 'text/csv', 2048, 'demo-client-123', 'processed', '[{"name": "John Doe", "email": "john@example.com", "status": "active"}]'::jsonb),
('sales-data.xlsx', 'demo/sales-data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 4096, 'demo-client-456', 'processed', '[{"product": "Widget A", "sales": 1000, "month": "January"}]'::jsonb),
('config.json', 'demo/config.json', 'application/json', 1024, 'demo-client-789', 'pending', '{"settings": {"theme": "dark", "notifications": true}}'::jsonb)
ON CONFLICT DO NOTHING;


