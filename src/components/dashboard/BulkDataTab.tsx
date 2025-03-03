import React, { useState, useRef } from "react";
import { useBulkProcessing, BulkFile } from "@/hooks/useBulkProcessing";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow, TableHeader, TableHead, Table, TableBody } from "@/components/ui/table";
import { DownloadIcon, UploadIcon, RefreshCw, CheckCircle2, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TableSkeleton } from "./TableSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
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
  
  const canCurrentUserUploadAsMaker1 = (file: BulkFile) => {
    return userRole === "maker" && !file.maker1_processed;
  };
  
  const canCurrentUserUploadAsMaker2 = (file: BulkFile) => {
    return userRole === "maker" && 
           file.maker1_processed && 
           !file.maker2_processed && 
           file.maker1_user_id !== currentUserId;
  };
  
  const isCurrentUserMaker1 = (file: BulkFile) => {
    return file.maker1_processed && file.maker1_user_id === currentUserId;
  };
  
  const isCurrentUserMaker2 = (file: BulkFile) => {
    return file.maker2_processed && file.maker2_user_id === currentUserId;
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
            <li><strong>Note:</strong> A maker cannot be both Maker 1 and Maker 2 for the same file.</li>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(file)}`}>
                        {getStatusLabel(file)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Card className="border border-gray-100 shadow-sm p-3 rounded-md">
                        <div className="flex flex-wrap justify-end gap-3">
                          <div className="flex flex-col gap-2 items-end">
                            <h4 className="text-xs font-medium text-gray-500 w-full text-right">Download Files:</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(file.file_path)}
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
                                    handleDownload(maker1FilePath);
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
                                    handleDownload(maker2FilePath);
                                  }}
                                  className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50"
                                >
                                  <DownloadIcon size={16} />
                                  Maker 2
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {(canCurrentUserUploadAsMaker1(file) || canCurrentUserUploadAsMaker2(file)) && (
                            <div className="flex flex-col gap-2 items-end ml-3 border-l border-gray-200 pl-3">
                              <h4 className="text-xs font-medium text-gray-500 w-full text-right">Upload Actions:</h4>
                              <div className="flex gap-2">
                                {canCurrentUserUploadAsMaker1(file) && (
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
                                      className="flex items-center gap-1 bg-black text-white hover:bg-gray-800"
                                    >
                                      <UploadIcon size={16} />
                                      {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as Maker 1"}
                                    </Button>
                                  </>
                                )}
                                
                                {canCurrentUserUploadAsMaker2(file) && (
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
                                      className="flex items-center gap-1 bg-black text-white hover:bg-gray-800"
                                    >
                                      <UploadIcon size={16} />
                                      {isUploading && uploadingFileId === file.id ? "Uploading..." : "Upload as Maker 2"}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 flex justify-end">
                          {isCurrentUserMaker1(file) && (
                            <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
                              <CheckCircle2 size={14} />
                              You've already processed this as Maker 1
                            </div>
                          )}
                          
                          {isCurrentUserMaker2(file) && (
                            <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
                              <CheckCircle2 size={14} />
                              You've already processed this as Maker 2
                            </div>
                          )}
                        </div>
                      </Card>
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
