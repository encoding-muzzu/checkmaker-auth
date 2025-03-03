
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
        
        {file.maker1_processed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const maker1FilePath = file.file_path.replace('.xlsx', '_maker1.xlsx');
              onDownload(maker1FilePath);
            }}
            className="flex items-center gap-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
          >
            <DownloadIcon size={16} />
            Maker 1
          </Button>
        )}
        
        {file.maker2_processed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const maker2FilePath = file.file_path.replace('.xlsx', '_maker2.xlsx');
              onDownload(maker2FilePath);
            }}
            className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50"
          >
            <DownloadIcon size={16} />
            Maker 2
          </Button>
        )}
      </div>
    </div>
  );
};
