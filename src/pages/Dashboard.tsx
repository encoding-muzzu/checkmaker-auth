
import { useState, useEffect } from "react";
import { TabButton } from "@/components/dashboard/TabButton";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
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

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    };

    fetchUserRole();
  }, [navigate]);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          application_statuses!inner (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          application_statuses!inner (
            id,
            name
          )
        `)
        .ilike(searchColumn, `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
          return applications.filter(app => app.status_id === 2);
        case "reopened":
          return applications.filter(app => app.status_id === 3);
        default:
          return [];
      }
    } else {
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 0);
        case "completed":
          return applications.filter(app => app.status_id === 1 || app.status_id === 2);
        case "reopened":
          return applications.filter(app => app.status_id === 3);
        default:
          return [];
      }
    }
  };

  const pageSize = parseInt(entriesPerPage);
  const filteredData = getFilteredApplications();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleEntriesPerPageChange = (value: string) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const searchableColumns = [
    { value: "id", label: "Application ID" },
    { value: "arn", label: "ARN" },
    { value: "kit_no", label: "Kit No" },
    { value: "customer_name", label: "Customer Name" },
    { value: "pan_number", label: "PAN" },
    { value: "customer_type", label: "Customer Type" },
    { value: "product_variant", label: "Product Variant" },
    { value: "card_type", label: "Card Type" },
    { value: "processing_type", label: "Processing Type" },
    { value: "status", label: "Status" }
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{userRole === 'checker' ? 'Checker' : 'Maker'} Dashboard</h1>
        <Button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-black hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="border-b mb-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <TabButton
              isActive={activeTab === "pending"}
              label="Pending"
              count={userRole === 'checker' 
                ? (applications?.filter(app => app.status_id === 1 || app.status_id === 4).length || 0)
                : (applications?.filter(app => app.status_id === 0).length || 0)
              }
              onClick={() => setActiveTab("pending")}
            />
            <TabButton
              isActive={activeTab === "completed"}
              label="Completed"
              count={userRole === 'checker'
                ? (applications?.filter(app => app.status_id === 2).length || 0)
                : (applications?.filter(app => [1, 2].includes(app.status_id)).length || 0)
              }
              onClick={() => setActiveTab("completed")}
            />
            <TabButton
              isActive={activeTab === "reopened"}
              label="Re-Opened"
              count={applications?.filter(app => app.status_id === 3).length || 0}
              onClick={() => setActiveTab("reopened")}
            />
            <button
              className={activeTab === "search"
                ? "pb-4 px-1 relative text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "pb-4 px-1 relative text-gray-500 hover:text-gray-800 transition-colors"}
              onClick={() => {
                setActiveTab("search");
                setSearchResults([]);
              }}
            >
              Search
            </button>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            className="mr-4"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {activeTab === "search" && (
        <div className="bg-white border-b border-[#e0e0e0] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
            <SearchControls
              searchColumn={searchColumn}
              searchQuery={searchQuery}
              onSearchColumnChange={setSearchColumn}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              searchableColumns={searchableColumns}
            />
          </div>
        </div>
      )}

      <div className="bg-white border-b border-[#e0e0e0] mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="entries-per-page" className="text-sm text-gray-600 whitespace-nowrap">
                Show entries
              </Label>
              <Select value={entriesPerPage} onValueChange={handleEntriesPerPageChange}>
                <SelectTrigger className="w-[100px] bg-white border-gray-200">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          #application-details-sheet {
            max-width: 70% !important;
            border-radius: 10px !important;
          }
        `}
      </style>

      <DashboardTable 
        data={currentData}
        isDense={false}
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        isLoading={isLoading}
        userRole={userRole}
        activeTab={activeTab}
      />
    </div>
  );
};

export default Dashboard;
