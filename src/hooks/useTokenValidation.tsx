
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
            const response = await fetch(
                `${supabaseUrl}/functions/v1/validate-token?token=${encodeURIComponent(prepaidToken)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'omit' // Don't send cookies with cross-origin requests
                }
            );
            
            if (!response.ok) {
                throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log("Validation result:", result);

            if (result.code === 200 && result.data?.access_token) {
                try {
                    // Set the session with the complete session object
                    await supabase.auth.setSession({
                        access_token: result.data.access_token.access_token,
                        refresh_token: result.data.access_token.refresh_token
                    });
                    
                    // Redirect to dashboard
                    navigate('/dashboard');
                    return true;
                } catch (sessionError: any) {
                    console.error('Error setting session:', sessionError);
                    setTokenError({
                        isError: true,
                        message: "Error setting user session. Please try again."
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
