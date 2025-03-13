
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenValidation } from "@/hooks/useTokenValidation";
import { TokenErrorDialog } from "./TokenErrorDialog";

interface LoginFormProps {
  urlToken?: string | null;
}

export const LoginForm = ({ urlToken }: LoginFormProps) => {
  const { isValidating, validateToken, tokenError, clearTokenError } = useTokenValidation();
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Automatically validate token if provided in URL
  useEffect(() => {
    if (urlToken && !validationAttempted) {
      validateToken(urlToken);
      setValidationAttempted(true);
    }
  }, [urlToken, validateToken, validationAttempted]);

  return (
    <>
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            M2P Forex DB Ops Admin Portal
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {isValidating ? "Token validation in progress..." : "Automatic token validation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValidating ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              {tokenError.isError && !isValidating && validationAttempted ? (
                <div className="p-4 border border-red-200 rounded-md bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-800">Validation Failed</h3>
                      <p className="text-sm text-red-700 mt-1">{tokenError.message}</p>
                    </div>
                  </div>
                </div>
              ) : validationAttempted && !isValidating && (
                <div className="text-center text-gray-500">
                  No valid token was found in the URL.
                  <p className="mt-2 text-sm">
                    Please ensure you're using a complete and valid URL with a token parameter.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Token Error Dialog */}
      <TokenErrorDialog 
        isOpen={tokenError.isError}
        onClose={clearTokenError}
        errorMessage={tokenError.message}
      />
    </>
  );
};
