
import React from "react";
import { Card } from "@/components/ui/card";
import { BulkFile } from "@/types/bulk-processing";
import { FileDownloadActions } from "./FileDownloadActions";
import { FileUploadActions } from "./FileUploadActions";

interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: { row: number; error: string }[];
  validationFilePath: string;
  validationFileUrl: string;
}

interface FileActionsCardProps {
  file: BulkFile;
  currentUserId: string | null;
  userRole?: string | null;
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
  validationResults: ValidationResults | null;
  setValidationResults: (results: ValidationResults | null) => void;
}

export const FileActionsCard = ({
  file,
  currentUserId,
  userRole,
  isUploading,
  uploadingFileId,
  canCurrentUserUploadAsMaker,
  canCurrentUserUploadAsChecker,
  isCurrentUserMaker,
  isCurrentUserChecker,
  fileInputRefs,
  handleDownload,
  handleUploadClick,
  handleFileChange,
  validationResults,
  setValidationResults
}: FileActionsCardProps) => {
  return (
    <Card className="border border-gray-100 shadow-sm p-3 rounded-md">
      <div className="flex flex-wrap justify-end gap-3">
        <FileDownloadActions 
          file={file} 
          onDownload={handleDownload} 
          userRole={userRole} 
        />
        
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
          handleDownload={handleDownload}
          validationResults={validationResults}
          setValidationResults={setValidationResults}
        />
      </div>
    </Card>
  );
};
