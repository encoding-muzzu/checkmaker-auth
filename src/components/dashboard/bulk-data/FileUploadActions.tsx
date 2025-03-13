
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, CheckCircle2 } from "lucide-react";
import { BulkFile } from "@/hooks/useBulkProcessing";
import { ValidationResultsDialog } from "./ValidationResultsDialog";

interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: { row: number; error: string }[];
  validationFilePath: string;
  validationFileUrl: string;
}

interface FileUploadActionsProps {
  file: BulkFile;
  currentUserId: string | null;
  isUploading: boolean;
  uploadingFileId: string | null;
  canCurrentUserUploadAsMaker: boolean;
  canCurrentUserUploadAsChecker: boolean;
  isCurrentUserMaker: boolean;
  isCurrentUserChecker: boolean;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  handleUploadClick: (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => void;
  handleDownload: (filePath: string) => void;
  validationResults: ValidationResults | null;
  setValidationResults: (results: ValidationResults | null) => void;
}

export const FileUploadActions = ({
  file,
  currentUserId,
  isUploading,
  uploadingFileId,
  canCurrentUserUploadAsMaker,
  canCurrentUserUploadAsChecker,
  isCurrentUserMaker,
  isCurrentUserChecker,
  fileInputRefs,
  handleUploadClick,
  handleFileChange,
  handleDownload,
  validationResults,
  setValidationResults
}: FileUploadActionsProps) => {
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  
  const handleCloseValidationDialog = () => {
    setValidationDialogOpen(false);
  };

  const handleReupload = () => {
    // Close the dialog first
    setValidationDialogOpen(false);
    
    // Trigger the upload click for the appropriate role
    if (canCurrentUserUploadAsMaker) {
      handleUploadClick(file.id, { current: fileInputRefs.current[`maker_${file.id}`] });
    } else if (canCurrentUserUploadAsChecker) {
      handleUploadClick(file.id, { current: fileInputRefs.current[`checker_${file.id}`] });
    }
  };

  // Don't show upload actions if user can't upload in any role or if they've already processed
  if (!canCurrentUserUploadAsMaker && !canCurrentUserUploadAsChecker) {
    return (
      <div className="mt-2 flex justify-end">
        {isCurrentUserMaker && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Maker
          </div>
        )}
        
        {isCurrentUserChecker && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Checker
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-end ml-3 border-l border-gray-200 pl-3">
      <h4 className="text-xs font-medium text-gray-500 w-full text-right">Upload Actions:</h4>
      <div className="flex gap-2">
        {canCurrentUserUploadAsMaker && (
          <>
            <input
              type="file"
              ref={el => fileInputRefs.current[`maker_${file.id}`] = el}
              onChange={(e) => handleFileChange(e, file.id, "maker")}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => handleUploadClick(file.id, { current: fileInputRefs.current[`maker_${file.id}`] })}
              disabled={isUploading && uploadingFileId === file.id}
              className="flex items-center gap-1 bg-black text-white hover:bg-gray-800 rounded-[4px]"
            >
              <UploadIcon size={16} />
              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as a Maker"}
            </Button>
          </>
        )}
        
        {canCurrentUserUploadAsChecker && (
          <>
            <input
              type="file"
              ref={el => fileInputRefs.current[`checker_${file.id}`] = el}
              onChange={(e) => handleFileChange(e, file.id, "checker")}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => handleUploadClick(file.id, { current: fileInputRefs.current[`checker_${file.id}`] })}
              disabled={isUploading && uploadingFileId === file.id}
              className="flex items-center gap-1 bg-black text-white hover:bg-gray-800 rounded-[4px]"
            >
              <UploadIcon size={16} />
              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as a Checker"}
            </Button>
          </>
        )}
      </div>
      
      <div className="mt-2 flex justify-end">
        {isCurrentUserMaker && file.maker_processed && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Maker
          </div>
        )}
        
        {isCurrentUserChecker && file.checker_processed && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Checker
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-1 italic">
        Note: Files must have valid itr_flag ('Y'/'N') and numeric lrs_amount values
      </div>

      {/* Validation Results Dialog */}
      {validationResults && (
        <ValidationResultsDialog
          isOpen={validationDialogOpen}
          onClose={handleCloseValidationDialog}
          results={validationResults}
          onDownloadValidation={handleDownload}
          onReupload={handleReupload}
        />
      )}
    </div>
  );
};
