
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FeatureSection } from "@/components/login/FeatureSection";
import { LoginForm } from "@/components/login/LoginForm";
import { useTokenValidation } from "@/hooks/useTokenValidation";

function Index() {
  const [searchParams] = useSearchParams();
  const { validateToken, isValidating } = useTokenValidation();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      validateToken(tokenFromUrl);
    }
  }, [searchParams, validateToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4">
      <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center">
        <FeatureSection />
        <div className="flex items-center justify-center w-full">
          <LoginForm isProcessingUrlToken={isValidating} />
        </div>
      </div>
    </div>
  );
}

export { Index };
