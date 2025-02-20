import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { useToast } from "@/components/ui/use-toast";

export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchColumn, setSearchColumn] = useState("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ApplicationData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
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
    }
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out",
      });
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['application-comments'] });
  };

  const handleSearch = async () => {
    if (!searchQuery || !searchColumn) {
      toast({
        title: "Search Error",
        description: "Please select a field and enter a search term",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      let query = supabase
        .from('applications')
        .select(`
          *,
          application_statuses!fk_status (
            id,
            name
          )
        `);

      if (searchColumn === 'id') {
        query = query.eq(searchColumn, searchQuery);
      } else {
        query = query.ilike(searchColumn, `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to perform search",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      setSearchResults(
        (data || []).map((app: any) => ({
          ...app,
          status_name: app.application_statuses.name,
          documents: app.documents || []
        })) as ApplicationData[]
      );
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const getFilteredApplications = () => {
    if (!applications || !userRole) return [];

    if (activeTab === "search") {
      return searchResults;
    }
    
    if (userRole === 'checker') {
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 1 || app.status_id === 4);
        case "completed":
          return applications.filter(app => app.status_id === 2 || app.status_id === 3);
        default:
          return [];
      }
    } else {
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 0);
        case "completed":
          return applications.filter(app => app.status_id === 1 || app.status_id === 4);
        case "reopened":
          return applications.filter(app => app.status_id === 3);
        default:
          return [];
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    entriesPerPage,
    setEntriesPerPage,
    currentPage,
    setCurrentPage,
    userRole,
    setUserRole,
    applications,
    isLoading,
    handleLogout,
    handleRefresh,
    handleSearch,
    getFilteredApplications,
    searchResults,
    setSearchResults
  };
};
