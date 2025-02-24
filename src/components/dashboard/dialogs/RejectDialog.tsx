
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectMessage: string;
  setRejectMessage: (message: string) => void;
  onConfirm: () => void;
}

export const RejectDialog = ({
  open,
  onOpenChange,
  rejectMessage,
  setRejectMessage,
  onConfirm
}: RejectDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        onClick={(e) => e.stopPropagation()} 
        className="z-[100] max-w-[500px] p-0 gap-0"
      >
        <div className="border-b border-gray-200 bg-red-50">
          <AlertDialogHeader className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertDialogTitle className="text-lg font-semibold text-red-700">
                Confirm Rejection
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-red-600 mt-2">
              Please provide a detailed reason for rejecting this application.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="p-6">
          <Textarea
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            placeholder="Enter your rejection reason here..."
            className="min-h-[120px] resize-none border-gray-300 focus:border-red-500 focus:ring-red-500"
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <AlertDialogFooter className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Rejection
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
