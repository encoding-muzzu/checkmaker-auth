
import { useEffect, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { BulkDataTab } from "@/components/dashboard/BulkDataTab";
import { supabase } from "@/integrations/supabase/client";
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { useTokenValidation } from "@/hooks/useTokenValidation";

// Read the environment variable to disable bulk data tab
// Default to enabled (false) if not specified
const isBulkDataDisabled = import.meta.env.VITE_DISABLE_BULK_DATA === "true";

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
    setDateRange,
    handleColumnChange,
    previousColumn,
    applicationStatus,
    setApplicationStatus
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

  // Trigger search automatically when switching to search tab to load today's data
  useEffect(() => {
    if (activeTab === "search") {
      // This will load today's data when switching to search tab
      handleSearch();
    }
  }, [activeTab]);

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
      // Only allow switching to bulkData tab if it's not disabled
      if (tab === "bulkData" && !isBulkDataDisabled) {
        setActiveTab(tab);
      } else if (tab !== "bulkData") {
        setActiveTab(tab);
      }
      
      if (tab !== "search") {
        clearSearch();
      }
    }
  };

  // If user is on the bulk data tab and it gets disabled, redirect them to pending tab
  useEffect(() => {
    if (isBulkDataDisabled && activeTab === "bulkData") {
      setActiveTab("pending");
    }
  }, [isBulkDataDisabled, activeTab, setActiveTab]);

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
        isBulkDataDisabled={isBulkDataDisabled}
      />

      {activeTab === "search" && (
        <div className="bg-white border-b border-[#e0e0e0] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
            <SearchControls
              searchColumn={searchColumn}
              searchQuery={searchQuery}
              onSearchColumnChange={handleColumnChange}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              searchableColumns={searchableColumns}
              dateRange={dateRange}
              setDateRange={setDateRange}
              previousColumn={previousColumn}
              applicationStatus={applicationStatus}
              onApplicationStatusChange={setApplicationStatus}
            />
          </div>
        </div>
      )}

      {/* Only render BulkDataTab if the tab is not disabled */}
      {activeTab === "bulkData" && !isBulkDataDisabled ? (
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
            showPagination={true}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
