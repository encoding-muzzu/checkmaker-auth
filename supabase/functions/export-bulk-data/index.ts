
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

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

    // Get all applications with status_id = 5 (Bulk Processing)
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id, 
        application_number,
        arn, 
        kit_no, 
        customer_name, 
        pan_number, 
        total_amount_loaded, 
        customer_type, 
        product_variant, 
        card_type, 
        processing_type, 
        itr_flag, 
        lrs_amount_consumed
      `)
      .eq("status_id", 5);

    if (error) {
      console.error("Error fetching applications:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch applications" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!applications || applications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No bulk processing applications found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(applications);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    // Convert to binary string
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Convert to base64
    const base64 = btoa(
      String.fromCharCode.apply(null, new Uint8Array(excelBuffer))
    );

    // Create a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `bulk_applications_${timestamp}.xlsx`;

    // Store the file in Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("exports")
      .upload(filename, excelBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

    if (fileError) {
      console.error("Error uploading file:", fileError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file", data: base64, filename }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Generate a public URL for the file
    const { data: urlData } = await supabase.storage
      .from("exports")
      .getPublicUrl(filename);

    return new Response(
      JSON.stringify({
        message: "Excel file generated successfully",
        data: base64,
        filename,
        fileUrl: urlData?.publicUrl,
        count: applications.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
