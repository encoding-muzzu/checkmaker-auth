
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  console.log("Export bulk data function called");
  
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      throw new Error("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created successfully");
    
    // Check if bucket exists and create if not
    console.log("Checking if bulk-files bucket exists");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError.message);
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'bulk-files');
    console.log(`Bucket 'bulk-files' exists: ${bucketExists}`);
    
    if (!bucketExists) {
      console.log("Creating 'bulk-files' bucket");
      const { error: createBucketError } = await supabase.storage.createBucket('bulk-files', {
        public: true
      });
      
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError.message);
        throw createBucketError;
      }
      console.log("'bulk-files' bucket created successfully");
    }
    
    // Find all applications in status_id 5 (bulk processing)
    console.log("Fetching applications with status_id = 5");
    const { data: applications, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('status_id', 5);
    
    if (fetchError) {
      console.error("Error fetching applications:", fetchError.message);
      throw fetchError;
    }
    
    console.log(`Found ${applications?.length || 0} applications with status_id = 5`);
    
    if (!applications || applications.length === 0) {
      console.log("No applications found in bulk processing status");
      return new Response(
        JSON.stringify({ 
          message: "No applications found in bulk processing status",
          count: 0 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Create Excel workbook
    console.log("Creating Excel workbook");
    const workbook = XLSX.utils.book_new();
    
    // Convert applications to worksheet
    const worksheet = XLSX.utils.json_to_sheet(applications.map(app => ({
      id: app.id,
      arn: app.arn,
      kit_no: app.kit_no,
      customer_name: app.customer_name,
      pan_number: app.pan_number,
      total_amount_loaded: app.total_amount_loaded,
      lrs_amount_consumed: app.lrs_amount_consumed || 0,
      itr_flag: app.itr_flag || "",
      customer_type: app.customer_type,
      product_variant: app.product_variant,
      card_type: app.card_type,
    })));
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Processing");
    
    // Generate Excel file
    const excelData = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    console.log("Excel workbook generated successfully");
    
    // Create filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `bulk_export_${timestamp}.xlsx`;
    const filePath = `exports/${fileName}`;
    console.log(`File will be saved as: ${filePath}`);
    
    // Upload to Storage
    console.log("Uploading file to storage");
    const { error: uploadError } = await supabase.storage
      .from('bulk-files')
      .upload(filePath, Uint8Array.from(atob(excelData), c => c.charCodeAt(0)), {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError.message);
      throw uploadError;
    }
    console.log("File uploaded to storage successfully");
    
    // Record in auto_generated_files table
    console.log("Recording file in auto_generated_files table");
    const { error: recordError } = await supabase
      .from('auto_generated_files')
      .insert({
        file_name: fileName,
        file_path: filePath,
        record_count: applications.length,
        is_auto_generated: true
      });
    
    if (recordError) {
      console.error("Error recording file in database:", recordError.message);
      throw recordError;
    }
    console.log("File recorded in auto_generated_files table successfully");
    
    // Return success response
    console.log("Returning success response");
    return new Response(
      JSON.stringify({
        message: "Bulk export completed successfully",
        count: applications.length,
        filename: fileName,
        data: excelData
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in export-bulk-data function:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
