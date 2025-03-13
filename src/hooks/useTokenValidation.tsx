
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useTokenValidation = () => {
    const [isValidating, setIsValidating] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Get the Supabase URL from the client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dhgseybgaswdryynnomz.supabase.co";

    const checkTokenValidity = useCallback(async () => {
        try {
            console.log("Checking token validity...");
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Session error:", error);
                navigate('/');
                return false;
            }
            
            if (!session) {
                console.log("No active session found");
                navigate('/');
                return false;
            }
            
            console.log("Active session found");
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            toast({
                title: "Session Expired",
                description: "Your session has expired. Please log in again.",
                variant: "destructive",
            });
            navigate('/');
            return false;
        }
    }, [navigate, toast]);

    const validateToken = useCallback(async (prepaidToken: string) => {
        // Don't proceed if already validating or token is empty
        if (isValidating || !prepaidToken.trim()) return false;
        
        setIsValidating(true);
        console.log("Starting token validation for:", prepaidToken.substring(0, 5) + "...");
        
        try {
            // Make request to validate token edge function
            const response = await fetch(
                `${supabaseUrl}/functions/v1/validate-token?token=${encodeURIComponent(prepaidToken)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Token validation failed with status ${response.status}:`, errorText);
                throw new Error(`Token validation failed: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();
            console.log("Token validation response:", result);

            if (result.code === 200 && result.data?.access_token) {
                try {
                    console.log("Setting session with validated token...");
                    
                    // Properly set the session with the access token
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: result.data.access_token.access_token,
                        refresh_token: result.data.access_token.refresh_token
                    });
                    
                    if (sessionError) {
                        console.error("Error setting session:", sessionError);
                        toast({
                            title: "Error",
                            description: "Error setting user session. Please try again.",
                            variant: "destructive",
                        });
                        return false;
                    }
                    
                    console.log("Session successfully set, redirecting to dashboard");
                    // Redirect to dashboard
                    navigate('/dashboard');
                    return true;
                } catch (sessionError) {
                    console.error("Exception setting session:", sessionError);
                    toast({
                        title: "Error",
                        description: "Error setting user session. Please try again.",
                        variant: "destructive",
                    });
                    return false;
                }
            } else {
                console.error("Invalid token response structure:", result);
                toast({
                    title: "Error",
                    description: result.message || "Invalid token",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error: any) {
            console.error('Token validation error:', error);
            toast({
                title: "Error",
                description: error.message || "An error occurred during token validation",
                variant: "destructive",
            });
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [isValidating, navigate, supabaseUrl, toast]);

    return { validateToken, isValidating, checkTokenValidity };
};
