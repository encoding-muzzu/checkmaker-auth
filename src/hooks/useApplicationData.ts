
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useApplicationData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading, isFetching } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return [];
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        toast({
          title: "Error",
          description: "User profile not found",
          variant: "destructive",
          duration: 5000,
        });
        return [];
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          application_statuses!fk_status (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
          duration: 5000,
        });
        return [];
      }

      return data.map((app: any) => ({
        ...app,
        status_name: app.application_statuses.name,
        documents: app.documents || []
      })) as ApplicationData[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds to pick up new statuses
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['application-comments'] });
    queryClient.invalidateQueries({ queryKey: ['bulk-files'] });
    queryClient.invalidateQueries({ queryKey: ['bulk-processing-results'] });
  };

  // We combine isLoading (initial load) with isFetching (subsequent refreshes)
  const isLoadingData = isLoading || isFetching;

  return { applications, isLoading: isLoadingData, handleRefresh };
};
