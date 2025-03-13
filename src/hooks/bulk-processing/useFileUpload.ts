
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sonnerToast } from "@/utils/toast-utils";
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

export interface UseFileUploadResult {
  isUploading: boolean;
  uploadingFileId: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: ProcessingRole) => Promise<void>;
  handleUploadClick: (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => void;
}

export const useFileUpload = (
  currentUserId: string | null, 
  refreshFiles: () => void,
  setValidationResults: (results: ValidationResults | null) => void,
  openValidationDialog: () => void
): UseFileUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUploadClick = (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileId", fileId);
      formData.append("makerType", makerType);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/process-bulk-data`;
      console.log("Calling edge function at:", functionUrl);

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.log("Error response body:", errorText);
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                errorMessage = errorJson.error;
              }
            } catch (parseError) {
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
        console.log("Validation failed:", result.validationResults);
        setValidationResults(result.validationResults);
        openValidationDialog();
      } else {
        sonnerToast(`File uploaded successfully as ${makerType === 'maker' ? 'Maker' : 'Checker'}!`);
        refreshFiles();
      }
    } catch (error: any) {
      console.error("File upload error:", error);
      sonnerToast.error(`Failed to upload file: ${error.message}`, {
        position: "top-center",
        duration: 5000,
        style: {
          background: "#f44336",
          color: "white",
          border: "none"
        }
      });
    } finally {
      setIsUploading(false);
      setUploadingFileId(null);
    }
  };

  return {
    isUploading,
    uploadingFileId,
    handleFileChange,
    handleUploadClick,
  };
};
