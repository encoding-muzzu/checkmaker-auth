
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, X, CheckCircle } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-[600px] font-['Roboto'] p-0 overflow-hidden bg-white rounded-md">
        <DialogHeader className="border-b-[1px] border-[rgb(224, 224, 224)] p-4">
          <DialogTitle className="text-left flex items-center gap-2 text-[rgba(0, 0, 0, 0.87)] text-base font-normal">
            <FileText className="h-5 w-5" />
            Data Validation From "{results.fileName}"
          </DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="p-6">
          {/* File info section with error indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-[0.8125rem]">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-[rgba(0, 0, 0, 0.87)]">{results.fileName}</span>
            </div>
            <div className="flex items-center text-red-500 text-[0.8125rem]">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Errors Found in Uploaded File</span>
            </div>
          </div>

          {/* Records statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-[rgb(224, 224, 224)] rounded p-3 text-center">
              <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)]">
                Records Found: {results.totalRecords}
              </p>
            </div>
            <div className="border border-[rgb(224, 224, 224)] rounded p-3 text-center">
              <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)]">
                Valid Records: {results.validRecords}
              </p>
            </div>
            <div className="border border-[rgb(224, 224, 224)] rounded p-3 text-center">
              <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)]">
                Errors Found: {results.invalidRecords}
              </p>
            </div>
          </div>

          {/* Download section */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)]">
              Download Validated File to make Corrections
            </p>
            <Button 
              variant="link" 
              className="text-red-500 p-0 text-[0.8125rem]" 
              onClick={() => onDownloadValidation(results.validationFilePath)}
            >
              Download .xlsx
            </Button>
          </div>

          {/* Re-upload button - removing the drag & drop area */}
          <div className="flex justify-center mt-8">
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-[4px] text-[0.8125rem] h-10 px-6 w-[140px]"
              onClick={onReupload}
            >
              Re-Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
