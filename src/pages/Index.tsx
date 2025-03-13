
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FeatureSection } from "@/components/login/FeatureSection";
import { LoginForm } from "@/components/login/LoginForm";
import { useTokenValidation } from "@/hooks/useTokenValidation";

function Index() {
  const [searchParams] = useSearchParams();
  const { validateToken, isValidating, validationAttempted } = useTokenValidation();
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token && !validationAttempted) {
      setTokenFromUrl(token);
      validateToken(token);
    }
  }, [searchParams, validateToken, validationAttempted]);

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
