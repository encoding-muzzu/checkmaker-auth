
import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { BulkFile, ProcessingRole } from "@/types/bulk-processing";

interface FileDownloadActionsProps {
  file: BulkFile;
  onDownload: (filePath: string) => void;
  userRole?: string | null;
}

export const FileDownloadActions = ({ file, onDownload, userRole }: FileDownloadActionsProps) => {
  const isMaker = userRole === 'maker';
  const isChecker = userRole === 'checker';

  return (
    <div className="flex flex-col gap-2 items-end">
      <h4 className="text-xs font-medium text-gray-500 w-full text-right">Download Files:</h4>
      <div className="flex gap-2">
        {/* Original file is always visible to both roles */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(file.file_path)}
          className="flex items-center gap-1 border-gray-200 hover:bg-gray-50"
          title="Download filtered file with key columns only"
        >
          <DownloadIcon size={16} />
          Original
        </Button>
        
        {/* Maker file is only visible to Makers */}
        {file.maker_processed && isMaker && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(file.file_path)}
            className="flex items-center gap-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
            title="Download filtered file with key columns only"
          >
            <DownloadIcon size={16} />
            Maker
          </Button>
        )}
        
        {/* Checker file is only visible to Checkers */}
        {file.checker_processed && isChecker && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(file.file_path)}
            className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50"
            title="Download filtered file with key columns only"
          >
            <DownloadIcon size={16} />
            Checker
          </Button>
        )}
      </div>
    </div>
  );
};
