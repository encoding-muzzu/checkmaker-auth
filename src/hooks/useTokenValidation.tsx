
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTokenValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateToken = async (prepaidToken: string) => {
    if (!prepaidToken) {
      toast({
        variant: "destructive",
        title: "Prepaid token is required",
        description: "Please enter a valid prepaid token",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabaseUrl = supabase.supabaseUrl;
      
      // Use fetch with the supabase URL
      const response = await fetch(
        `${supabaseUrl}/functions/v1/validate-token?token=${encodeURIComponent(prepaidToken)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(data.message || "Token validation failed");
      }

      // Store the prepaid token in localStorage
      localStorage.setItem("prepaid_token", prepaidToken);
      
      // Replace the Supabase auth token
      const accessToken = data.data.access_token;
      localStorage.setItem("sb-dhgseybgaswdryynnomz-auth-token", JSON.stringify({
        access_token: accessToken.access_token,
        expires_at: accessToken.expires_at,
        expires_in: accessToken.expires_in,
        refresh_token: accessToken.refresh_token,
        token_type: accessToken.token_type,
        user: accessToken.user
      }));

      toast({
        title: "Login successful",
        description: "Welcome to the dashboard",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your token",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenValidity = () => {
    const prepaidToken = localStorage.getItem("prepaid_token");
    if (!prepaidToken) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please login with your prepaid token",
        action: (
          <button 
            className="bg-white text-black px-3 py-1 rounded text-xs"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        )
      });
      navigate('/');
      return false;
    }
    return true;
  };

  return {
    isLoading,
    validateToken,
    checkTokenValidity
  };
};
