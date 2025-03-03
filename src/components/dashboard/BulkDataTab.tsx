
import React, { useState, useRef } from "react";
import { useBulkProcessing, BulkFile } from "@/hooks/useBulkProcessing";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow, TableHeader, TableHead, Table, TableBody } from "@/components/ui/table";
import { DownloadIcon, UploadIcon, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TableSkeleton } from "./TableSkeleton";

export const BulkDataTab = () => {
  const {
    bulkFiles,
    isLoading,
    userRole,
    downloadFile,
    uploadFile,
    refreshData,
    isUploading,
    canUploadAsMaker1,
    canUploadAsMaker2
  } = useBulkProcessing();
  
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const handleRefresh = () => {
    console.log("Refreshing bulk files data");
    refreshData();
  };
  
  const handleDownload = (filePath: string) => {
    console.log(`Downloading file: ${filePath}`);
    downloadFile(filePath);
  };
  
  const handleUploadClick = (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => {
    console.log(`Upload button clicked for file ID: ${fileId}`);
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected file for upload: ${file.name}, maker type: ${makerType}`);
      setUploadingFileId(fileId);
      try {
        await uploadFile(file, fileId, makerType);
      } finally {
        setUploadingFileId(null);
        // Reset file input
        if (e.target) e.target.value = '';
      }
    }
  };
  
  const getStatusLabel = (file: BulkFile) => {
    if (file.maker2_processed) return "Processed by Maker 2";
    if (file.maker1_processed) return "Processed by Maker 1";
    return "Pending";
  };
  
  const getStatusClass = (file: BulkFile) => {
    if (file.maker2_processed) return "bg-green-100 text-green-800";
    if (file.maker1_processed) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };
  
  if (isLoading) return <TableSkeleton />;
  
  return (
    <div className="bg-white rounded-md shadow">
      <div className="p-4 flex justify-between items-center border-b border-[rgb(224,224,224)]">
        <h2 className="text-lg font-semibold">Bulk Data Processing</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
      
      <div className="p-4">
        <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-medium mb-2">Workflow Instructions:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>System automatically generates Excel files for processing every 5 minutes.</li>
            <li><strong>Maker 1:</strong> Download the file, update it locally, then upload your version.</li>
            <li><strong>Maker 2:</strong> Download Maker 1's file, review and update it, then upload the final version.</li>
          </ul>
        </div>
        
        <div className="overflow-x-auto">
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
                    <TableCell className="font-medium">{file.file_name}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>{file.record_count || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(file)}`}>
                        {getStatusLabel(file)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Original file download */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file.file_path)}
                          className="flex items-center gap-1"
                        >
                          <DownloadIcon size={16} />
                          Download
                        </Button>
                        
                        {/* Maker 1 file download if available */}
                        {file.maker1_processed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const maker1FilePath = file.file_path.replace('.xlsx', '_maker1.xlsx');
                              handleDownload(maker1FilePath);
                            }}
                            className="flex items-center gap-1"
                          >
                            <DownloadIcon size={16} />
                            Maker 1
                          </Button>
                        )}
                        
                        {/* Maker 2 file download if available */}
                        {file.maker2_processed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const maker2FilePath = file.file_path.replace('.xlsx', '_maker2.xlsx');
                              handleDownload(maker2FilePath);
                            }}
                            className="flex items-center gap-1"
                          >
                            <DownloadIcon size={16} />
                            Maker 2
                          </Button>
                        )}
                        
                        {/* Maker 1 upload */}
                        {userRole === "maker" && canUploadAsMaker1(file) && (
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
                              className="flex items-center gap-1"
                            >
                              <UploadIcon size={16} />
                              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as Maker 1"}
                            </Button>
                          </>
                        )}
                        
                        {/* Maker 2 upload */}
                        {userRole === "maker" && canUploadAsMaker2(file) && (
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
                              className="flex items-center gap-1"
                            >
                              <UploadIcon size={16} />
                              {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as Maker 2"}
                            </Button>
                          </>
                        )}
                      </div>
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
        </div>
      </div>
    </div>
  );
};

export default BulkDataTab;
