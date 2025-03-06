
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProcessingAuth = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const currentUserId = session?.user?.id || null;

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!currentUserId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUserId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId,
  });

  const userRole = userProfile?.role || null;
  const isMaker = userRole === 'maker';
  const isChecker = userRole === 'checker';

  return {
    currentUserId,
    userRole,
    isMaker,
    isChecker
  };
};
