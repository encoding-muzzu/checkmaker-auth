import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Processing export-bulk-data function");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching applications with status_id = 5");
    
    // Fetch applications with status_id = 5
    const { data: applications, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("status_id", 5);

    if (fetchError) {
      console.error("Error fetching applications:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch applications", details: fetchError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log(`Found ${applications?.length || 0} applications with status_id = 5`);
    
    // If no applications with status_id = 5, return early
    if (!applications || applications.length === 0) {
      console.log("No applications with status_id = 5 found, exiting");
      return new Response(
        JSON.stringify({ message: "No applications with status_id = 5 found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert applications to worksheet format
    const ws = XLSX.utils.json_to_sheet(applications);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    
    // Generate Excel file
    const excelOutput = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    
    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `applications_${timestamp}.xlsx`;
    const filePath = `exports/${fileName}`;
    
    console.log(`Uploading Excel file to ${filePath}`);
    
    // Upload Excel file to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("bulk-files") // Changed from "bulk-files" to "bulk-files" for consistency
      .upload(filePath, excelOutput, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading Excel file:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload Excel file", details: uploadError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("Excel file uploaded successfully");
    
    // Get public URL for the file
    const { data: publicUrl } = supabase.storage
      .from("bulk-files") // Changed from "bulk-files" to "bulk-files" for consistency
      .getPublicUrl(filePath);

    console.log(`Creating record in bulk_file_processing table for ${fileName}`);
    
    // Create record in bulk_file_processing table
    const { error: insertError } = await supabase
      .from("bulk_file_processing")
      .insert({
        file_name: fileName,
        file_path: filePath,
        status: "pending",
        record_count: applications.length
      });

    if (insertError) {
      console.error("Error creating record in bulk_file_processing:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create record in bulk_file_processing", details: insertError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("Record created in bulk_file_processing");
    console.log("Updating status_id of processed applications to 6");
    
    // Update status_id of all processed applications to 6
    const appIds = applications.map(app => app.id);
    const { error: updateError } = await supabase
      .from("applications")
      .update({ status_id: 6 })
      .in("id", appIds);

    if (updateError) {
      console.error("Error updating application status_id:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update application status_id", details: updateError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("Successfully updated status_id of processed applications to 6");
    
    return new Response(
      JSON.stringify({ 
        message: "Excel file created and uploaded successfully", 
        file_path: filePath,
        file_url: publicUrl.publicUrl,
        processed_applications: applications.length
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error in export-bulk-data function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
