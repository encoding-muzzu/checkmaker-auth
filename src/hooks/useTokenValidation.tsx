
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useTokenValidation = () => {
    const [isValidating, setIsValidating] = useState(false);
    const [validationAttempted, setValidationAttempted] = useState(false);
    const [tokenError, setTokenError] = useState<{ isError: boolean; message: string }>({
        isError: false,
        message: ""
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    // Get the Supabase URL from the client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dhgseybgaswdryynnomz.supabase.co";

    const checkTokenValidity = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/');
                return false;
            }
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

    const clearTokenError = useCallback(() => {
        setTokenError({ isError: false, message: "" });
    }, []);

    const validateToken = useCallback(async (prepaidToken: string) => {
        // Don't proceed if already validating, validation was already attempted, or token is empty
        if (isValidating || validationAttempted || !prepaidToken.trim()) return false;
        
        setIsValidating(true);
        setValidationAttempted(true);
        // Clear any previous errors
        setTokenError({ isError: false, message: "" });
        
        try {
            console.log("Validating token:", prepaidToken);
            
            // Determine the correct base URL for API calls
            let apiBaseUrl = supabaseUrl;
            console.log("Using API base URL:", apiBaseUrl);
            
            const response = await fetch(
                `${apiBaseUrl}/functions/v1/validate-token?token=${encodeURIComponent(prepaidToken)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            const result = await response.json();
            console.log("Validation result:", result);

            if (result.code === 200 && result.data?.access_token) {
                // Extract token data
                const tokenData = result.data.access_token;
                
                console.log("Setting session with tokens:", {
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                });
                
                try {
                    // Set the session using the proper structure that Supabase expects
                    const { error } = await supabase.auth.setSession({
                        access_token: tokenData.access_token,
                        refresh_token: tokenData.refresh_token,
                    });
                    
                    if (error) {
                        console.error("Error setting session:", error);
                        setTokenError({ 
                            isError: true, 
                            message: "Error setting user session. Please try again." 
                        });
                        return false;
                    }
                    
                    console.log("Session set successfully");
                    
                    // Verify the session was set correctly
                    const { data: sessionData } = await supabase.auth.getSession();
                    console.log("Current session after setting:", sessionData);
                    
                    if (!sessionData.session) {
                        console.error("Session could not be verified after setting");
                        setTokenError({ 
                            isError: true, 
                            message: "Unable to verify session. Please try again." 
                        });
                        return false;
                    }
                    
                    // Redirect to dashboard
                    navigate('/dashboard');
                    return true;
                } catch (sessionError) {
                    console.error("Exception during session setup:", sessionError);
                    setTokenError({ 
                        isError: true, 
                        message: "An error occurred during session setup. Please try again." 
                    });
                    return false;
                }
            } else {
                // Set the error state with the message from the API
                setTokenError({ 
                    isError: true, 
                    message: result.message || "Invalid token" 
                });
                return false;
            }
        } catch (error: any) {
            console.error('Token validation error:', error);
            // Set the error state with the error message
            setTokenError({ 
                isError: true, 
                message: error.message || "An error occurred during token validation"
            });
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [isValidating, validationAttempted, navigate, supabaseUrl]);

    return { 
        validateToken, 
        isValidating, 
        validationAttempted,
        checkTokenValidity,
        tokenError,
        clearTokenError
    };
};
