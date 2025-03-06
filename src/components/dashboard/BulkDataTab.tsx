
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { WorkflowInstructions } from "./bulk-data/WorkflowInstructions";
import { BulkDataTable } from "./bulk-data/BulkDataTable";

export const BulkDataTab = () => {
  const {
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
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handleDownload,
    handleUploadClick,
    handleFileChange
  } = useBulkProcessing();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <WorkflowInstructions />
      
      <div className="mt-6">
        <BulkDataTable
          bulkFiles={bulkFiles}
          isLoading={isLoading}
          currentUserId={currentUserId}
          isUploading={isUploading}
          uploadingFileId={uploadingFileId}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
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
  );
};
