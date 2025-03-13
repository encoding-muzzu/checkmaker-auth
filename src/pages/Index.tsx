
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FeatureSection } from "@/components/login/FeatureSection";
import { LoginForm } from "@/components/login/LoginForm";
import { useTokenValidation } from "@/hooks/useTokenValidation";

function Index() {
  const [searchParams] = useSearchParams();
  const { validateToken, isValidating, validationAttempted } = useTokenValidation();
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
  const [attemptedValidation, setAttemptedValidation] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    
    // Only validate if we have a token, haven't attempted validation yet,
    // and the validation hasn't been attempted in the hook
    if (token && !attemptedValidation && !validationAttempted) {
      setTokenFromUrl(token);
      setAttemptedValidation(true);
      validateToken(token);
    }
  }, [searchParams, validateToken, validationAttempted, attemptedValidation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4">
      <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center">
        <FeatureSection />
        <div className="flex items-center justify-center w-full">
          <LoginForm isProcessingUrlToken={isValidating} urlToken={tokenFromUrl} />
        </div>
      </div>
    </div>
  );
}

export { Index };
