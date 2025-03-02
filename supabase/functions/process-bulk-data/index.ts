
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
    const { maker1FileId, maker2FileId } = await req.json();

    if (!maker1FileId || !maker2FileId) {
      return new Response(
        JSON.stringify({ error: "Both maker1FileId and maker2FileId are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get both files
    const { data: maker1File, error: maker1Error } = await supabase
      .from("bulk_processing_files")
      .select("*")
      .eq("id", maker1FileId)
      .single();

    if (maker1Error || !maker1File) {
      return new Response(
        JSON.stringify({ error: "Maker 1 file not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    const { data: maker2File, error: maker2Error } = await supabase
      .from("bulk_processing_files")
      .select("*")
      .eq("id", maker2FileId)
      .single();

    if (maker2Error || !maker2File) {
      return new Response(
        JSON.stringify({ error: "Maker 2 file not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Download both files from storage
    const { data: maker1Data, error: maker1DownloadError } = await supabase.storage
      .from("uploads")
      .download(maker1File.file_path);

    if (maker1DownloadError || !maker1Data) {
      return new Response(
        JSON.stringify({ error: "Failed to download Maker 1 file" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const { data: maker2Data, error: maker2DownloadError } = await supabase.storage
      .from("uploads")
      .download(maker2File.file_path);

    if (maker2DownloadError || !maker2Data) {
      return new Response(
        JSON.stringify({ error: "Failed to download Maker 2 file" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Parse Excel files
    const maker1Workbook = XLSX.read(await maker1Data.arrayBuffer(), { type: "array" });
    const maker2Workbook = XLSX.read(await maker2Data.arrayBuffer(), { type: "array" });

    const maker1Sheet = maker1Workbook.Sheets[maker1Workbook.SheetNames[0]];
    const maker2Sheet = maker2Workbook.Sheets[maker2Workbook.SheetNames[0]];

    const maker1Records = XLSX.utils.sheet_to_json(maker1Sheet);
    const maker2Records = XLSX.utils.sheet_to_json(maker2Sheet);

    // Compare records and process them
    const results = [];
    const maker2RecordsMap = new Map();

    // Create a map of maker2 records by ID for easier comparison
    maker2Records.forEach((record: any) => {
      maker2RecordsMap.set(record.id, record);
    });

    for (const maker1Record of maker1Records) {
      const record = maker1Record as any;
      const maker2Record = maker2RecordsMap.get(record.id);

      if (!maker2Record) {
        console.error(`Record with ID ${record.id} not found in Maker 2's file`);
        continue;
      }

      // Compare the values
      const itrFlagMatch = String(record.itr_flag).toLowerCase() === String(maker2Record.itr_flag).toLowerCase();
      const lrsAmountMatch = parseFloat(record.lrs_amount_consumed || 0) === parseFloat(maker2Record.lrs_amount_consumed || 0);
      const totalAmountMatch = parseFloat(record.total_amount_loaded || 0) === parseFloat(maker2Record.total_amount_loaded || 0);

      let status;
      let message = "";

      if (itrFlagMatch && lrsAmountMatch && totalAmountMatch) {
        // All values match - approved
        status = "Approved";
      } else {
        // Values don't match - discrepancy
        status = "Discrepancy";
        const discrepancies = [];
        
        if (!itrFlagMatch) {
          discrepancies.push(`ITR Flag: Maker 1 (${record.itr_flag}) vs Maker 2 (${maker2Record.itr_flag})`);
        }
        
        if (!lrsAmountMatch) {
          discrepancies.push(`LRS Amount: Maker 1 (${record.lrs_amount_consumed}) vs Maker 2 (${maker2Record.lrs_amount_consumed})`);
        }
        
        if (!totalAmountMatch) {
          discrepancies.push(`Total Amount: Maker 1 (${record.total_amount_loaded}) vs Maker 2 (${maker2Record.total_amount_loaded})`);
        }
        
        message = `Discrepancies found: ${discrepancies.join("; ")}`;
      }

      // Store result
      const result = {
        application_id: record.id,
        status,
        message,
        maker1_file_id: maker1FileId,
        maker2_file_id: maker2FileId,
        maker1_itr_flag: record.itr_flag,
        maker1_lrs_amount: parseFloat(record.lrs_amount_consumed || 0),
        maker1_total_amount: parseFloat(record.total_amount_loaded || 0),
        maker2_itr_flag: maker2Record.itr_flag,
        maker2_lrs_amount: parseFloat(maker2Record.lrs_amount_consumed || 0),
        maker2_total_amount: parseFloat(maker2Record.total_amount_loaded || 0)
      };

      results.push(result);

      // Update application status based on the result
      if (status === "Approved") {
        // Update to approved status (2)
        await supabase
          .from("applications")
          .update({
            status_id: 2,
            status: "Approved",
            itr_flag: record.itr_flag,
            lrs_amount_consumed: parseFloat(record.lrs_amount_consumed || 0)
          })
          .eq("id", record.id);

        // Call process-dbops function for approved applications
        await supabase.functions.invoke("process-dbops", {
          body: {
            application_number: record.application_number,
            kit_no: record.kit_no,
            lrs_value: record.lrs_amount_consumed.toString(),
            itr_flag: record.itr_flag,
            old_status: 5,
            new_status: 2
          }
        });
      } else if (status === "Discrepancy") {
        // Move to discrepancy status (6)
        await supabase
          .from("applications")
          .update({
            status_id: 6,
            status: "Discrepancy"
          })
          .eq("id", record.id);

        // Add a comment about the discrepancy
        await supabase
          .from("application_comments")
          .insert({
            application_id: record.id,
            comment: message,
            type: "discrepancy"
          });
      }
    }

    // Insert all results
    const { error: resultsError } = await supabase
      .from("bulk_processing_results")
      .insert(results);

    if (resultsError) {
      console.error("Error inserting results:", resultsError);
      return new Response(
        JSON.stringify({ error: "Failed to save processing results" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Update file statuses
    await supabase
      .from("bulk_processing_files")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .in("id", [maker1FileId, maker2FileId]);

    return new Response(
      JSON.stringify({
        message: "Bulk processing completed successfully",
        approved: results.filter(r => r.status === "Approved").length,
        discrepancies: results.filter(r => r.status === "Discrepancy").length
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
