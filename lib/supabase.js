import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logs to confirm environment variables are loading
console.log('Supabase URL loaded:', supabaseUrl ? 'Present' : 'Missing')
console.log('Supabase Key loaded:', supabaseAnonKey ? 'Present' : 'Missing')

// Check if environment variables are set
if (!supabaseUrl) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

// Create client with fallback values if environment variables are missing
export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
)
