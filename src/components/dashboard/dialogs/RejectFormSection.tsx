
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, X } from "lucide-react";
import { RefObject } from "react";

interface RejectFormSectionProps {
  isChecker: boolean;
  rejectMessage: string;
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  charCount: number;
  exceedsLimit: boolean;
  maxCharLimit: number;
  handleCancelReject: () => void;
  handleConfirmReject: () => void;
  isSubmitting: boolean;
}

export const RejectFormSection = ({
  isChecker,
  rejectMessage,
  handleMessageChange,
  charCount,
  exceedsLimit,
  maxCharLimit,
  handleCancelReject,
  handleConfirmReject,
  isSubmitting
}: RejectFormSectionProps) => {
  return (
    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-red-700">
            {isChecker ? 'Return Application' : 'Reject Application'}
          </h3>
        </div>
        <button onClick={handleCancelReject} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative">
        <Textarea
          value={rejectMessage}
          onChange={handleMessageChange}
          placeholder={`Enter your ${isChecker ? 'return' : 'rejection'} reason here...`}
          className={`min-h-[120px] resize-none ${exceedsLimit ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-red-200 focus:border-red-500 focus:ring-red-500'} mb-1`}
          maxLength={maxCharLimit}
        />
        <div className="flex justify-end text-sm">
          <span className={`${exceedsLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {charCount}/{maxCharLimit} characters
          </span>
        </div>
        {exceedsLimit && (
          <p className="text-red-500 text-sm mt-1">
            Message exceeds maximum character limit of {maxCharLimit}.
          </p>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-3">
        <Button
          variant="outline"
          onClick={handleCancelReject}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmReject}
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={!rejectMessage.trim() || exceedsLimit || isSubmitting}
        >
          {isSubmitting ? "Processing..." : isChecker ? "Confirm Return" : "Confirm Reject"}
        </Button>
      </div>
    </div>
  );
};
