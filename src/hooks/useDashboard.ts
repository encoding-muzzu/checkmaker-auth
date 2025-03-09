
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
    getFilteredApplications
  } = useApplicationFilters();
  
  // Server-side pagination with 10 items per page
  const { 
    applications, 
    totalCount, 
    isLoading, 
    handleRefresh 
  } = useApplicationData(currentPage, 10, filters);
  
  const {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearchPerformed,
    setIsSearchPerformed,
    handleSearch
  } = useApplicationSearch((searchCol, searchVal) => {
    // Update filters and reset to page 1 when searching
    setFilters({ [searchCol]: searchVal });
    setCurrentPage(1);
  });

  // Get filtered applications based on active tab and user role
  const filteredApplications = getFilteredApplications(applications, searchResults);

  // Calculate total pages for current tab or search results
  const totalPages = Math.ceil(
    activeTab === "search" && searchResults.length > 0 
      ? searchResults.length / 10 
      : totalCount / 10
  ) || 1;

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
    isSearchPerformed,
    setIsSearchPerformed,
    filteredApplications
  };
};
