
import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, CheckCircle2 } from "lucide-react";
import { BulkFile } from "@/hooks/useBulkProcessing";

interface FileUploadActionsProps {
  file: BulkFile;
  currentUserId: string | null;
  isUploading: boolean;
  uploadingFileId: string | null;
  canCurrentUserUploadAsMaker1: boolean;
  canCurrentUserUploadAsMaker2: boolean;
  isCurrentUserMaker1: boolean;
  isCurrentUserMaker2: boolean;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  handleUploadClick: (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => void;
}

export const FileUploadActions = ({
  file,
  currentUserId,
  isUploading,
  uploadingFileId,
  canCurrentUserUploadAsMaker1,
  canCurrentUserUploadAsMaker2,
  isCurrentUserMaker1,
  isCurrentUserMaker2,
  fileInputRefs,
  handleUploadClick,
  handleFileChange
}: FileUploadActionsProps) => {
  
  if (!canCurrentUserUploadAsMaker1 && !canCurrentUserUploadAsMaker2) {
    return (
      <div className="mt-2 flex justify-end">
        {isCurrentUserMaker1 && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Maker 1
          </div>
        )}
        
        {isCurrentUserMaker2 && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Maker 2
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-end ml-3 border-l border-gray-200 pl-3">
      <h4 className="text-xs font-medium text-gray-500 w-full text-right">Upload Actions:</h4>
      <div className="flex gap-2">
        {canCurrentUserUploadAsMaker1 && (
          <>
            <input
              type="file"
              ref={el => fileInputRefs.current[`maker1_${file.id}`] = el}
              onChange={(e) => handleFileChange(e, file.id, "maker1")}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => handleUploadClick(file.id, { current: fileInputRefs.current[`maker1_${file.id}`] })}
              disabled={isUploading && uploadingFileId === file.id}
              className="flex items-center gap-1 bg-black text-white hover:bg-gray-800"
            >
              <UploadIcon size={16} />
              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as Maker 1"}
            </Button>
          </>
        )}
        
        {canCurrentUserUploadAsMaker2 && (
          <>
            <input
              type="file"
              ref={el => fileInputRefs.current[`maker2_${file.id}`] = el}
              onChange={(e) => handleFileChange(e, file.id, "maker2")}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => handleUploadClick(file.id, { current: fileInputRefs.current[`maker2_${file.id}`] })}
              disabled={isUploading && uploadingFileId === file.id}
              className="flex items-center gap-1 bg-black text-white hover:bg-gray-800"
            >
              <UploadIcon size={16} />
              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as Maker 2"}
            </Button>
          </>
        )}
      </div>
      
      <div className="mt-2 flex justify-end">
        {isCurrentUserMaker1 && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Maker 1
          </div>
        )}
        
        {isCurrentUserMaker2 && (
          <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 size={14} />
            You've already processed this as Maker 2
          </div>
        )}
      </div>
    </div>
  );
};
