import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client with service role key
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBucket() {
  try {
    console.log('Creating bucket...')
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    })

    if (error) {
      console.error('Error creating bucket:', error)
    } else {
      console.log('Bucket created successfully:', data)
    }

    // List buckets to verify
    console.log('Listing buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
    } else {
      console.log('Buckets:', buckets)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

// Run the function
createBucket() 