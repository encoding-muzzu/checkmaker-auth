
import { useState, useEffect } from "react";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string, dateRange: {from: Date | undefined, to: Date | undefined}, applicationStatus: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  
  // Initialize with today's date for both from and to
  const today = new Date();
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: today,
    to: todayEnd
  });
  
  // Track if application type was previously selected
  const [previousColumn, setPreviousColumn] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>("all");

  useEffect(() => {
    // Trigger a search with default parameters when the component mounts
    handleSearch();
  }, []);

  const handleSearch = () => {
    // Always trigger a search, even if the query hasn't changed
    setIsSearchPerformed(true);
    
    // Call onSearch to trigger API call with all parameters
    onSearch(searchColumn, searchQuery, dateRange, applicationStatus);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchPerformed(false);
    
    // Reset to today's date for both from and to
    const today = new Date();
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    setDateRange({ from: today, to: todayEnd });
    setPreviousColumn(null);
    setApplicationStatus("all");
    onSearch("", "", { from: today, to: todayEnd }, "all");
  };

  // Add a new method to handle column changes properly
  const handleColumnChange = (newColumn: string) => {
    // Store the previous column before changing
    setPreviousColumn(searchColumn);
    
    // Update the column
    setSearchColumn(newColumn);
    
    // Reset the search query when switching columns
    if (searchColumn !== newColumn) {
      setSearchQuery("");
    }
  };

  return {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch,
    clearSearch,
    isSearchPerformed,
    setIsSearchPerformed,
    dateRange,
    setDateRange,
    handleColumnChange,
    previousColumn,
    applicationStatus,
    setApplicationStatus
  };
};
