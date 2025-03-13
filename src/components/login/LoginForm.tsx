
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenValidation } from "@/hooks/useTokenValidation";
import { TokenErrorDialog } from "./TokenErrorDialog";

interface LoginFormProps {
  isProcessingUrlToken?: boolean;
  urlToken?: string | null;
}

export const LoginForm = ({ isProcessingUrlToken = false, urlToken = null }: LoginFormProps) => {
  const [prepaidToken, setPrepaidToken] = useState("");
  const { isValidating, validateToken, tokenError, clearTokenError, validationAttempted } = useTokenValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateToken(prepaidToken);
  };

  // Show URL token in the input field if it exists
  useEffect(() => {
    if (urlToken) {
      setPrepaidToken(urlToken);
    }
  }, [urlToken]);

  // Combined validation state - either from URL token or from form submission
  const isProcessing = isValidating || isProcessingUrlToken;

  // Determine whether to show manual input or validation message
  const showManualInput = !isProcessingUrlToken && (!urlToken || tokenError.isError);

  return (
    <>
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            M2P Forex DB Ops Admin Portal
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {isProcessingUrlToken
              ? "Processing token from URL..."
              : urlToken && !tokenError.isError && validationAttempted
              ? "Token validation completed. Processing login..."
              : "Sign in with your prepaid token"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showManualInput ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prepaidToken" className="text-sm font-medium text-gray-700">Prepaid Token</Label>
                <Textarea
                  id="prepaidToken"
                  placeholder="Enter your prepaid token"
                  className="h-24 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  value={prepaidToken}
                  onChange={(e) => setPrepaidToken(e.target.value)}
                  disabled={isProcessing}
                />
                {tokenError.isError && (
                  <p className="text-sm text-red-500 mt-1">{tokenError.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-black hover:bg-gray-800 text-white transition-all duration-300"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
              <p className="text-gray-600">
                {isProcessingUrlToken ? "Validating your token..." : "Processing login..."}
              </p>
            </div>
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
