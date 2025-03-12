
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { ProcessingRole } from "@/types/bulk-processing";
import * as XLSX from "xlsx";

export const useFileOperations = (currentUserId: string | null, refreshFiles: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();

  const handleUploadClick = (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Validate Excel data
  const validateExcelData = (data: any[]) => {
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
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: ProcessingRole) => {
    const file = e.target.files?.[0];

    if (!file) {
      toast({
        title: "Error",
        description: "No file selected.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadingFileId(fileId);

    try {
      // Validate Excel file content before uploading
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Validate the data before proceeding
      const validation = validateExcelData(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Replace spaces with underscores in the file name
      const sanitizedFileName = file.name.replace(/\s+/g, "_");
      
      const filePath = `bulk_uploads/${fileId}/${makerType}_${sanitizedFileName}`;
      const { error: uploadError } = await supabase.storage
        .from('bulk-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const updateData: any = {
        file_path: filePath,
      };
      
      if (makerType === 'maker') {
        updateData.maker_processed = true;
        updateData.maker_processed_at = new Date().toISOString();
        updateData.maker_user_id = currentUserId;
        updateData.status = 'maker_processed';
      } else if (makerType === 'checker') {
        updateData.checker_processed = true;
        updateData.checker_processed_at = new Date().toISOString();
        updateData.checker_user_id = currentUserId;
        updateData.status = 'bulk_processed_successfully';
      }

      const { error: dbError } = await supabase
        .from('bulk_file_processing')
        .update(updateData)
        .eq('id', fileId);

      if (dbError) {
        throw dbError;
      }

      sonnerToast.success(`File uploaded successfully as ${makerType === 'maker' ? 'Maker' : 'Checker'}!`);
      refreshFiles();
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadingFileId(null);
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      // Download the file directly using the provided path without modifying it
      const { data, error } = await supabase.storage
        .from('bulk-files')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Read the Excel file
      const arrayBuffer = await data.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert worksheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Filter to only include the required columns
      const filteredData = jsonData.map((row: any) => ({
        arn: row.arn,
        pan_number: row.pan_number,
        itr_flag: row.itr_flag,
        lrs_amount_consumed: row.lrs_amount_consumed
      }));
      
      // Create a new workbook with filtered data
      const newWorkbook = XLSX.utils.book_new();
      const newWorksheet = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "FilteredData");
      
      // Generate Excel file and download
      const excelOutput = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelOutput], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'filtered_data.xlsx'; // Extract filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      sonnerToast.success("File downloaded successfully!");
    } catch (error: any) {
      console.error("File download error:", error);
      toast({
        title: "Error",
        description: `Failed to download file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return {
    isUploading,
    uploadingFileId,
    fileInputRefs,
    handleUploadClick,
    handleFileChange,
    handleDownload
  };
};
