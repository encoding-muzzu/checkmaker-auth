
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Upload, X, CheckCircle } from "lucide-react";

interface ValidationError {
  row: number;
  error: string;
}

interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: ValidationError[];
  validationFilePath: string;
  validationFileUrl: string;
}

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
      <DialogContent className="max-w-md bg-white font-['Roboto'] p-0 overflow-hidden">
        <DialogHeader className="border-b-[1px] border-[rgb(224, 224, 224)] p-4">
          <DialogTitle className="text-left flex items-center gap-2 text-[rgba(0, 0, 0, 0.87)] text-base">
            <FileText className="h-5 w-5" />
            Data Validation From "{results.fileName}"
          </DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-[0.8125rem]">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-[rgba(0, 0, 0, 0.87)]">{results.fileName}</span>
            </div>
            <div className="flex items-center text-red-500 text-[0.8125rem]">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Errors Found in Uploaded File</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="border border-[rgb(224, 224, 224)] rounded p-2">
              <p className="text-[0.8125rem] text-center text-[rgba(0, 0, 0, 0.87)]">
                Records Found: {results.totalRecords}
              </p>
            </div>
            <div className="border border-[rgb(224, 224, 224)] rounded p-2">
              <p className="text-[0.8125rem] text-center text-[rgba(0, 0, 0, 0.87)]">
                Valid Records: {results.validRecords}
              </p>
            </div>
            <div className="border border-[rgb(224, 224, 224)] rounded p-2">
              <p className="text-[0.8125rem] text-center text-[rgba(0, 0, 0, 0.87)]">
                Errors Found: {results.invalidRecords}
              </p>
            </div>
          </div>

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

          <div className="bg-gray-200 rounded border border-gray-300 border-dashed flex flex-col items-center justify-center py-6 px-4 space-y-4">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/59d9048b-de1b-430c-a899-9918cd16f296.png" 
                alt="Upload icon" 
                className="h-8 w-8" 
              />
            </div>
            <p className="text-[0.75rem] text-gray-500">Drag & Drop or Browse File</p>
            
            <div className="w-full flex justify-center">
              <Button
                className="bg-black text-white hover:bg-gray-800 rounded-[4px] text-[0.8125rem] h-8"
                onClick={onReupload}
              >
                <Upload className="h-4 w-4 mr-1" />
                Re-Upload File
              </Button>
            </div>
            
            <Button
              className="bg-gray-300 text-gray-500 hover:bg-gray-300 hover:text-gray-500 rounded-[4px] text-[0.8125rem] h-8"
              disabled
            >
              Validate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
