
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TokenErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export function TokenErrorDialog({
  isOpen,
  onClose,
  errorMessage,
}: TokenErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Authentication Error
          </DialogTitle>
          <DialogDescription>
            We encountered an issue while validating your token.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 border-y border-y-gray-100">
          <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
