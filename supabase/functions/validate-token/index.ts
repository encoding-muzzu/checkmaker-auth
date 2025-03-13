
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    // Check if the URL has a 'token' parameter
    const hasTokenParam = url.searchParams.has('token');
    if (!hasTokenParam) {
      return new Response(
        JSON.stringify({ code: 400, message: "No token parameter found in the URL." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if token is empty or null
    if (!token || token.trim() === '') {
      return new Response(
        JSON.stringify({ code: 400, message: "Token is required and cannot be empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Validating token:", token);
    
    // Simulate different error conditions based on token for testing purposes
    // In production, these would be real validations
    if (token === 'expired') {
      return new Response(
        JSON.stringify({ code: 401, message: "Token has expired. Please request a new token." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    if (token === 'invalid') {
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid token format or length" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    if (token === 'service-down') {
      return new Response(
        JSON.stringify({ code: 503, message: "Service is currently unavailable. Please try again later." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // Simple validation - check format and length
    if (token.length < 8) {
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid token format or length" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Return a successful response with real token data
    // In production, this would come from your actual authentication system
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour
    
    const responseData = {
      code: 200,
      message: "Success",
      data: {
        // Return actual token data based on your authentication system
        access_token: {
          // This should be generated dynamically in production
          access_token: "valid-access-token",
          token_type: "bearer",
          expires_in: expiresIn,
          expires_at: currentTime + expiresIn,
          refresh_token: "valid-refresh-token",
          user: {
            id: "user-id",
            aud: "authenticated",
            role: "authenticated",
            email: "user@example.com",
            email_confirmed_at: new Date().toISOString(),
            app_metadata: {
              provider: "email",
              providers: ["email"]
            },
            user_metadata: {
              email_verified: true
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        code: 500, 
        message: "Internal Server Error. The service is experiencing technical difficulties." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
