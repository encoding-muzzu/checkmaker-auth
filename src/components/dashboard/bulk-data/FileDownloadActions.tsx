
import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { BulkFile } from "@/hooks/useBulkProcessing";

interface FileDownloadActionsProps {
  file: BulkFile;
  onDownload: (filePath: string) => void;
}

export const FileDownloadActions = ({ file, onDownload }: FileDownloadActionsProps) => {
  return (
    <div className="flex flex-col gap-2 items-end">
      <h4 className="text-xs font-medium text-gray-500 w-full text-right">Download Files:</h4>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(file.file_path)}
          className="flex items-center gap-1 border-gray-200 hover:bg-gray-50"
        >
          <DownloadIcon size={16} />
          Original
        </Button>
        
        {file.maker_processed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const makerFilePath = file.file_path.replace('.xlsx', '_maker.xlsx');
              onDownload(makerFilePath);
            }}
            className="flex items-center gap-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
          >
            <DownloadIcon size={16} />
            Maker
          </Button>
        )}
        
        {file.checker_processed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const checkerFilePath = file.file_path.replace('.xlsx', '_checker.xlsx');
              onDownload(checkerFilePath);
            }}
            className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50"
          >
            <DownloadIcon size={16} />
            Checker
          </Button>
        )}
      </div>
    </div>
  );
};
