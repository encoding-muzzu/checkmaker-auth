
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create 'uploads' bucket for uploaded Excel files
    await supabase.storage.createBucket('uploads', {
      public: false,
      fileSizeLimit: 5242880, // 5MB
    });

    // Create 'exports' bucket for exported Excel files
    await supabase.storage.createBucket('exports', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });

    return new Response(
      JSON.stringify({ message: "Storage buckets created successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating storage buckets:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred creating storage buckets" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
