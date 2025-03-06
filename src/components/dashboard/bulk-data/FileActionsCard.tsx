
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
  canCurrentUserUploadAsMaker: boolean;
  canCurrentUserUploadAsChecker: boolean;
  isCurrentUserMaker: boolean;
  isCurrentUserChecker: boolean;
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
  canCurrentUserUploadAsMaker,
  canCurrentUserUploadAsChecker,
  isCurrentUserMaker,
  isCurrentUserChecker,
  fileInputRefs,
  handleDownload,
  handleUploadClick,
  handleFileChange
}: FileActionsCardProps) => {
  return (
    <Card className="border border-gray-100 shadow-sm p-3 rounded-md">
      <div className="flex flex-wrap justify-end gap-3">
        <FileDownloadActions file={file} onDownload={handleDownload} />
        
        <FileUploadActions 
          file={file}
          currentUserId={currentUserId}
          isUploading={isUploading}
          uploadingFileId={uploadingFileId}
          canCurrentUserUploadAsMaker={canCurrentUserUploadAsMaker}
          canCurrentUserUploadAsChecker={canCurrentUserUploadAsChecker}
          isCurrentUserMaker={isCurrentUserMaker}
          isCurrentUserChecker={isCurrentUserChecker}
          fileInputRefs={fileInputRefs}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
        />
      </div>
    </Card>
  );
};
