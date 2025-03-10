
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, X } from "lucide-react";

interface RejectFormProps {
  isChecker: boolean;
  isSubmitting: boolean;
  rejectMessage: string;
  setRejectMessage: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RejectForm = ({
  isChecker,
  isSubmitting,
  rejectMessage,
  setRejectMessage,
  onCancel,
  onConfirm
}: RejectFormProps) => {
  return (
    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-red-700">
            {isChecker ? 'Return Application' : 'Reject Application'}
          </h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <Textarea
        value={rejectMessage}
        onChange={(e) => {
          // Limit to 300 characters
          if (e.target.value.length <= 300) {
            setRejectMessage(e.target.value);
          }
        }}
        placeholder={`Enter your ${isChecker ? 'return' : 'rejection'} reason here...`}
        className="min-h-[120px] resize-none border-red-200 focus:border-red-500 focus:ring-red-500 mb-3"
        maxLength={300}
      />
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500">
          {rejectMessage.length}/300 characters
        </span>
      </div>
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={!rejectMessage.trim() || isSubmitting}
        >
          {isSubmitting ? "Processing..." : isChecker ? "Confirm Return" : "Confirm Reject"}
        </Button>
      </div>
    </div>
  );
};
