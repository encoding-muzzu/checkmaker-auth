
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useTokenValidation = () => {
    const [isValidating, setIsValidating] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Get the Supabase URL from the client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dhgseybgaswdryynnomz.supabase.co";

    const checkTokenValidity = async () => {
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
    };

    const validateToken = async (prepaidToken: string) => {
        setIsValidating(true);
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
    };

    return { validateToken, isValidating, checkTokenValidity };
};
