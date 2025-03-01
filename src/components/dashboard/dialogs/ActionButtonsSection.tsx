
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsSectionProps {
  allDocumentsViewed: boolean;
  documentsExist: boolean;
  isSubmitting: boolean;
  handleApprove: () => void;
  handleRejectClick: () => void;
  isChecker: boolean;
  lrsLimitExceeded: boolean;
}

export const ActionButtonsSection = ({
  allDocumentsViewed,
  documentsExist,
  isSubmitting,
  handleApprove,
  handleRejectClick,
  isChecker,
  lrsLimitExceeded
}: ActionButtonsSectionProps) => {
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
        <div className="flex justify-end gap-3">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]" 
            onClick={handleApprove}
            disabled={isSubmitting || (documentsExist ? !allDocumentsViewed : false) || lrsLimitExceeded}
          >
            {isSubmitting ? "Processing..." : "Approve"}
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]" 
            onClick={handleRejectClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : isChecker ? "Return" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
};
