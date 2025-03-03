import React, { useState, useRef, useEffect } from "react";
import { useBulkProcessing, BulkFile } from "@/hooks/useBulkProcessing";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowInstructions } from "./bulk-data/WorkflowInstructions";
import { BulkDataTable } from "./bulk-data/BulkDataTable";

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
        <WorkflowInstructions />
        
        <div className="overflow-x-auto">
          <BulkDataTable 
            bulkFiles={bulkFiles}
            isLoading={isLoading}
            currentUserId={currentUserId}
            isUploading={isUploading}
            uploadingFileId={uploadingFileId}
            fileInputRefs={fileInputRefs}
            canCurrentUserUploadAsMaker1={canCurrentUserUploadAsMaker1}
            canCurrentUserUploadAsMaker2={canCurrentUserUploadAsMaker2}
            isCurrentUserMaker1={isCurrentUserMaker1}
            isCurrentUserMaker2={isCurrentUserMaker2}
            handleDownload={handleDownload}
            handleUploadClick={handleUploadClick}
            handleFileChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BulkDataTab;
