import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tyrncmjvfrblogwwfpzc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cm5jbWp2ZnJibG9nd3dmcHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NzA0MTcsImV4cCI6MjA1NTQ0NjQxN30.9oI1423XxZqsHDWOseFASJ-ReMxWASEgwmWEAu-O0zU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);