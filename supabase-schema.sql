-- Create workflow_logs table for the SaaS Dashboard
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS workflow_logs (
  id SERIAL PRIMARY KEY,
  workflow_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  execution_time INTEGER DEFAULT 0, -- in milliseconds
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created_at ON workflow_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow_name ON workflow_logs(workflow_name);

-- Insert some sample data for testing (optional)
INSERT INTO workflow_logs (workflow_name, status, execution_time, message) VALUES
('Email Campaign', 'success', 1200, 'Campaign sent successfully'),
('Data Backup', 'success', 3400, 'Backup completed'),
('Payment Processing', 'failed', 800, 'Payment gateway timeout'),
('User Analytics', 'success', 2100, 'Analytics updated'),
('Notification System', 'success', 650, 'Notifications sent'),
('Database Cleanup', 'success', 4200, 'Cleanup completed'),
('API Sync', 'failed', 1800, 'API rate limit exceeded'),
('Report Generation', 'success', 2800, 'Reports generated'),
('Security Scan', 'success', 1500, 'No threats detected'),
('Content Moderation', 'success', 950, 'Content reviewed')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust according to your needs)
CREATE POLICY "Allow all operations on workflow_logs" ON workflow_logs
  FOR ALL USING (true) WITH CHECK (true);

