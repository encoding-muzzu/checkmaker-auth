
import React from "react";
import { Card } from "@/components/ui/card";
import { BulkFile } from "@/hooks/useBulkProcessing";
import { FileDownloadActions } from "./FileDownloadActions";
import { FileUploadActions } from "./FileUploadActions";

interface FileActionsCardProps {
  file: BulkFile;
  currentUserId: string | null;
  isUploading: boolean;
  uploadingFileId: string | null;
  canCurrentUserUploadAsMaker1: boolean;
  canCurrentUserUploadAsMaker2: boolean;
  isCurrentUserMaker1: boolean;
  isCurrentUserMaker2: boolean;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  handleDownload: (filePath: string) => void;
  handleUploadClick: (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => void;
}

export const FileActionsCard = ({
  file,
  currentUserId,
  isUploading,
  uploadingFileId,
  canCurrentUserUploadAsMaker1,
  canCurrentUserUploadAsMaker2,
  isCurrentUserMaker1,
  isCurrentUserMaker2,
  fileInputRefs,
  handleDownload,
  handleUploadClick,
  handleFileChange
}: FileActionsCardProps) => {
  return (
    <Card className="border border-gray-100 shadow-sm p-3 rounded-md">
      <div className="flex flex-wrap justify-end gap-3">
        <FileDownloadActions file={file} onDownload={handleDownload} />
        
        {(canCurrentUserUploadAsMaker1 || canCurrentUserUploadAsMaker2) && (
          <FileUploadActions 
            file={file}
            currentUserId={currentUserId}
            isUploading={isUploading}
            uploadingFileId={uploadingFileId}
            canCurrentUserUploadAsMaker1={canCurrentUserUploadAsMaker1}
            canCurrentUserUploadAsMaker2={canCurrentUserUploadAsMaker2}
            isCurrentUserMaker1={isCurrentUserMaker1}
            isCurrentUserMaker2={isCurrentUserMaker2}
            fileInputRefs={fileInputRefs}
            handleUploadClick={handleUploadClick}
            handleFileChange={handleFileChange}
          />
        )}
      </div>
      
      {!canCurrentUserUploadAsMaker1 && !canCurrentUserUploadAsMaker2 && (
        <FileUploadActions 
          file={file}
          currentUserId={currentUserId}
          isUploading={isUploading}
          uploadingFileId={uploadingFileId}
          canCurrentUserUploadAsMaker1={false}
          canCurrentUserUploadAsMaker2={false}
          isCurrentUserMaker1={isCurrentUserMaker1}
          isCurrentUserMaker2={isCurrentUserMaker2}
          fileInputRefs={fileInputRefs}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
        />
      )}
    </Card>
  );
};
