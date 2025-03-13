import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useTokenValidation = () => {
    const [isValidating, setIsValidating] = useState(false);
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
        // Don't proceed if already validating or token is empty
        if (isValidating || !prepaidToken.trim()) return false;
        
        setIsValidating(true);
        // Clear any previous errors
        setTokenError({ isError: false, message: "" });
        
        try {
            const response = await fetch(
                `${supabaseUrl}/functions/v1/validate-token?token=${encodeURIComponent(prepaidToken)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            const result = await response.json();

            if (result.code === 200 && result.data?.access_token) {
                // Set the session
                const { access_token } = result.data;
                await supabase.auth.setSession(access_token);
                
                // Redirect to dashboard
                navigate('/dashboard');
                return true;
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
    }, [isValidating, navigate, supabaseUrl]);

    return { 
        validateToken, 
        isValidating, 
        checkTokenValidity,
        tokenError,
        clearTokenError
    };
};
