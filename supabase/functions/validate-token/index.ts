
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

    if (!token) {
      return new Response(
        JSON.stringify({ code: 400, message: "Token is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Validating token:", token);
    
    // Here you would implement real token validation logic
    // This is just basic validation - in production, you'd verify against a database
    
    // Simple validation - check format and length
    if (token.length < 8) {
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid token format or length" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // For demo purposes - we're returning a valid response if the token passes basic validation
    // In a real implementation, you would check the token against your database
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour
    
    const responseData = {
      code: 200,
      message: "Success",
      data: {
        access_token: {
          access_token: token + "-validated", // Append suffix to indicate validation
          token_type: "bearer",
          expires_in: expiresIn,
          expires_at: currentTime + expiresIn,
          refresh_token: token + "-refresh",
          user: {
            id: "user-" + token.substring(0, 8),
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
      JSON.stringify({ code: 500, message: "Internal Server Error", error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
