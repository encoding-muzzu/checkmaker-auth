
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
    const formData = await req.formData();
    const file = formData.get("file");
    const makerNumber = formData.get("makerNumber");
    const userId = formData.get("userId");

    if (!file || !makerNumber || !userId) {
      return new Response(
        JSON.stringify({ error: "File, makerNumber, and userId are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Invalid file" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `maker${makerNumber}_${timestamp}_${file.name}`;

    // Upload the file to storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

    if (fileError) {
      console.error("Error uploading file:", fileError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Save file metadata to database
    const { data: metaData, error: metaError } = await supabase
      .from("bulk_processing_files")
      .insert({
        file_name: file.name,
        file_path: filePath,
        uploaded_by: userId,
        maker_number: parseInt(makerNumber as string),
      })
      .select()
      .single();

    if (metaError) {
      console.error("Error saving file metadata:", metaError);
      return new Response(
        JSON.stringify({ error: "Failed to save file metadata" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Check if we have files from both makers
    const { data: files, error: filesError } = await supabase
      .from("bulk_processing_files")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (filesError) {
      console.error("Error fetching files:", filesError);
    }

    let maker1File = null;
    let maker2File = null;

    if (files && files.length >= 2) {
      maker1File = files.find(f => f.maker_number === 1);
      maker2File = files.find(f => f.maker_number === 2);
    }

    // If we have files from both makers, trigger the comparison process
    let comparisonTriggered = false;
    if (maker1File && maker2File) {
      comparisonTriggered = true;
      
      // This will be processed asynchronously
      supabase.functions.invoke("process-bulk-data", {
        body: {
          maker1FileId: maker1File.id,
          maker2FileId: maker2File.id
        }
      }).catch(err => {
        console.error("Error triggering bulk processing:", err);
      });
    }

    return new Response(
      JSON.stringify({
        message: "File uploaded successfully",
        file: metaData,
        comparisonTriggered,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
