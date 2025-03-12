
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
      
      // Immediately trigger search when column changes
      setTimeout(() => {
        onSearch(newColumn, "", dateRange, applicationStatus);
        
        // Update the last search params
        setLastSearchParams(prev => ({
          ...prev,
          column: newColumn,
          query: ""
        }));
        
        setIsSearchPerformed(true);
      }, 0);
    }
  };

  // Automatically trigger a search when the component mounts
  useEffect(() => {
    handleSearch();
  }, []);

  // Handle search query changes with debouncing
  const handleSearchQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    
    // Trigger search immediately on query change
    if (newQuery !== lastSearchParams.query) {
      // Use setTimeout to give the state time to update
      setTimeout(() => {
        onSearch(searchColumn, newQuery, dateRange, applicationStatus);
        
        // Update the last search params
        setLastSearchParams(prev => ({
          ...prev,
          query: newQuery
        }));
        
        setIsSearchPerformed(true);
      }, 300); // 300ms debounce
    }
  };

  // Custom handler for date range changes to automatically trigger search
  const handleDateRangeChange = (newDateRange: {from: Date | undefined, to: Date | undefined}) => {
    setDateRange(newDateRange);
    
    // Always trigger a search on date range change
    setTimeout(() => {
      onSearch(searchColumn, searchQuery, newDateRange, applicationStatus);
      
      // Update the last search params
      setLastSearchParams(prev => ({
        ...prev,
        dateFrom: newDateRange.from?.toISOString(),
        dateTo: newDateRange.to?.toISOString()
      }));
      
      setIsSearchPerformed(true);
    }, 0);
  };
  
  // Custom handler for application status changes
  const handleStatusChange = (newStatus: string) => {
    setApplicationStatus(newStatus);
    
    // Always trigger a search on status change
    setTimeout(() => {
      onSearch(searchColumn, searchQuery, dateRange, newStatus);
      
      // Update the last search params
      setLastSearchParams(prev => ({
        ...prev,
        status: newStatus
      }));
      
      setIsSearchPerformed(true);
    }, 0);
  };

  return {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery: handleSearchQueryChange, // Use the debounced handler
    searchResults,
    setSearchResults,
    handleSearch,
    clearSearch,
    isSearchPerformed,
    setIsSearchPerformed,
    dateRange,
    setDateRange: handleDateRangeChange, // Use the custom handler
    handleColumnChange,
    previousColumn,
    applicationStatus,
    setApplicationStatus: handleStatusChange // Use the custom handler
  };
};
