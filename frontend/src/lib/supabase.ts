import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jinvvpncssntrttaajrb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbnZ2cG5jc3NudHJ0dGFhanJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyOTQ2MjgsImV4cCI6MjA1Njg3MDYyOH0.KhdLWI7XtqTA3II3zEDhqkDTX7-0ZnzxBh-b7eScK9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 