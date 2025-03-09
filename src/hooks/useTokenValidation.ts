
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
      // Call the validate-token edge function using GET method
      const { data, error } = await supabase.functions.invoke("validate-token", {
        method: 'GET',
        // Pass the token as part of the URL in the query parameter
        headers: {
          'Content-Type': 'application/json',
        },
        query: { token: prepaidToken }
      });

      if (error) throw error;
      
      if (data.code !== 200) {
        throw new Error(data.message || "Token validation failed");
      }

      // Store the prepaid token in localStorage
      localStorage.setItem("prepaid_token", prepaidToken);
      
      // Replace the Supabase auth token
      const accessToken = data.data.access_token.access_token;
      localStorage.setItem("sb-dhgseybgaswdryynnomz-auth-token", JSON.stringify({
        access_token: accessToken,
        expires_at: data.data.access_token.expires_at,
        expires_in: data.data.access_token.expires_in,
        refresh_token: data.data.access_token.refresh_token,
        token_type: data.data.access_token.token_type,
        user: data.data.access_token.user
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

  return {
    isLoading,
    validateToken
  };
};
