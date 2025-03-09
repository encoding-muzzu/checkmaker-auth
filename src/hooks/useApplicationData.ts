
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const useApplicationData = (page = 1, pageSize = 10, filters = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totalCount, setTotalCount] = useState(0);

  const { data: applications, isLoading, isFetching } = useQuery({
    queryKey: ['applications', page, pageSize, filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return { data: [], count: 0 };
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
        return { data: [], count: 0 };
      }

      // Build the query with filters
      let query = supabase
        .from('applications')
        .select(`
          *,
          application_statuses!fk_status (
            id,
            name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: true }); // Changed to ascending

      // Apply any filters
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.ilike(key, `%${value}%`);
          }
        });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
          duration: 5000,
        });
        return { data: [], count: 0 };
      }

      // Update total count
      if (count !== null) {
        setTotalCount(count);
      }

      const formattedData = data.map((app: any) => ({
        ...app,
        status_name: app.application_statuses.name,
        documents: app.documents || []
      })) as ApplicationData[];

      console.log("API Response:", formattedData);

      return { 
        data: formattedData,
        count: count || 0 
      };
    }
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['application-comments'] });
  };

  // We combine isLoading (initial load) with isFetching (subsequent refreshes)
  const isLoadingData = isLoading || isFetching;

  return { 
    applications: applications?.data || [], 
    totalCount: applications?.count || 0,
    isLoading: isLoadingData, 
    handleRefresh 
  };
};
