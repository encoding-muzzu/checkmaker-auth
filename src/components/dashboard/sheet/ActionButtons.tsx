
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ActionButtonsProps {
  showButtons: boolean;
  isSubmitting: boolean;
  exceedsLimit: boolean;
  totalAmount: number;
  documentsExist: boolean;
  allDocumentsViewed: boolean;
  onApprove: () => void;
  onReject: () => void;
  isChecker: boolean;
}

export const ActionButtons = ({
  showButtons,
  isSubmitting,
  exceedsLimit,
  totalAmount,
  documentsExist,
  allDocumentsViewed,
  onApprove,
  onReject,
  isChecker
}: ActionButtonsProps) => {
  if (!showButtons) return null;
  
  return (
    <div className="p-6 border-t bg-white mt-auto">
      <div className="flex flex-col gap-4">
        {documentsExist && !allDocumentsViewed && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-amber-700 text-sm">
              Please view all the documents to approve this application.
            </p>
          </div>
        )}
        {exceedsLimit && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-amber-700 text-sm">
              Total Amount + LRS Amount Consumed exceeds $250,000 USD limit ({totalAmount.toFixed(2)} USD)
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]" 
            onClick={onApprove}
            disabled={isSubmitting || 
                      (documentsExist ? !allDocumentsViewed : false) || 
                      exceedsLimit}
          >
            {isSubmitting ? "Processing..." : "Approve"}
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]" 
            onClick={onReject}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : isChecker ? "Return" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
};
