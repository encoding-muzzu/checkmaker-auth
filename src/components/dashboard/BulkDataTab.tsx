
import { useState } from "react";
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { WorkflowInstructions } from "./bulk-data/WorkflowInstructions";
import { BulkDataTable } from "./bulk-data/BulkDataTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ValidationResultsDialog } from "./bulk-data/ValidationResultsDialog";

interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: { row: number; error: string }[];
  validationFilePath: string;
  validationFileUrl: string;
}

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
    refetch
  } = useBulkProcessing();

  // Create a handler function that calls refetch
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

  // Handler for re-uploading files after validation
  const handleReupload = () => {
    if (activeFileId) {
      if (canCurrentUserUploadAsMaker) {
        handleUploadClick(activeFileId, { current: fileInputRefs.current[`maker_${activeFileId}`] });
      } else if (canCurrentUserUploadAsChecker) {
        handleUploadClick(activeFileId, { current: fileInputRefs.current[`checker_${activeFileId}`] });
      }
    }
    closeValidationDialog();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <WorkflowInstructions />
        <Button
          onClick={handleRefresh}
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
          validationResults={validationResults}
          setValidationResults={setValidationResults}
          openValidationDialog={openValidationDialog}
        />
      </div>

      {validationResults && (
        <ValidationResultsDialog
          isOpen={validationDialogOpen}
          onClose={closeValidationDialog}
          results={validationResults}
          onDownloadValidation={handleDownload}
          onReupload={handleReupload}
        />
      )}
    </div>
  );
};
