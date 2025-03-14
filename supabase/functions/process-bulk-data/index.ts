
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced validation function that returns detailed validation results
function validateExcelData(data: any[], originalData: any[] | null) {
  if (!data || data.length === 0) {
    return { 
      valid: false, 
      error: "File is empty or could not be parsed",
      validRecords: 0,
      invalidRecords: 0,
      rowErrors: [] 
    };
  }

  // Check for record count mismatch if originalData is provided
  if (originalData !== null && data.length !== originalData.length) {
    return { 
      valid: false, 
      error: `Record count mismatch. Expected ${originalData.length} records, but found ${data.length} records.`,
      validRecords: 0,
      invalidRecords: data.length,
      rowErrors: [{
        row: 0,
        error: `Record count mismatch. Expected ${originalData.length} records, but found ${data.length} records.`
      }]
    };
  }

  // Check for required columns
  const firstRow = data[0];
  const requiredColumns = ["itr_flag", "lrs_amount_consumed"];
  
  for (const column of requiredColumns) {
    if (!(column in firstRow)) {
      return { 
        valid: false, 
        error: `Required column '${column}' is missing`,
        validRecords: 0,
        invalidRecords: data.length,
        rowErrors: []
      };
    }
  }

  // Check for required unique identifiers
  if (!("arn" in firstRow) || !("pan_number" in firstRow)) {
    return {
      valid: false,
      error: "Required columns 'arn' and/or 'pan_number' are missing",
      validRecords: 0,
      invalidRecords: data.length,
      rowErrors: []
    };
  }

  // Check for duplicate ARN and PAN numbers
  const arnSet = new Set();
  const panSet = new Set();
  const duplicateRecords = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowIndex = i + 2; // Excel row number (1-based + header row)
    const arn = String(row.arn).trim();
    const pan = String(row.pan_number).trim();
    
    if (arnSet.has(arn)) {
      duplicateRecords.push({
        row: rowIndex,
        error: `Duplicate ARN '${arn}' found`
      });
    } else {
      arnSet.add(arn);
    }
    
    if (panSet.has(pan)) {
      duplicateRecords.push({
        row: rowIndex,
        error: `Duplicate PAN Number '${pan}' found`
      });
    } else {
      panSet.add(pan);
    }
  }

  if (duplicateRecords.length > 0) {
    return {
      valid: false,
      error: "Duplicate records found in the uploaded Excel file",
      validRecords: data.length - duplicateRecords.length,
      invalidRecords: duplicateRecords.length,
      rowErrors: duplicateRecords
    };
  }

  // Check if records exist in original data if provided
  if (originalData !== null) {
    const originalArnSet = new Set(originalData.map(row => String(row.arn).trim()));
    const originalPanSet = new Set(originalData.map(row => String(row.pan_number).trim()));
    const missingRecords = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 2; // Excel row number (1-based + header row)
      const arn = String(row.arn).trim();
      const pan = String(row.pan_number).trim();
      
      // Check ARN and PAN numbers separately for more specific error messages
      if (!originalArnSet.has(arn) && !originalPanSet.has(pan)) {
        // Both ARN and PAN are missing
        row.Errors = "ARN and PAN number not found in original file";
        missingRecords.push({
          row: rowIndex,
          error: `ARN '${arn}' and PAN '${pan}' not found in original file`
        });
      } else if (!originalArnSet.has(arn)) {
        // Only ARN is missing
        row.Errors = "ARN not found in original file";
        missingRecords.push({
          row: rowIndex,
          error: `ARN '${arn}' not found in original file`
        });
      } else if (!originalPanSet.has(pan)) {
        // Only PAN is missing
        row.Errors = "PAN number not found in original file";
        missingRecords.push({
          row: rowIndex,
          error: `PAN '${pan}' not found in original file`
        });
      }
    }

    if (missingRecords.length > 0) {
      return {
        valid: false,
        error: "Records not found in the original Excel file",
        validRecords: data.length - missingRecords.length,
        invalidRecords: missingRecords.length,
        rowErrors: missingRecords
      };
    }
  }

  let validRecords = 0;
  let invalidRecords = 0;
  const rowErrors = [];

  // Validate each row and track errors
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowIndex = i + 2; // Excel row number (1-based + header row)
    
    // Validate itr_flag values (should be Y or N)
    const itrFlag = String(row.itr_flag).trim().toUpperCase();
    const isItrFlagValid = itrFlag === 'Y' || itrFlag === 'N';
    
    // Validate lrs_amount_consumed values (should be numeric)
    const lrsAmount = row.lrs_amount_consumed;
    const isLrsAmountValid = !(lrsAmount === undefined || lrsAmount === null || 
      (typeof lrsAmount !== 'number' && isNaN(Number(lrsAmount))));
    
    // Create error message based on validation results
    let rowError = "";
    if (!isItrFlagValid && !isLrsAmountValid) {
      rowError = "itr_flag must be \"Y\" or \"N\". lrs_amount must be a decimal or number.";
    } else if (!isItrFlagValid) {
      rowError = "itr_flag must be \"Y\" or \"N\".";
    } else if (!isLrsAmountValid) {
      rowError = "lrs_amount must be a decimal or number.";
    }
    
    // Add the error to the row in the data
    if (rowError) {
      row.Errors = rowError;
      invalidRecords++;
      rowErrors.push({
        row: rowIndex,
        error: rowError
      });
    } else {
      validRecords++;
      // Set empty error message for valid rows to maintain consistent columns
      row.Errors = "";
    }
  }

  return { 
    valid: invalidRecords === 0, 
    error: invalidRecords > 0 ? `Found ${invalidRecords} records with validation errors` : null,
    validRecords,
    invalidRecords,
    rowErrors
  };
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

    // Get the original file to compare records
    const adminSupabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );
    
    // Download the original file
    const originalFilePath = fileDetails.file_path;
    const { data: originalFileData, error: downloadError } = await adminSupabase.storage
      .from("bulk-files")
      .download(originalFilePath);
      
    if (downloadError) {
      console.error("Error downloading original file:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download original file for validation", details: downloadError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }
    
    // Parse the original file for comparison
    const originalArrayBuffer = await originalFileData.arrayBuffer();
    const originalBuffer = new Uint8Array(originalArrayBuffer);
    const originalWorkbook = XLSX.read(originalBuffer, { type: "array" });
    const originalSheetName = originalWorkbook.SheetNames[0];
    const originalWorksheet = originalWorkbook.Sheets[originalSheetName];
    const originalData = XLSX.utils.sheet_to_json(originalWorksheet);
    
    console.log(`Parsed ${originalData.length} rows from original Excel file`);

    // Validate the data with enhanced validation, comparing with original data
    const validation = validateExcelData(data, originalData);
    
    // If there are validation errors, return the updated file with errors column
    if (!validation.valid) {
      console.log("Validation errors found:", validation.invalidRecords);
      
      // Create a new workbook with the updated data (including errors column)
      const wb = XLSX.utils.book_new();
      
      // Add a worksheet with the data including the Errors column
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Customize the column widths for better readability
      const columnWidths = [];
      for (const key in data[0]) {
        // Set error column to be wider
        columnWidths.push({ wch: key === 'Errors' ? 50 : 15 });
      }
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Applications");
      
      // Generate Excel file with errors
      const excelOutput = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      
      // Generate a validation filename
      const originalFileName = file.name;
      const validationFileName = `validation_${originalFileName}`;
      const validationPath = `validations/${fileId}/${validationFileName}`;
      
      // Upload the validation file
      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from("bulk-files")
        .upload(validationPath, excelOutput, {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          upsert: true
        });

      if (uploadError) {
        console.error("Error uploading validation file:", uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to upload validation file", details: uploadError }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 500 
          }
        );
      }
      
      // Get public URL for the validation file
      const { data: publicUrl } = adminSupabase.storage
        .from("bulk-files")
        .getPublicUrl(validationPath);
      
      // Ensure we're returning a proper response with the correct Content-Type
      const responseData = { 
        valid: false,
        message: validation.error,
        validationResults: {
          fileName: originalFileName,
          totalRecords: data.length,
          validRecords: validation.validRecords,
          invalidRecords: validation.invalidRecords,
          rowErrors: validation.rowErrors,
          validationFilePath: validationPath,
          validationFileUrl: publicUrl.publicUrl
        }
      };
      
      console.log("Sending validation response:", JSON.stringify(responseData));
      
      return new Response(
        JSON.stringify(responseData),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          }, 
          status: 200 
        }
      );
    }

    // If validation passes, proceed with normal processing
    console.log("Validation passed, proceeding with file processing");

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
    
    // Ensure we're returning a proper response with the correct Content-Type
    const responseData = { 
      valid: true,
      message: `File processed successfully by ${makerType === "maker" ? "Maker" : "Checker"}`, 
      file_path: newFilePath,
      file_url: publicUrl.publicUrl
    };
    
    console.log("Sending success response:", JSON.stringify(responseData));
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }, 
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
