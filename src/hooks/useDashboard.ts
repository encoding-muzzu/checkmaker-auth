
import { useAuth } from "./useAuth";
import { useApplicationData } from "./useApplicationData";
import { useApplicationSearch } from "./useApplicationSearch";
import { useApplicationFilters } from "./useApplicationFilters";
import { useState, useEffect } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useDashboard = () => {
  const { handleLogout } = useAuth();
  const [currentPages, setCurrentPages] = useState({
    pending: 1,
    completed: 1,
    reopened: 1,
    search: 1,
    bulkData: 1
  });
  const [filters, setFilters] = useState({});
  const {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
  } = useApplicationFilters();
  
  // Get current page based on active tab
  const currentPage = currentPages[activeTab as keyof typeof currentPages] || 1;
  
  // Server-side pagination with 10 items per page
  const { 
    applications, 
    totalCount, 
    isLoading, 
    handleRefresh 
  } = useApplicationData(
    currentPage, 
    10, 
    activeTab === "search" ? filters : {}, 
    activeTab, 
    userRole
  );
  
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
    updateCurrentPage("search", 1);
  });

  // Update page for a specific tab
  const updateCurrentPage = (tab: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tab]: page
    }));
  };

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
    updateCurrentPage,
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
    isSearchPerformed,
    setIsSearchPerformed
  };
};
