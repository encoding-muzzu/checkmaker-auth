import { useState } from "react";
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { WorkflowInstructions } from "./bulk-data/WorkflowInstructions";
import { BulkDataTable } from "./bulk-data/BulkDataTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ValidationResultsDialog } from "./bulk-data/ValidationResultsDialog";
import { ValidationResults } from "@/hooks/bulk-processing/useValidationDialog";

export const BulkDataTab = () => {
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

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
    refetch,
    validationResults: hookValidationResults,
    setValidationResults: setHookValidationResults,
  } = useBulkProcessing();

  const handleRefresh = () => {
    refetch();
  };

  const openValidationDialog = (fileId: string) => {
    setActiveFileId(fileId);
    setValidationDialogOpen(true);
  };

  const closeValidationDialog = () => {
    setValidationDialogOpen(false);
  };

  const handleReupload = () => {
    if (activeFileId) {
      closeValidationDialog();
      const fileToUpload = bulkFiles?.find(f => f.id === activeFileId);
      
      if (fileToUpload) {
        if (canCurrentUserUploadAsMaker(fileToUpload)) {
          handleUploadClick(activeFileId, { current: fileInputRefs.current[`maker_${activeFileId}`] });
        } else if (canCurrentUserUploadAsChecker(fileToUpload)) {
          handleUploadClick(activeFileId, { current: fileInputRefs.current[`checker_${activeFileId}`] });
        }
      }
    }
  };

  const effectiveValidationResults = hookValidationResults || validationResults;
  
  if (hookValidationResults && !validationDialogOpen) {
    setValidationResults(hookValidationResults);
    setValidationDialogOpen(true);
  }

  return (
    <div className="bg-[rgb(247, 249, 252)] p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <WorkflowInstructions />
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="icon"
          className="flex-shrink-0 rounded-[4px]"
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
          validationResults={effectiveValidationResults}
          setValidationResults={setValidationResults}
          openValidationDialog={openValidationDialog}
        />
      </div>

      {effectiveValidationResults && (
        <ValidationResultsDialog
          isOpen={validationDialogOpen}
          onClose={closeValidationDialog}
          results={effectiveValidationResults}
          onDownloadValidation={handleDownload}
          onReupload={handleReupload}
        />
      )}
    </div>
  );
};
