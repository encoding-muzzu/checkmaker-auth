
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const makerType = formData.get("makerType") as string; // maker1 or maker2
    
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("User not authenticated");
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 401 
        }
      );
    }

    const userId = session.user.id;
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

    // Validate maker type and file status
    if (makerType === "maker1" && fileDetails.maker1_processed) {
      console.error("File already processed by Maker 1");
      return new Response(
        JSON.stringify({ error: "File already processed by Maker 1" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    if (makerType === "maker2" && !fileDetails.maker1_processed) {
      console.error("File must be processed by Maker 1 first");
      return new Response(
        JSON.stringify({ error: "File must be processed by Maker 1 first" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    if (makerType === "maker2" && fileDetails.maker2_processed) {
      console.error("File already processed by Maker 2");
      return new Response(
        JSON.stringify({ error: "File already processed by Maker 2" }),
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

    // Generate a new filename
    const originalPath = fileDetails.file_path;
    const pathParts = originalPath.split("/");
    const originalFileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExt = originalFileName.split(".")[0];
    
    const newFileName = makerType === "maker1" 
      ? `${fileNameWithoutExt}_maker1.xlsx` 
      : `${fileNameWithoutExt}_maker2.xlsx`;
    
    const newFilePath = `exports/${newFileName}`;
    
    console.log(`New file path: ${newFilePath}`);

    // Create a new workbook with the parsed data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    
    // Generate Excel file
    const excelOutput = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    
    // Upload the new Excel file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
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
    const { data: publicUrl } = supabase.storage
      .from("bulk-files")
      .getPublicUrl(newFilePath);

    // Update the bulk_file_processing record
    const updateData = makerType === "maker1" 
      ? {
          maker1_processed: true,
          maker1_processed_at: new Date().toISOString(),
          maker1_user_id: userId,
          status: "processed_by_maker1"
        }
      : {
          maker2_processed: true,
          maker2_processed_at: new Date().toISOString(),
          maker2_user_id: userId,
          status: "processed_by_maker2"
        };

    console.log("Updating bulk_file_processing record:", updateData);
    
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
        message: `File processed successfully by ${makerType}`, 
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
