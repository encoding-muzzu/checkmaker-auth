
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

    // In a real implementation, you would validate the token against a database or service
    // For this example, we're mocking a successful response
    
    console.log("Validating token:", token);
    
    // For demonstration, let's check if the token has "invalid" in it to simulate an error
    if (token.includes("invalid")) {
      return new Response(
        JSON.stringify({ 
          code: 401, 
          message: "Invalid token. Please check your credentials and try again." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Mock response data
    const responseData = {
      code: 200,
      message: "Success",
      data: {
        access_token: {
          access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZ3NleWJnYXN3ZHJ5eW5ub216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NzY1MzcsImV4cCI6MjA1NTA1MjUzN30.nmbxHHpWAOweYiM3OsgcUcfvYn8AO_L4VVesEAOOz-E",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: "NaV9-0BT6_iTWFoNywh5Bg",
          user: {
            id: "8c657d08-32d8-4a65-a950-e930d4b21d69",
            aud: "authenticated",
            role: "authenticated",
            email: "1400870@hdfc-temp.com",
            email_confirmed_at: "2025-03-09T12:31:05.980079Z",
            phone: "",
            confirmed_at: "2025-03-09T12:31:05.980079Z",
            last_sign_in_at: "2025-03-09T14:29:03.701486834Z",
            app_metadata: {
              provider: "email",
              providers: [
                "email"
              ]
            },
            user_metadata: {
              email_verified: true
            },
            identities: [
              {
                identity_id: "4062b00f-9451-4fb5-88ae-e724a9070ce9",
                id: "8c657d08-32d8-4a65-a950-e930d4b21d69",
                user_id: "8c657d08-32d8-4a65-a950-e930d4b21d69",
                identity_data: {
                  email: "1400870@hdfc-temp.com",
                  email_verified: false,
                  phone_verified: false,
                  sub: "8c657d08-32d8-4a65-a950-e930d4b21d69"
                },
                provider: "email",
                last_sign_in_at: "2025-03-09T12:31:05.977841Z",
                created_at: "2025-03-09T12:31:05.977911Z",
                updated_at: "2025-03-09T12:31:05.977911Z",
                email: "1400870@hdfc-temp.com"
              }
            ],
            created_at: "2025-03-09T12:31:05.974004Z",
            updated_at: "2025-03-09T14:29:03.718941Z",
            is_anonymous: false
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
