
import React from "react";
import { TableCell, TableRow, TableHeader, TableHead, Table, TableBody } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import { BulkFile } from "@/hooks/useBulkProcessing";
import { FileStatusBadge } from "./FileStatusBadge";
import { FileActionsCard } from "./FileActionsCard";
import { TableSkeleton } from "../TableSkeleton";

interface BulkDataTableProps {
  bulkFiles: BulkFile[] | null;
  isLoading: boolean;
  currentUserId: string | null;
  isUploading: boolean;
  uploadingFileId: string | null;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  canCurrentUserUploadAsMaker1: (file: BulkFile) => boolean;
  canCurrentUserUploadAsMaker2: (file: BulkFile) => boolean;
  isCurrentUserMaker1: (file: BulkFile) => boolean;
  isCurrentUserMaker2: (file: BulkFile) => boolean;
  handleDownload: (filePath: string) => void;
  handleUploadClick: (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => void;
}

export const BulkDataTable = ({
  bulkFiles,
  isLoading,
  currentUserId,
  isUploading,
  uploadingFileId,
  fileInputRefs,
  canCurrentUserUploadAsMaker1,
  canCurrentUserUploadAsMaker2,
  isCurrentUserMaker1,
  isCurrentUserMaker2,
  handleDownload,
  handleUploadClick,
  handleFileChange
}: BulkDataTableProps) => {
  if (isLoading) return <TableSkeleton />;

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
        {bulkFiles && bulkFiles.length > 0 ? (
          bulkFiles.map((file) => (
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
                  isUploading={isUploading}
                  uploadingFileId={uploadingFileId}
                  canCurrentUserUploadAsMaker1={canCurrentUserUploadAsMaker1(file)}
                  canCurrentUserUploadAsMaker2={canCurrentUserUploadAsMaker2(file)}
                  isCurrentUserMaker1={isCurrentUserMaker1(file)}
                  isCurrentUserMaker2={isCurrentUserMaker2(file)}
                  fileInputRefs={fileInputRefs}
                  handleDownload={handleDownload}
                  handleUploadClick={handleUploadClick}
                  handleFileChange={handleFileChange}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
              No bulk files available yet. Files are generated automatically every 5 minutes.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
