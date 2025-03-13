
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Upload, X } from "lucide-react";

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
      <DialogContent className="sm:max-w-lg bg-white font-['Roboto']">
        <DialogHeader className="border-b-[1px] border-[rgb(224, 224, 224)] pb-2">
          <DialogTitle className="text-left flex items-center gap-2 text-[rgba(0, 0, 0, 0.87)]">
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

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-[0.8125rem]">
              <img 
                src="/lovable-uploads/41430135-fb1b-4b35-84bf-75e23b515ac5.png" 
                alt="File icon" 
                className="h-5 w-5 mr-2" 
              />
              <span className="text-[rgba(0, 0, 0, 0.87)]">{results.fileName}</span>
            </div>
            <div className="flex items-center text-red-500 text-[0.8125rem]">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Errors Found in Uploaded File</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="border rounded p-3">
              <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)] font-medium">
                Records Found: {results.totalRecords}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)] font-medium">
                Valid Records: {results.validRecords}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)] font-medium">
                Errors Found: {results.invalidRecords}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-[0.8125rem] text-[rgba(0, 0, 0, 0.87)]">
              Download Validated File to make Corrections
            </span>
            <Button 
              variant="link" 
              className="text-red-500 p-0 text-[0.8125rem]" 
              onClick={() => onDownloadValidation(results.validationFilePath)}
            >
              Download .xlsx
            </Button>
          </div>

          <div className="bg-gray-100 rounded p-4 flex flex-col items-center justify-center border">
            <button
              className="bg-black text-white px-6 py-2 rounded-[4px] flex items-center justify-center gap-2 hover:bg-gray-800 w-auto"
              onClick={onReupload}
            >
              <Upload size={16} />
              Re-Upload File
            </button>
          </div>
        </div>

        <div className="pt-4 border-t-[1px] border-[rgb(224, 224, 224)] flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="rounded-[4px] border-gray-300 text-[0.8125rem]"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
