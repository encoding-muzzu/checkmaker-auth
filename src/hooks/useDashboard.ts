
import { useAuth } from "./useAuth";
import { useApplicationData } from "./useApplicationData";
import { useApplicationSearch } from "./useApplicationSearch";
import { useApplicationFilters } from "./useApplicationFilters";
import { usePagination } from "./usePagination";

export const useDashboard = () => {
  const { handleLogout } = useAuth();
  const { applications, isLoading, handleRefresh } = useApplicationData();
  const {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch
  } = useApplicationSearch();
  const {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    getFilteredApplications
  } = useApplicationFilters();
  const {
    entriesPerPage,
    setEntriesPerPage,
    currentPage,
    setCurrentPage
  } = usePagination();

  const filteredApplications = () => getFilteredApplications(applications, searchResults);

  return {
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
    getFilteredApplications: filteredApplications,
    searchResults,
    setSearchResults
  };
};
