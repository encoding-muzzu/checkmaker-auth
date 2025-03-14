
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, X, CheckCircle, Download } from "lucide-react";
import { ValidationResults } from "@/hooks/bulk-processing/useValidationDialog";

interface ValidationResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: ValidationResults | null;
  onDownloadValidation: (filePath: string) => void;
}

export const ValidationResultsDialog = ({
  isOpen,
  onClose,
  results,
  onDownloadValidation
}: ValidationResultsDialogProps) => {
  if (!results) return null;

  // Determine error type based on the error message
  const isDuplicateError = results.rowErrors.length > 0 && 
    results.rowErrors[0].error.includes("Duplicate");
  
  const isRecordNotFoundError = results.rowErrors.length > 0 && 
    results.rowErrors[0].error.includes("not found in original file");
  
  const isRecordCountMismatch = results.rowErrors.length > 0 && 
    results.rowErrors[0].row === 0 && 
    results.rowErrors[0].error.includes("Record count mismatch");

  // Determine the appropriate error title and message
  let errorTitle = "Validation Failed";
  let errorMessage = `Found errors in ${results.invalidRecords} of ${results.totalRecords} records.`;
  
  if (isRecordCountMismatch) {
    errorTitle = "Record Count Mismatch";
    errorMessage = results.rowErrors[0].error;
  } else if (isDuplicateError) {
    errorTitle = "Duplicate Records Found";
    errorMessage = "The uploaded file contains duplicate ARN or PAN number values.";
  } else if (isRecordNotFoundError) {
    errorTitle = "Records Not Found in Original File";
    errorMessage = "The uploaded file contains records that don't exist in the original file.";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent 
        className="max-w-[550px] font-['Roboto'] p-0 overflow-hidden bg-white rounded-md shadow-lg"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="border-b-[1px] border-[rgb(224, 224, 224)] p-4 bg-gray-50">
          <DialogTitle className="text-left flex items-center gap-2 text-[rgba(0, 0, 0, 0.87)] text-base font-medium">
            <FileText className="h-5 w-5 text-gray-700" />
            Validation Results: "{results.fileName}"
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="p-6">
          {/* Status Banner */}
          <div className="mb-6 p-3 rounded-md flex items-center gap-3 bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-700 text-sm mb-1">
                {errorTitle}
              </h3>
              <p className="text-red-600 text-xs">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* Records statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 border border-[rgb(224, 224, 224)] rounded-md p-3 text-center">
              <div className="text-[0.875rem] text-[rgba(0, 0, 0, 0.87)] font-medium mb-1">Total Records</div>
              <div className="text-xl font-semibold">{results.totalRecords}</div>
            </div>
            <div className="bg-gray-50 border border-[rgb(224, 224, 224)] rounded-md p-3 text-center">
              <div className="text-[0.875rem] text-[rgba(0, 0, 0, 0.87)] font-medium mb-1">Valid Records</div>
              <div className="text-xl font-semibold text-green-600">{results.validRecords}</div>
            </div>
            <div className="bg-gray-50 border border-[rgb(224, 224, 224)] rounded-md p-3 text-center">
              <div className="text-[0.875rem] text-[rgba(0, 0, 0, 0.87)] font-medium mb-1">Errors Found</div>
              <div className="text-xl font-semibold text-red-600">{results.invalidRecords}</div>
            </div>
          </div>

          {/* Download section */}
          <div className="bg-gray-50 border border-[rgb(224, 224, 224)] rounded-md p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-gray-700" />
                <span className="text-[0.875rem] font-medium text-[rgba(0, 0, 0, 0.87)]">
                  Download marked file to make corrections
                </span>
              </div>
              <Button 
                variant="link" 
                className="text-blue-600 hover:text-blue-800 p-0 font-medium text-[0.875rem]" 
                onClick={() => onDownloadValidation(results.validationFilePath)}
              >
                Download .xlsx
              </Button>
            </div>
          </div>

          {/* Note about validation */}
          <div className="text-center text-gray-500 text-sm mt-6">
            Please download the file, correct the errors, and upload again.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
