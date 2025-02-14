
import { useState } from "react";
import { TabButton } from "@/components/dashboard/TabButton";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchColumn, setSearchColumn] = useState("applicationId");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApplicationData[];
    }
  });

  const handleSearch = () => {
    console.log("Searching in column:", searchColumn, "for query:", searchQuery);
  };

  // Filter applications based on active tab and role
  const getFilteredApplications = () => {
    if (!applications) return [];
    
    // For maker role
    switch (activeTab) {
      case "pending":
        return applications.filter(app => app.status_id === 0);
      case "completed":
        return applications.filter(app => app.status_id === 1);
      case "reopened":
        return applications.filter(app => app.status_id === 4);
      default:
        return [];
    }
  };

  // Calculate pagination
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

  // Reset to first page when entries per page changes
  const handleEntriesPerPageChange = (value: string) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Maker Dashboard</h1>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          <TabButton
            isActive={activeTab === "pending"}
            label="Pending"
            count={applications?.filter(app => app.status_id === 0).length || 0}
            onClick={() => setActiveTab("pending")}
          />
          <TabButton
            isActive={activeTab === "completed"}
            label="Completed"
            count={applications?.filter(app => app.status_id === 1).length || 0}
            onClick={() => setActiveTab("completed")}
          />
          <TabButton
            isActive={activeTab === "reopened"}
            label="Re-Opened"
            count={applications?.filter(app => app.status_id === 4).length || 0}
            onClick={() => setActiveTab("reopened")}
          />
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border-b border-[#e0e0e0] mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
          {/* Show Entries Section */}
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

          <SearchControls
            searchColumn={searchColumn}
            searchQuery={searchQuery}
            onSearchColumnChange={setSearchColumn}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />
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
      />
    </div>
  );
};

export default Dashboard;
