import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emioaqamotrycdonsswv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaW9hcWFtb3RyeWNkb25zc3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTg1MzAsImV4cCI6MjA4MDkzNDUzMH0.ARIB-gbtSz_Bk4l3tj_34GkzRWL-0grI2XDPGfkYU5g';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});