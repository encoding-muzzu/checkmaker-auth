
import { useState, useEffect } from "react";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string, dateRange: {from: Date | undefined, to: Date | undefined}, applicationStatus: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  
  // Set default dates with time at beginning/end of day
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day (midnight)
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999); // End of day
  
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: today,
    to: todayEnd
  });
  
  // Track if application type was previously selected
  const [previousColumn, setPreviousColumn] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>("all");
  const [lastSearchParams, setLastSearchParams] = useState({
    column: searchColumn,
    query: searchQuery,
    dateFrom: dateRange.from?.toISOString(),
    dateTo: dateRange.to?.toISOString(),
    status: applicationStatus
  });

  const handleSearch = () => {
    // Log the search parameters
    console.log("Executing search with params:", {
      column: searchColumn,
      query: searchQuery,
      dateRange: {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString()
      },
      status: applicationStatus
    });
    
    // Always trigger a search, even if the query hasn't changed
    setIsSearchPerformed(true);
    
    // Save the current search parameters to compare against future searches
    setLastSearchParams({
      column: searchColumn,
      query: searchQuery,
      dateFrom: dateRange.from?.toISOString(),
      dateTo: dateRange.to?.toISOString(),
      status: applicationStatus
    });
    
    // Call onSearch to trigger API call with all parameters
    onSearch(searchColumn, searchQuery, dateRange, applicationStatus);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchPerformed(false);
    
    // Reset to today's date for both from and to
    const resetToday = new Date();
    resetToday.setHours(0, 0, 0, 0); // Start of day
    
    const resetTodayEnd = new Date(resetToday);
    resetTodayEnd.setHours(23, 59, 59, 999); // End of day
    
    setDateRange({ from: resetToday, to: resetTodayEnd });
    setPreviousColumn(null);
    setApplicationStatus("all");
    
    // Update the last search params to match the cleared state
    setLastSearchParams({
      column: "application_number",
      query: "",
      dateFrom: resetToday.toISOString(),
      dateTo: resetTodayEnd.toISOString(),
      status: "all"
    });
    
    // Also reset the search with today's date
    onSearch("", "", { from: resetToday, to: resetTodayEnd }, "all");
  };

  // Handle column changes properly
  const handleColumnChange = (newColumn: string) => {
    // Store the previous column before changing
    setPreviousColumn(searchColumn);
    
    // Update the column
    setSearchColumn(newColumn);
    
    // Reset the search query when switching columns
    if (searchColumn !== newColumn) {
      setSearchQuery("");
      
      // We don't auto-search when column changes - wait for user to click Search
      console.log("Column changed to:", newColumn);
    }
  };

  // Automatically trigger a search when the component mounts to load today's data
  useEffect(() => {
    console.log("Initial search triggered with today's date");
    handleSearch();
  }, []);

  // Update query without triggering search (search will be triggered by button click)
  const handleSearchQueryChange = (newQuery: string) => {
    console.log("Search query changed to:", newQuery);
    setSearchQuery(newQuery);
  };

  // Custom handler for date range changes
  const handleDateRangeChange = (newDateRange: {from: Date | undefined, to: Date | undefined}) => {
    console.log("Date range changed:", {
      from: newDateRange.from?.toISOString(),
      to: newDateRange.to?.toISOString()
    });
    
    setDateRange(newDateRange);
  };
  
  // Custom handler for application status changes
  const handleStatusChange = (newStatus: string) => {
    console.log("Application status changed to:", newStatus);
    setApplicationStatus(newStatus);
  };

  return {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    searchResults,
    setSearchResults,
    handleSearch,
    clearSearch,
    isSearchPerformed,
    setIsSearchPerformed,
    dateRange,
    setDateRange: handleDateRangeChange,
    handleColumnChange,
    previousColumn,
    applicationStatus,
    setApplicationStatus: handleStatusChange
  };
};
