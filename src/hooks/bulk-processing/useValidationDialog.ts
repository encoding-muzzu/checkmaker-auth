
import { useState } from "react";

export interface ValidationResults {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  rowErrors: { row: number; error: string }[];
  validationFilePath: string;
  validationFileUrl: string;
}

export interface UseValidationDialogResult {
  validationResults: ValidationResults | null;
  setValidationResults: (results: ValidationResults | null) => void;
  validationDialogOpen: boolean;
  setValidationDialogOpen: (open: boolean) => void;
  openValidationDialog: () => void;
  closeValidationDialog: () => void;
}

export const useValidationDialog = (): UseValidationDialogResult => {
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  const openValidationDialog = () => {
    setValidationDialogOpen(true);
  };

  const closeValidationDialog = () => {
    setValidationDialogOpen(false);
  };

  return {
    validationResults,
    setValidationResults,
    validationDialogOpen,
    setValidationDialogOpen,
    openValidationDialog,
    closeValidationDialog
  };
};
