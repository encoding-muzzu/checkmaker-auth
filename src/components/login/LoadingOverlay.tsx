
import { Loader2 } from "lucide-react";
import { TokenErrorDialog } from "./TokenErrorDialog";
import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
}

export function LoadingOverlay({ 
  isLoading, 
  errorMessage, 
  onClose 
}: LoadingOverlayProps) {
  const [showError, setShowError] = useState(false);
  
  // Show error dialog when error occurs
  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [errorMessage]);

  // Don't render anything if not loading and no error
  if (!isLoading && !errorMessage) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      {isLoading && !errorMessage ? (
        <div className="bg-white/90 rounded-lg p-10 flex flex-col items-center justify-center shadow-xl">
          <Loader2 className="h-16 w-16 text-black animate-spin mb-6" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Processing Token</h2>
          <p className="text-gray-600 text-center">
            Please wait while we validate your credentials
          </p>
        </div>
      ) : null}

      {/* Error Dialog */}
      <TokenErrorDialog 
        isOpen={!!errorMessage && showError} 
        onClose={onClose} 
        errorMessage={errorMessage || "An unknown error occurred"} 
      />
    </div>
  );
}
