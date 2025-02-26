
import { useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { EntriesPerPage } from "@/components/dashboard/EntriesPerPage";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { supabase } from "@/integrations/supabase/client";

const searchableColumns = [
  { value: "application_number", label: "Application Number" },
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

const Dashboard = () => {
  const {
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
  } = useDashboard();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
  }, [setUserRole]);

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

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <DashboardHeader userRole={userRole} onLogout={handleLogout} />
      
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applications={applications}
        userRole={userRole}
        onRefresh={handleRefresh}
        setSearchResults={setSearchResults}
      />

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

      <EntriesPerPage
        value={entriesPerPage}
        onChange={setEntriesPerPage}
      />

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
