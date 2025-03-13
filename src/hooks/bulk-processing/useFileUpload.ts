
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

      // Use the Supabase function invocation method instead of direct fetch
      const { data, error } = await supabase.functions.invoke("process-bulk-data", {
        body: formData,
      });

      if (error) {
        console.error("Function invocation error:", error);
        throw new Error(`Server error: ${error.message || error.name}`);
      }

      console.log("Function response:", data);
      
      if (!data.valid) {
        console.log("Validation failed:", data.validationResults);
        setValidationResults(data.validationResults);
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
