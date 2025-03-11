
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Define an interface for the filters object
interface FiltersType {
  from_dt?: string;
  to_dt?: string;
  application_type?: string;
  [key: string]: any; // Allow for other filter properties
}

export const useApplicationData = (page = 1, pageSize = 10, filters: FiltersType = {}, activeTab = "", userRole = null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totalCount, setTotalCount] = useState(0);

  // Get status IDs based on active tab and user role
  const getStatusIds = (tab: string, role: string | null): number[] => {
    if (!role) return [];
    
    if (role === 'checker') {
      switch (tab) {
        case "pending":
          return [1, 4]; // Pending and Hold for checker
        case "completed":
          return [2, 3]; // Completed and Returned for checker
        default:
          return [];
      }
    } else { // Maker role
      switch (tab) {
        case "pending":
          return [0]; // Draft for maker
        case "completed":
          return [1, 2, 4]; // Pending, Completed and Hold for maker
        case "reopened":
          return [3]; // Returned for maker
        default:
          return [];
      }
    }
  };

  // Only apply status filters for non-search tabs and non-bulk tabs
  const shouldApplyStatusFilter = activeTab !== "search" && activeTab !== "bulkData";
  const statusIds = shouldApplyStatusFilter ? getStatusIds(activeTab, userRole) : [];

  const { data: applications, isLoading, isFetching } = useQuery({
    queryKey: ['applications', page, pageSize, filters, activeTab, userRole, statusIds],
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
        `, { count: 'exact' });

      // Apply status filters for non-search and non-bulk tabs
      if (shouldApplyStatusFilter && statusIds.length > 0) {
        query = query.in('status_id', statusIds);
      }

      // Apply date range filters if they exist
      if (filters.from_dt) {
        query = query.gte('created_at', filters.from_dt);
      }
      
      if (filters.to_dt) {
        query = query.lte('created_at', filters.to_dt);
      }
      
      // Apply application type filter if it exists
      if (filters.application_type) {
        query = query.eq('application_type', filters.application_type);
      }

      // Apply any other search filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'from_dt' && key !== 'to_dt' && key !== 'application_type') {
          query = query.ilike(key, `%${value}%`);
        }
      });

      // Add ordering - most recent first for all tabs
      query = query.order('created_at', { ascending: false });

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

      // Update total count - ensure it's a number
      if (count !== null) {
        setTotalCount(count !== null ? Number(count) : 0);
      }

      return { 
        data: data.map((app: any) => ({
          ...app,
          status_name: app.application_statuses.name,
          documents: app.documents || []
        })) as ApplicationData[],
        count: count !== null ? Number(count) : 0 
      };
    },
    refetchOnWindowFocus: false // Disable auto-refresh
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
