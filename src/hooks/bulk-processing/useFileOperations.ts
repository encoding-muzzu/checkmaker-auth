
import { useRef } from "react";
import { ProcessingRole } from "@/types/bulk-processing";
import { useFileUpload } from "./useFileUpload";
import { useFileDownload } from "./useFileDownload";
import { useValidationDialog, ValidationResults } from "./useValidationDialog";

// Use `export type` for re-exporting the type when isolatedModules is enabled
export type { ValidationResults } from "./useValidationDialog";

export const useFileOperations = (currentUserId: string | null, refreshFiles: () => void) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const {
    validationResults,
    setValidationResults,
    validationDialogOpen,
    openValidationDialog,
    closeValidationDialog
  } = useValidationDialog();

  const { 
    isUploading, 
    uploadingFileId, 
    handleFileChange, 
    handleUploadClick 
  } = useFileUpload(
    currentUserId, 
    refreshFiles, 
    setValidationResults, 
    openValidationDialog
  );

  const { handleDownload } = useFileDownload();

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
