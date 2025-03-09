
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [prepaidToken, setPrepaidToken] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Call the validate-token edge function
      const { data, error } = await supabase.functions.invoke("validate-token", {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4">
      <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl h-[600px] shadow-2xl">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              M2P Forex DB Ops
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              The DB Ops Portal streamlines card issuance with detailed review processes for Makers and Checkers, integrating with Prepaid systems for automated updates and notifications.
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p>Streamlined Card Issuance</p>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p>Automated System Updates</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center w-full">
          <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                M2P Forex DB Ops Admin Portal
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Sign in with your prepaid token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prepaidToken" className="text-sm font-medium text-gray-700">Prepaid Token</Label>
                  <Textarea
                    id="prepaidToken"
                    placeholder="Enter your prepaid token"
                    className="h-24 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                    value={prepaidToken}
                    onChange={(e) => setPrepaidToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-black hover:bg-gray-800 text-white transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { Index };
