
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_supabase_edge

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("Export Bulk Data Function Loaded");

serve(async (req) => {
  console.log("Function invoked:", req.method, req.url);
  
  try {
    // This function will be triggered in two ways:
    // 1. Manual invocation via API call
    // 2. Scheduled invocation via cron
    
    const isScheduled = req.headers.get("Authorization") === null;
    
    // Process the records and update their status
    // Find applications with status_id = 0 that are older than 2 minutes
    if (isScheduled) {
      console.log("Running scheduled task");
      
      // Update status of eligible records
      const { data: updatedApps, error: updateError } = await supabase
        .from("applications")
        .update({ status_id: 5, status: "Bulk Processing" })
        .eq("status_id", 0)
        .lt("created_at", new Date(Date.now() - 2 * 60 * 1000).toISOString())
        .select("*");
      
      if (updateError) {
        console.error("Error updating applications:", updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      console.log(`Updated ${updatedApps?.length || 0} applications to Bulk Processing status`);
      
      // If there are updated applications, generate an Excel file
      if (updatedApps && updatedApps.length > 0) {
        const excelData = await generateExcelFile(updatedApps);
        
        // Store file information in database
        const timestamp = new Date().toISOString();
        const filename = `auto_bulk_export_${timestamp.replace(/[:.]/g, "-")}.xlsx`;
        const filePath = `auto-generated/${filename}`;
        
        // Store file in Supabase Storage
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from("bulk-files")
          .upload(filePath, excelData, {
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
        
        if (storageError) {
          console.error("Error storing file:", storageError);
          return new Response(JSON.stringify({ error: storageError.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
          });
        }
        
        // Store file information in database
        const { data: fileData, error: fileError } = await supabase
          .from("auto_generated_files")
          .insert({
            file_name: filename,
            file_path: filePath,
            record_count: updatedApps.length,
            is_auto_generated: true
          })
          .select()
          .single();
        
        if (fileError) {
          console.error("Error storing file info:", fileError);
        }
        
        console.log(`Generated Excel file ${filename} with ${updatedApps.length} records`);
        
        return new Response(JSON.stringify({ 
          message: "Scheduled task completed", 
          count: updatedApps.length,
          filename
        }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      return new Response(JSON.stringify({ 
        message: "Scheduled task completed, no new records to process"
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // If not scheduled (manual API call), export current bulk processing applications
    console.log("Manual export requested");
    
    // Get all applications in bulk processing status
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id, created_at, updated_at, arn, kit_no, customer_name, 
        pan_number, total_amount_loaded, customer_type, 
        product_variant, card_type, processing_type, 
        itr_flag, status, lrs_amount_consumed, application_number
      `)
      .eq("status_id", 5);
    
    if (error) {
      console.error("Error fetching applications:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log(`Found ${applications.length} applications with Bulk Processing status`);
    
    if (!applications || applications.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No applications found in bulk processing status",
        count: 0
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Generate Excel file
    const excelData = await generateExcelFile(applications);
    
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString();
    const filename = `bulk_export_${timestamp.replace(/[:.]/g, "-")}.xlsx`;
    
    // Convert Excel data to base64 for direct download
    const base64 = btoa(String.fromCharCode(...new Uint8Array(excelData)));
    
    return new Response(JSON.stringify({ 
      message: "Excel file generated successfully", 
      count: applications.length,
      filename,
      data: base64
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function generateExcelFile(applications: any[]) {
  // Format the data for Excel
  const worksheet = XLSX.utils.json_to_sheet(applications.map(app => ({
    ID: app.id,
    ARN: app.arn,
    "Kit Number": app.kit_no,
    "Customer Name": app.customer_name,
    "PAN Number": app.pan_number,
    "Total Amount Loaded": app.total_amount_loaded,
    "LRS Amount": app.lrs_amount_consumed || 0,
    "Customer Type": app.customer_type,
    "Product Variant": app.product_variant,
    "Card Type": app.card_type,
    "Processing Type": app.processing_type,
    "ITR Flag": app.itr_flag || "N",
    "Application Number": app.application_number || "",
    "Status": app.status,
    "Created At": app.created_at,
    "Updated At": app.updated_at
  })));
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
  
  // Generate Excel file as array buffer
  const excelData = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  
  return excelData;
}
