
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isChecker: boolean;
}

export const RejectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isChecker
}: RejectDialogProps) => {
  const [remarks, setRemarks] = useState("");

  const handleConfirm = () => {
    onConfirm();
    setRemarks("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-gray-50">
          <DialogTitle>
            {isChecker ? "Return Application" : "Reject Application"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Please provide detailed remarks
              </label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks here..."
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!remarks.trim()}
            >
              {isChecker ? "Return" : "Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
