
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Upload, X, CheckCircle } from "lucide-react";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] font-['Roboto'] p-0 overflow-hidden bg-white rounded-md">
        <DialogHeader className="border-b-[1px] border-[rgb(224, 224, 224)] p-4">
          <DialogTitle className="text-left flex items-center gap-2 text-[rgba(0, 0, 0, 0.87)] text-base font-normal">
            <FileText className="h-5 w-5" />
            Data Validation From "{results.fileName}"
          </DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="p-6">
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

          {/* File info section with filename and error indicator */}
          <div className="mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 mr-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium text-[rgba(0, 0, 0, 0.87)]">
                  {results.fileName}
                </p>
                <div className="flex items-center text-red-500 text-[0.75rem]">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Errors Found in Uploaded File</span>
                </div>
              </div>
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

          {/* Re-upload area */}
          <div className="bg-gray-100 rounded border border-gray-300 border-dashed p-6 mb-2">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex justify-center w-full mb-2">
                <img 
                  src="/lovable-uploads/59d9048b-de1b-430c-a899-9918cd16f296.png" 
                  alt="Upload icon" 
                  className="h-14 w-14 opacity-60 mb-2" 
                />
              </div>
              <p className="text-[0.75rem] text-gray-500 mb-4">Drag & Drop or Browse File</p>
              
              <div className="flex flex-col items-center w-full">
                <Button
                  className="bg-black text-white hover:bg-gray-800 rounded-[4px] text-[0.8125rem] h-10 px-6 mb-3 w-[140px]"
                  onClick={onReupload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Re-Upload
                </Button>
                
                <Button
                  className="bg-gray-300 text-gray-500 hover:bg-gray-300 hover:text-gray-500 rounded-[4px] text-[0.8125rem] h-10 w-[140px]"
                  disabled
                >
                  Validate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
