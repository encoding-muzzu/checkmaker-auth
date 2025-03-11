
import { useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { BulkDataTab } from "@/components/dashboard/BulkDataTab";
import { supabase } from "@/integrations/supabase/client";
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { useTokenValidation } from "@/hooks/useTokenValidation";

// Always enable the bulk data tab
const isBulkDataEnabled = true;

// Create a searchable columns array for the search tab
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
  { value: "status", label: "Status" },
  { value: "date_range", label: "Date Range" } // Add new date range option
];

const Dashboard = () => {
  const {
    activeTab,
    setActiveTab,
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    currentPage,
    updateCurrentPage,
    userRole,
    setUserRole,
    applications,
    isLoading,
    handleLogout,
    handleRefresh,
    handleSearch,
    clearSearch,
    searchResults,
    setSearchResults,
    totalCount,
    totalPages,
    filteredApplications,
    isSearchPerformed,
    dateRange,
    setDateRange
  } = useDashboard();

  // Get bulk data count for the tab display
  const { totalCount: bulkDataCount } = useBulkProcessing();
  const { checkTokenValidity } = useTokenValidation();

  useEffect(() => {
    // Check token validity on mount
    checkTokenValidity();
    
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
  }, [setUserRole, checkTokenValidity]);

  useEffect(() => {
    setSearchColumn("application_number");
  }, [setSearchColumn]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updateCurrentPage(activeTab, currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      updateCurrentPage(activeTab, currentPage - 1);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      // Always allow switching to bulkData tab since it's enabled
      setActiveTab(tab);
      if (tab !== "search") {
        clearSearch();
      }
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <DashboardHeader userRole={userRole} onLogout={handleLogout} />
      
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        applications={applications}
        userRole={userRole}
        onRefresh={handleRefresh}
        setSearchResults={setSearchResults}
        bulkDataCount={bulkDataCount}
        totalCount={totalCount}
        isBulkDataDisabled={false}
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
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
        </div>
      )}

      {activeTab === "bulkData" ? (
        <BulkDataTab />
      ) : (
        <>
          <style>
            {`
              #application-details-sheet {
                max-width: 70% !important;
                border-radius: 10px !important;
              }
            `}
          </style>

          <DashboardTable 
            data={activeTab === "search" ? searchResults : filteredApplications}
            isDense={false}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isLoading={isLoading}
            userRole={userRole}
            activeTab={activeTab}
            isSearchPerformed={isSearchPerformed && activeTab === "search"}
            showPagination={activeTab !== "search"}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
