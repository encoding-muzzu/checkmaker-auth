
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dhgseybgaswdryynnomz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZ3NleWJnYXN3ZHJ5eW5ub216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NzY1MzcsImV4cCI6MjA1NTA1MjUzN30.nmbxHHpWAOweYiM3OsgcUcfvYn8AO_L4VVesEAOOz-E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});
