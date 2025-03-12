
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

  const handleSearch = () => {
    console.log("Search initiated with column:", searchColumn, "query:", searchQuery);
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
    const resetToday = new Date();
    resetToday.setHours(0, 0, 0, 0); // Start of day
    
    const resetTodayEnd = new Date(resetToday);
    resetTodayEnd.setHours(23, 59, 59, 999); // End of day
    
    setDateRange({ from: resetToday, to: resetTodayEnd });
    setPreviousColumn(null);
    setApplicationStatus("all");
    
    // Also reset the search with today's date
    onSearch("", "", { from: resetToday, to: resetTodayEnd }, "all");
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
