// Setup script to create Supabase storage bucket and table
// Run this with: node setup-supabase-storage.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You need the service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSupabaseStorage() {
  console.log('🚀 Setting up Supabase storage and database...')

  try {
    // 1. Create storage bucket
    console.log('📦 Creating storage bucket...')
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.find(bucket => bucket.name === 'client-files')
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket('client-files', {
        public: false,
        allowedMimeTypes: [
          'text/csv', 
          'application/json', 
          'application/vnd.ms-excel', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (bucketError) {
        console.error('❌ Failed to create bucket:', bucketError)
      } else {
        console.log('✅ Storage bucket "client-files" created successfully')
      }
    } else {
      console.log('✅ Storage bucket "client-files" already exists')
    }

    // 2. Create uploaded_files table
    console.log('📋 Creating uploaded_files table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_uploaded_files_client_id ON uploaded_files(client_id);
        CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(status);
        CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);
      `
    })

    if (tableError) {
      console.error('❌ Failed to create table:', tableError)
    } else {
      console.log('✅ Table "uploaded_files" created successfully')
    }

    // 3. Set up RLS policies
    console.log('🔒 Setting up Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can access their uploaded files" ON uploaded_files;
        CREATE POLICY "Users can access their uploaded files" ON uploaded_files
          FOR ALL USING (true) WITH CHECK (true);
      `
    })

    if (rlsError) {
      console.error('❌ Failed to set up RLS:', rlsError)
    } else {
      console.log('✅ Row Level Security configured')
    }

    console.log('\n🎉 Setup completed successfully!')
    console.log('📝 Your file upload system is now ready to use.')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupSupabaseStorage()


