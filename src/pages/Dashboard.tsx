
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ApplicationData } from "@/types/dashboard";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { BulkDataTab } from "@/components/dashboard/BulkDataTab";
import { useToast } from "@/components/ui/use-toast";

export function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationData[] | undefined>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchResults, setSearchResults] = useState<ApplicationData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [bulkFileCount, setBulkFileCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get the DISABLE_BULK_DATA environment variable
  const isBulkDataDisabled = import.meta.env.VITE_DISABLE_BULK_DATA === 'true';

  const checkTokenValidity = useCallback(async () => {
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
  }, [navigate, toast]);

  useEffect(() => {
    const fetchData = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) return;

      try {
        // Fetch user data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, role')
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        setUserName(profile?.username || 'User');
        setUserRole(profile?.role || 'user');

        // Fetch applications based on role
        let query = supabase
          .from('applications')
          .select('*, application_statuses!fk_status (id, name)');

        if (profile?.role === 'checker') {
          // Checker sees applications with status 1 or 4
          query = query.in('status_id', [1, 4]);
        } else {
          // Maker sees applications with status 0
          query = query.eq('status_id', 0);
        }

        const { data: applicationsData, error: applicationsError, count } = await query;

        if (applicationsError) {
          console.error("Error fetching applications:", applicationsError);
          throw applicationsError;
        }

        // Map the data to include status_name from the joined table
        const mappedData = applicationsData.map(app => ({
          ...app,
          status_name: app.application_statuses.name,
          documents: app.documents || []
        })) as ApplicationData[];

        setApplications(mappedData);
        setTotalCount(count || 0);

         // Fetch bulk file count
         const { count: bulkCount, error: bulkError } = await supabase
         .from('bulk_file_processing')
         .select('*', { count: 'exact', head: true });

         if (bulkError) {
           console.error("Error fetching bulk file count:", bulkError);
         }

         setBulkFileCount(bulkCount || 0);

      } catch (error: any) {
        console.error("Error in fetchData:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [checkTokenValidity, toast]);

  const handleRefresh = useCallback(async () => {
    const isValid = await checkTokenValidity();
    if (!isValid) return;

    try {
      // Fetch applications based on role
      let query = supabase
        .from('applications')
        .select('*, application_statuses!fk_status (id, name)');

      if (userRole === 'checker') {
        // Checker sees applications with status 1 or 4
        query = query.in('status_id', [1, 4]);
      } else {
        // Maker sees applications with status 0
        query = query.eq('status_id', 0);
      }

      const { data: applicationsData, error: applicationsError, count } = await query;

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }

      // Map the data to include status_name from the joined table
      const mappedData = applicationsData.map(app => ({
        ...app,
        status_name: app.application_statuses.name,
        documents: app.documents || []
      })) as ApplicationData[];

      setApplications(mappedData);
      setTotalCount(count || 0);

      // Fetch bulk file count
      const { count: bulkCount, error: bulkError } = await supabase
        .from('bulk_file_processing')
        .select('*', { count: 'exact', head: true });

      if (bulkError) {
        console.error("Error fetching bulk file count:", bulkError);
      }

      setBulkFileCount(bulkCount || 0);

      toast({
        title: "Applications Refreshed",
        description: "The application data has been updated.",
      });
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh data.",
        variant: "destructive",
      });
    }
  }, [checkTokenValidity, toast, userRole]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardHeader userRole={userRole} onLogout={handleLogout} />
      
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applications={applications}
        userRole={userRole}
        onRefresh={handleRefresh}
        setSearchResults={setSearchResults}
        bulkDataCount={bulkFileCount}
        totalCount={totalCount}
        isBulkDataDisabled={isBulkDataDisabled}
      />

      {activeTab === "pending" && (
        <ApplicationTable
          applications={applications}
          userRole={userRole}
          activeTab={activeTab}
        />
      )}
      {activeTab === "completed" && (
        <ApplicationTable
          applications={applications}
          userRole={userRole}
          activeTab={activeTab}
        />
      )}
      {activeTab === "reopened" && (
        <ApplicationTable
          applications={applications}
          userRole={userRole}
          activeTab={activeTab}
        />
      )}
      {activeTab === "search" && (
        <SearchBar setSearchResults={setSearchResults} />
      )}
      {activeTab === "search" && searchResults.length > 0 && (
        <ApplicationTable
          applications={searchResults}
          userRole={userRole}
          activeTab={activeTab}
        />
      )}
      
      {/* Only render the Bulk Data tab if it's not disabled */}
      {activeTab === "bulkData" && !isBulkDataDisabled && <BulkDataTab />}
      
      <div className="fixed bottom-4 right-4">
        <div className="toaster">
          <div id="root" style={{ position: 'relative', zIndex: 9999 }}></div>
        </div>
      </div>
    </div>
  );
}
