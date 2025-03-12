
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate Excel data function
function validateExcelData(data: any[]) {
  if (!data || data.length === 0) {
    return { valid: false, error: "File is empty or could not be parsed" };
  }

  // Check for required columns
  const firstRow = data[0];
  const requiredColumns = ["itr_flag", "lrs_amount_consumed"];
  
  for (const column of requiredColumns) {
    if (!(column in firstRow)) {
      return { valid: false, error: `Required column '${column}' is missing` };
    }
  }

  // Validate itr_flag values (should be Y or N)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const itrFlag = String(row.itr_flag).trim().toUpperCase();
    
    if (itrFlag !== 'Y' && itrFlag !== 'N') {
      return { 
        valid: false, 
        error: "itr_flag is not correct" 
      };
    }
  }

  // Validate lrs_amount_consumed values (should be numeric)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const lrsAmount = row.lrs_amount_consumed;
    
    // Check if the value is a number or can be converted to one
    if (lrsAmount === undefined || lrsAmount === null || 
        (typeof lrsAmount !== 'number' && isNaN(Number(lrsAmount)))) {
      return { 
        valid: false, 
        error: "lrs_amount should be numeric or decimal values" 
      };
    }
  }

  return { valid: true, error: null };
}

serve(async (req) => {
  console.log("Processing process-bulk-data function");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the file and maker info from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileId = formData.get("fileId") as string;
    const makerType = formData.get("makerType") as string; // maker or checker
    
    console.log(`Processing ${makerType} upload for file ID: ${fileId}`);
    
    if (!file || !fileId || !makerType) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: "Missing required parameters (file, fileId, or makerType)" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Initialize Supabase client with the authorization token from the request
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const authorization = req.headers.get('Authorization');
    
    if (!authorization) {
      console.error("No authorization token provided");
      return new Response(
        JSON.stringify({ error: "No authorization token provided" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 401 
        }
      );
    }
    
    // Extract token from Authorization header (Bearer token)
    const token = authorization.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Fetch the current user from the session using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("User not authenticated:", userError);
      return new Response(
        JSON.stringify({ error: "User not authenticated", details: userError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 401 
        }
      );
    }

    const userId = user.id;
    console.log(`User ID: ${userId}`);

    // Get the file details from the bulk_file_processing table
    const { data: fileDetails, error: fetchError } = await supabase
      .from("bulk_file_processing")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError) {
      console.error("Error fetching file details:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch file details", details: fetchError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("File details:", fileDetails);

    // Check if the file has been processed already by the appropriate role
    const makerProcessed = fileDetails.maker_processed;
    const checkerProcessed = fileDetails.checker_processed;

    // Validate maker type and file status
    if (makerType === "maker" && makerProcessed) {
      console.error("File already processed by Maker");
      return new Response(
        JSON.stringify({ error: "File already processed by Maker" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    if (makerType === "checker" && !makerProcessed) {
      console.error("File must be processed by Maker first");
      return new Response(
        JSON.stringify({ error: "File must be processed by Maker first" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    if (makerType === "checker" && checkerProcessed) {
      console.error("File already processed by Checker");
      return new Response(
        JSON.stringify({ error: "File already processed by Checker" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Read the file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Parsed ${data.length} rows from Excel file`);

    // Validate the data before proceeding
    const validation = validateExcelData(data);
    if (!validation.valid) {
      console.error("Data validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Generate a new filename
    const originalPath = fileDetails.file_path;
    const pathParts = originalPath.split("/");
    const originalFileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExt = originalFileName.split(".")[0];
    
    const newFileName = makerType === "maker" 
      ? `${fileNameWithoutExt}_maker.xlsx` 
      : `${fileNameWithoutExt}_checker.xlsx`;
    
    const newFilePath = `exports/${newFileName}`;
    
    console.log(`New file path: ${newFilePath}`);

    // Create a new workbook with the parsed data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    
    // Generate Excel file
    const excelOutput = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    
    // Upload the new Excel file to Supabase Storage
    // For storage operations, we need to use the service role key
    // because the current user might not have permissions to upload to storage
    const adminSupabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );
    
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from("bulk-files")
      .upload(newFilePath, excelOutput, {
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

    console.log("New Excel file uploaded successfully");

    // Get public URL for the file
    const { data: publicUrl } = adminSupabase.storage
      .from("bulk-files")
      .getPublicUrl(newFilePath);

    // Determine the status based on the processing state
    let newStatus = makerType === "maker" 
      ? "processed_by_maker" 
      : "bulk_processed_successfully";

    // Update the bulk_file_processing record
    const updateData = makerType === "maker" 
      ? {
          maker_processed: true,
          maker_processed_at: new Date().toISOString(),
          maker_user_id: userId,
          status: "processed_by_maker"
        }
      : {
          checker_processed: true,
          checker_processed_at: new Date().toISOString(),
          checker_user_id: userId,
          status: "bulk_processed_successfully"
        };

    console.log("Updating bulk_file_processing record:", updateData);
    
    // Using the user's token to update the record, respecting RLS policies
    const { error: updateError } = await supabase
      .from("bulk_file_processing")
      .update(updateData)
      .eq("id", fileId);

    if (updateError) {
      console.error("Error updating bulk_file_processing record:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update bulk_file_processing record", details: updateError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("bulk_file_processing record updated successfully");
    
    return new Response(
      JSON.stringify({ 
        message: `File processed successfully by ${makerType === "maker" ? "Maker" : "Checker"}`, 
        file_path: newFilePath,
        file_url: publicUrl.publicUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error in process-bulk-data function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
