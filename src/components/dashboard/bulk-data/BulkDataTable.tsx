
import React, { useState } from "react";
import { TableCell, TableRow, TableHeader, TableHead, Table, TableBody, TableFooter } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import { BulkFile } from "@/hooks/useBulkProcessing";
import { FileStatusBadge } from "./FileStatusBadge";
import { FileActionsCard } from "./FileActionsCard";
import { TableSkeleton } from "../TableSkeleton";

interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: { row: number; error: string }[];
  validationFilePath: string;
  validationFileUrl: string;
}

interface BulkDataTableProps {
  bulkFiles: BulkFile[] | null;
  isLoading: boolean;
  currentUserId: string | null;
  userRole: string | null;
  isUploading: boolean;
  uploadingFileId: string | null;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  canCurrentUserUploadAsMaker: (file: BulkFile) => boolean;
  canCurrentUserUploadAsChecker: (file: BulkFile) => boolean;
  isCurrentUserMaker: (file: BulkFile) => boolean;
  isCurrentUserChecker: (file: BulkFile) => boolean;
  handleDownload: (filePath: string) => void;
  handleUploadClick: (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => void;
  validationResults: ValidationResults | null;
  setValidationResults: (results: ValidationResults | null) => void;
  openValidationDialog: (fileId: string) => void;
}

export const BulkDataTable = ({
  bulkFiles,
  isLoading,
  currentUserId,
  userRole,
  isUploading,
  uploadingFileId,
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
  fileInputRefs,
  canCurrentUserUploadAsMaker,
  canCurrentUserUploadAsChecker,
  isCurrentUserMaker,
  isCurrentUserChecker,
  handleDownload,
  handleUploadClick,
  handleFileChange,
  validationResults,
  setValidationResults,
  openValidationDialog
}: BulkDataTableProps) => {
  if (isLoading) return <TableSkeleton />;

  if (!bulkFiles || bulkFiles.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center">
        <p className="text-gray-500">
          {userRole === 'maker' 
            ? "No files available for Maker processing." 
            : userRole === 'checker'
              ? "No files available for Checker processing. Files will appear here after they have been processed by a Maker."
              : "No bulk files available yet."
          }
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bulkFiles.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                {file.file_name}
              </div>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>{file.record_count || 0}</TableCell>
            <TableCell>
              <FileStatusBadge file={file} />
            </TableCell>
            <TableCell className="text-right">
              <FileActionsCard 
                file={file}
                currentUserId={currentUserId}
                userRole={userRole}
                isUploading={isUploading}
                uploadingFileId={uploadingFileId}
                canCurrentUserUploadAsMaker={canCurrentUserUploadAsMaker(file)}
                canCurrentUserUploadAsChecker={canCurrentUserUploadAsChecker(file)}
                isCurrentUserMaker={isCurrentUserMaker(file)}
                isCurrentUserChecker={isCurrentUserChecker(file)}
                fileInputRefs={fileInputRefs}
                handleDownload={handleDownload}
                handleUploadClick={handleUploadClick}
                handleFileChange={handleFileChange}
                validationResults={validationResults}
                setValidationResults={setValidationResults}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>
            <div className="flex items-center justify-center gap-4 py-2">
              <button 
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                onClick={onPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded">
                {currentPage} of {totalPages || 1}
              </span>
              <button 
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                onClick={onNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
