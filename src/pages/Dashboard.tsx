
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useTokenValidation } from "@/hooks/useTokenValidation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { BulkDataTab } from "@/components/dashboard/BulkDataTab";
import { supabase } from "@/integrations/supabase/client";
import { useBulkProcessing } from "@/hooks/useBulkProcessing";

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
  const location = useLocation();
  const { checkTokenValidity, validateToken } = useTokenValidation();
  const {
    activeTab,
    setActiveTab,
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    userRole,
    setUserRole,
    applications,
    isLoading,
    handleLogout,
    handleRefresh,
    handleSearch,
    searchResults,
    setSearchResults,
    totalCount,
    totalPages,
    filteredApplications
  } = useDashboard();

  // Get bulk data count for the tab display
  const { totalCount: bulkDataCount } = useBulkProcessing();

  useEffect(() => {
    // Check token in localStorage
    const isValid = checkTokenValidity();
    if (!isValid) return;

    // Check for token in URL parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      validateToken(tokenParam);
      // Remove the token from URL after processing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

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
  }, [setUserRole, checkTokenValidity, validateToken, location.search]);

  useEffect(() => {
    setSearchColumn("application_number");
  }, [setSearchColumn]);

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
        bulkDataCount={bulkDataCount}
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
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
