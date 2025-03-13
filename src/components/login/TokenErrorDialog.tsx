
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
  // Process the error message to improve the user experience
  let title = "Authentication Error";
  let icon = <AlertCircle className="h-5 w-5" />;
  let description = "We encountered an issue while validating your token.";
  
  // Customize the dialog based on the error message
  if (errorMessage.includes("No token provided") || errorMessage.includes("wrong parameter")) {
    title = "Missing Token";
    description = "No valid token was found in the URL.";
  } else if (errorMessage.includes("expired")) {
    title = "Token Expired";
    description = "Your authentication token has expired.";
  } else if (errorMessage.includes("Service is currently unavailable")) {
    title = "Service Unavailable";
    description = "We're experiencing technical difficulties.";
  } else if (errorMessage.includes("Invalid token format")) {
    title = "Invalid Token";
    description = "The provided token format is not recognized.";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 border-y border-y-gray-100">
          <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
          <p className="text-xs text-gray-500 mt-2">
            If this issue persists, please contact support for assistance.
          </p>
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
