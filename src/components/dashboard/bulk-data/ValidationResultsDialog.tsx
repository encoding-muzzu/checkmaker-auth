
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
          <DialogTitle className="flex items-center gap-2 text-left">
            <FileText size={18} />
            Data Validation From "{results.fileName}"
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center gap-2 text-amber-500 mb-4">
            <AlertTriangle size={20} />
            <span className="font-medium">Errors Found in Uploaded File</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 border-b-[1px] border-solid border-[rgb(224, 224, 224)] pb-4">
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
            className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-[4px]"
            variant="secondary"
            onClick={onReupload}
          >
            <Upload size={16} />
            Re-Upload File
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-[4px]">
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
