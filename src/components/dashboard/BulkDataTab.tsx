
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { WorkflowInstructions } from "./bulk-data/WorkflowInstructions";
import { BulkDataTable } from "./bulk-data/BulkDataTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const BulkDataTab = () => {
  const {
    bulkFiles,
    isLoading,
    currentUserId,
    userRole,
    isUploading,
    uploadingFileId,
    fileInputRefs,
    canCurrentUserUploadAsMaker,
    canCurrentUserUploadAsChecker,
    isCurrentUserMaker,
    isCurrentUserChecker,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handleDownload,
    handleUploadClick,
    handleFileChange,
    refetch
  } = useBulkProcessing();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <WorkflowInstructions />
        <Button
          onClick={refetch}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6">
        <BulkDataTable
          bulkFiles={bulkFiles}
          isLoading={isLoading}
          currentUserId={currentUserId}
          userRole={userRole}
          isUploading={isUploading}
          uploadingFileId={uploadingFileId}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          fileInputRefs={fileInputRefs}
          canCurrentUserUploadAsMaker={canCurrentUserUploadAsMaker}
          canCurrentUserUploadAsChecker={canCurrentUserUploadAsChecker}
          isCurrentUserMaker={isCurrentUserMaker}
          isCurrentUserChecker={isCurrentUserChecker}
          handleDownload={handleDownload}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
        />
      </div>
    </div>
  );
};
