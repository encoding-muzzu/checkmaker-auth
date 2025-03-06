
import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, CheckCircle2 } from "lucide-react";
import { BulkFile } from "@/hooks/useBulkProcessing";

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
  handleFileChange
}: FileUploadActionsProps) => {
  
  // Add debugging console logs
  console.log("File Upload Actions Props:", {
    fileId: file.id,
    canUploadAsMaker: canCurrentUserUploadAsMaker,
    canUploadAsChecker: canCurrentUserUploadAsChecker,
    isCurrentUserMaker,
    isCurrentUserChecker,
    maker_processed: file.maker_processed,
    checker_processed: file.checker_processed
  });

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
              className="flex items-center gap-1 bg-black text-white hover:bg-gray-800"
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
              className="flex items-center gap-1 bg-black text-white hover:bg-gray-800"
            >
              <UploadIcon size={16} />
              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as a Checker"}
            </Button>
          </>
        )}
      </div>
      
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
    </div>
  );
};
