
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FeatureSection } from "@/components/login/FeatureSection";
import { LoginForm } from "@/components/login/LoginForm";

function Index() {
  const [searchParams] = useSearchParams();
  const [urlToken, setUrlToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract token from URL parameters
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setUrlToken(tokenFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4">
      <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center">
        <FeatureSection />
        <div className="flex items-center justify-center w-full">
          <LoginForm urlToken={urlToken} />
        </div>
      </div>
    </div>
  );
}

export { Index };
