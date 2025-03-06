
import React from "react";
import { BulkFile } from "@/hooks/useBulkProcessing";

interface FileStatusBadgeProps {
  file: BulkFile;
}

export const FileStatusBadge = ({ file }: FileStatusBadgeProps) => {
  const getStatusLabel = (file: BulkFile) => {
    if (file.maker1_processed && file.maker2_processed) return "Bulk Processed Successfully";
    if (file.maker1_processed) return "Processed by Maker";
    return "Pending";
  };

  const getStatusClass = (file: BulkFile) => {
    if (file.maker1_processed && file.maker2_processed) return "bg-green-100 text-green-800";
    if (file.maker1_processed) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(file)}`}>
      {getStatusLabel(file)}
    </span>
  );
};
