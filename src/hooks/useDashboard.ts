
import { useAuth } from "./useAuth";
import { useApplicationData } from "./useApplicationData";
import { useApplicationSearch } from "./useApplicationSearch";
import { useApplicationFilters } from "./useApplicationFilters";
import { useState } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useDashboard = () => {
  const { handleLogout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    getStatusIdsForTab,
    getTabCounts
  } = useApplicationFilters();
  
  // Get status IDs for the current tab
  const statusIds = getStatusIdsForTab();
  
  // Server-side pagination with 10 items per page and status filtering
  const { 
    applications, 
    totalCount, 
    isLoading, 
    handleRefresh 
  } = useApplicationData(
    currentPage,
    10,
    activeTab === "search" ? filters : {}, // Only apply search filters on search tab
    activeTab !== "search" && activeTab !== "bulkData" ? statusIds : undefined // Apply status filters on non-search tabs
  );
  
  const {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch
  } = useApplicationSearch((searchCol, searchVal) => {
    // Update filters and reset to page 1 when searching
    setFilters({ [searchCol]: searchVal });
    setCurrentPage(1);
  });

  // Get tab counts
  const tabCounts = getTabCounts(applications);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / 10);

  return {
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
    totalCount,
    totalPages,
    handleLogout,
    handleRefresh,
    handleSearch,
    searchResults,
    setSearchResults,
    tabCounts
  };
};
