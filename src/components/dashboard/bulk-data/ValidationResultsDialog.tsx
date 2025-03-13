
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Upload } from "lucide-react";

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
      <DialogContent className="sm:max-w-md bg-white font-['Roboto']">
        <DialogHeader>
          <DialogTitle className="text-left flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Validation From "{results.fileName}"
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Errors Found in Uploaded File</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 border-b-[1px] border-[rgb(224, 224, 224)] pb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Records Found</p>
              <p className="font-medium text-[rgba(0, 0, 0, 0.87)]">{results.totalRecords}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Valid Records</p>
              <p className="font-medium text-[rgba(0, 0, 0, 0.87)]">{results.validRecords}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Errors Found</p>
              <p className="font-medium text-red-500">{results.invalidRecords}</p>
            </div>
          </div>

          {results.rowErrors && results.rowErrors.length > 0 && (
            <div className="max-h-40 overflow-y-auto mb-4 border border-[rgb(224, 224, 224)] rounded p-2">
              <h3 className="text-sm font-medium mb-2">Error Details:</h3>
              <ul className="text-xs space-y-1">
                {results.rowErrors.slice(0, 5).map((error, idx) => (
                  <li key={idx} className="flex gap-1">
                    <span className="font-medium">Row {error.row}:</span>
                    <span className="text-red-500">{error.error}</span>
                  </li>
                ))}
                {results.rowErrors.length > 5 && (
                  <li className="text-gray-500 italic">
                    ... and {results.rowErrors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[rgba(0, 0, 0, 0.87)]">Download Validated File to make Corrections</span>
            <Button 
              variant="link" 
              className="text-red-500 p-0" 
              onClick={() => onDownloadValidation(results.validationFilePath)}
            >
              Download .xlsx
            </Button>
          </div>

          <Button 
            className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 rounded-[4px]"
            onClick={onReupload}
          >
            <Upload size={16} />
            Re-Upload File
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-[4px] border-gray-300">
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
