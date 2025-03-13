
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { ProcessingRole } from "@/types/bulk-processing";

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

      // Construct the correct URL for the edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/process-bulk-data`;
      console.log("Calling edge function at:", functionUrl);

      // Call the edge function to process the bulk data
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData
      });

      console.log("Response status:", response.status);

      // Check if the response is valid before parsing
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          // Try to get more detailed error info if available
          const errorText = await response.text();
          console.log("Error response body:", errorText);
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                errorMessage = errorJson.error;
              }
            } catch (parseError) {
              // If JSON parsing fails, use the text as is
              if (errorText.length > 0) {
                errorMessage = errorText;
              }
            }
          }
        } catch (readError) {
          console.error("Error reading response:", readError);
        }
        
        throw new Error(errorMessage);
      }

      // Safely parse the JSON response
      let result;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        if (responseText.trim().length === 0) {
          throw new Error("Empty response from server");
        }
        
        result = JSON.parse(responseText);
        console.log("Parsed response:", result);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Failed to parse server response. Please try again.");
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
      console.log("Downloading file:", filePath);
      
      // Download the file directly using the provided path without modifying it
      const { data, error } = await supabase.storage
        .from('bulk-files')
        .download(filePath);

      if (error) {
        console.error("Storage download error:", error);
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
