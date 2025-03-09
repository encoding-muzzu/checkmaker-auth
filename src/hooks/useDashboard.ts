
import { useAuth } from "./useAuth";
import { useApplicationData } from "./useApplicationData";
import { useApplicationSearch } from "./useApplicationSearch";
import { useApplicationFilters } from "./useApplicationFilters";
import { useState, useEffect } from "react";
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
  } = useApplicationData(currentPage, 10, activeTab === "search" ? filters : {});
  
  const {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch,
    clearSearch,
    isSearchPerformed,
    setIsSearchPerformed
  } = useApplicationSearch((searchCol, searchVal) => {
    // Update filters and reset to page 1 when searching
    setFilters(searchVal ? { [searchCol]: searchVal } : {});
    setCurrentPage(1);
  });

  // Clear search when switching tabs
  useEffect(() => {
    if (activeTab !== "search") {
      clearSearch();
      setFilters({});
    }
  }, [activeTab]);

  // Update searchResults with applications when in search tab
  useEffect(() => {
    if (activeTab === "search" && !isLoading) {
      setSearchResults(applications);
    }
  }, [activeTab, applications, isLoading]);

  // Get filtered applications based on active tab and user role
  const filteredApplications = activeTab === "search" 
    ? searchResults 
    : getFilteredApplications(applications);

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
    clearSearch,
    searchResults,
    setSearchResults,
    filteredApplications,
    isSearchPerformed,
    setIsSearchPerformed
  };
};
