
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { WorkflowInstructions } from "./bulk-data/WorkflowInstructions";
import { BulkDataTable } from "./bulk-data/BulkDataTable";

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
