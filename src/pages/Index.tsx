
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FeatureSection } from "@/components/login/FeatureSection";
import { LoginForm } from "@/components/login/LoginForm";
import { useTokenValidation } from "@/hooks/useTokenValidation";
import { LoadingOverlay } from "@/components/login/LoadingOverlay";

function Index() {
  const [searchParams] = useSearchParams();
  const { validateToken, isValidating, validationAttempted, tokenError, clearTokenError } = useTokenValidation();
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
  const [attemptedValidation, setAttemptedValidation] = useState(false);

  useEffect(() => {
    // Get the token parameter, checking both 'token' and any misspelled variants
    const allParams = Array.from(searchParams.entries());
    const tokenParam = allParams.find(([key]) => 
      key.toLowerCase() === 'token' || key.toLowerCase().includes('tok')
    );
    
    const token = tokenParam ? tokenParam[1] : null;
    
    // Only validate if we haven't attempted validation yet
    if (!attemptedValidation && !validationAttempted) {
      if (token) {
        setTokenFromUrl(token);
        setAttemptedValidation(true);
        validateToken(token);
      } else if (searchParams.toString() && !token) {
        // If URL has parameters but no valid token
        setAttemptedValidation(true);
        // Trigger error for missing token
        validateToken("");
      }
    }
  }, [searchParams, validateToken, validationAttempted, attemptedValidation]);

  const handleCloseError = () => {
    clearTokenError();
    setTokenFromUrl(null);
    setAttemptedValidation(false);
  };

  return (
    <>
      {/* Full-screen loading overlay for token processing */}
      <LoadingOverlay 
        isLoading={isValidating} 
        errorMessage={tokenError.isError ? tokenError.message : null}
        onClose={handleCloseError}
      />

      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4">
        <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center">
          <FeatureSection />
          <div className="flex items-center justify-center w-full">
            <LoginForm 
              isProcessingUrlToken={isValidating} 
              urlToken={tokenFromUrl} 
              urlTokenError={tokenError.isError ? tokenError.message : null}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export { Index };
