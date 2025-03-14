
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
  onReupload: () => void;
}

export const ValidationResultsDialog = ({
  isOpen,
  onClose,
  results,
  onDownloadValidation,
  onReupload
}: ValidationResultsDialogProps) => {
  if (!results) return null;

  // Determine if this is a record count mismatch error
  const isRecordCountMismatch = results.rowErrors.length > 0 && 
    results.rowErrors[0].row === 0 && 
    results.rowErrors[0].error.includes("Record count mismatch");

  // Determine if we have duplicate values errors
  const hasDuplicateErrors = results.rowErrors.some(error => 
    error.error.includes("Duplicate ARN") || error.error.includes("Duplicate PAN")
  );

  // Get first duplicate error for display in banner
  const firstDuplicateError = hasDuplicateErrors ? 
    results.rowErrors.find(error => 
      error.error.includes("Duplicate ARN") || error.error.includes("Duplicate PAN")
    ) : null;

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
          <div className={`mb-6 p-3 rounded-md flex items-center gap-3 
            ${isRecordCountMismatch || hasDuplicateErrors ? "bg-red-50 border border-red-200" : "bg-red-50 border border-red-200"}`}>
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-700 text-sm mb-1">
                {isRecordCountMismatch 
                  ? "Record Count Mismatch" 
                  : hasDuplicateErrors 
                    ? "Duplicate Values Found" 
                    : "Validation Failed"}
              </h3>
              <p className="text-red-600 text-xs">
                {isRecordCountMismatch 
                  ? results.rowErrors[0].error 
                  : hasDuplicateErrors && firstDuplicateError
                    ? `Duplicate values found. For example: ${firstDuplicateError.error} in row ${firstDuplicateError.row}.`
                    : `Found errors in ${results.invalidRecords} of ${results.totalRecords} records.`}
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

          {/* Actions */}
          <div className="flex justify-center mt-8">
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-[4px] text-[0.875rem] h-10 px-8 font-medium"
              onClick={onReupload}
            >
              Re-Upload File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
