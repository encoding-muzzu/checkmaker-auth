
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { ProcessingRole } from "@/types/bulk-processing";
import * as XLSX from "xlsx";

interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: { row: number; error: string }[];
  validationFilePath: string;
  validationFileUrl: string;
}

export const useFileOperations = (currentUserId: string | null, refreshFiles: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  
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

    // Track validation results
    let validRecords = 0;
    let invalidRecords = 0;
    const rowErrors = [];

    // Validate each row
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
        rowError = "The values in both 'itr_flag' and 'lrs_amount' columns are incorrect.";
      } else if (!isItrFlagValid) {
        rowError = "The value in the 'itr_flag' column is incorrect.";
      } else if (!isLrsAmountValid) {
        rowError = "The value in the 'lrs_amount' column should be numeric or decimal.";
      }
      
      // Add errors
      if (rowError) {
        row.Errors = rowError;
        invalidRecords++;
        rowErrors.push({
          row: rowIndex,
          error: rowError
        });
      } else {
        validRecords++;
      }
    }

    return { 
      valid: invalidRecords === 0, 
      error: invalidRecords > 0 ? `Found ${invalidRecords} records with validation errors` : null,
      validRecords,
      invalidRecords,
      rowErrors
    };
  };

  const openValidationDialog = () => {
    setValidationDialogOpen(true);
  };

  const closeValidationDialog = () => {
    setValidationDialogOpen(false);
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
      // Create form data to upload to the edge function
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileId", fileId);
      formData.append("makerType", makerType);

      // Get the JWT token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      // Call the edge function to process the bulk data
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-bulk-data`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to process bulk data");
      }

      if (!result.valid) {
        // Handle validation errors
        console.log("Validation failed:", result.validationResults);
        
        // Show validation results dialog
        setValidationResults(result.validationResults);
        setValidationDialogOpen(true);
        
        sonnerToast.error("Validation failed. Please check the validation results.");
      } else {
        // If validation passed, show success message
        sonnerToast.success(`File uploaded successfully as ${makerType === 'maker' ? 'Maker' : 'Checker'}!`);
        refreshFiles();
      }
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

      // Create a download link for the file
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'downloaded_file.xlsx';
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
    validationResults,
    setValidationResults,
    validationDialogOpen,
    openValidationDialog,
    closeValidationDialog,
    handleUploadClick,
    handleFileChange,
    handleDownload
  };
};
