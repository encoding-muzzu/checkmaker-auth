
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenValidation } from "@/hooks/useTokenValidation";

interface LoginFormProps {
  isProcessingUrlToken?: boolean;
}

export const LoginForm = ({ isProcessingUrlToken = false }: LoginFormProps) => {
  const [prepaidToken, setPrepaidToken] = useState("");
  const { isValidating, validateToken } = useTokenValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateToken(prepaidToken);
  };

  // Combined validation state - either from URL token or from form submission
  const isProcessing = isValidating || isProcessingUrlToken;

  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          M2P Forex DB Ops Admin Portal
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {isProcessingUrlToken
            ? "Processing token from URL..."
            : "Sign in with your prepaid token"}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
