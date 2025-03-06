import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
  try {
    // Create a bucket named 'documents'
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: true, // Make the bucket public
      fileSizeLimit: 10485760, // 10MB file size limit
    })

    if (error) {
      console.error('Error creating bucket:', error)
    } else {
      console.log('Bucket created successfully:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

// Run the function
createBucket() 