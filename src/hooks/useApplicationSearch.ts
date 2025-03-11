
import { useState, useEffect } from "react";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string, dateRange: {from: Date | undefined, to: Date | undefined}, statusFilter: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  const [statusFilter, setStatusFilter] = useState("");
  // Track if application type was previously selected
  const [previousColumn, setPreviousColumn] = useState<string | null>(null);

  // Set today's date as default for dateRange
  useEffect(() => {
    if (!dateRange.from && !dateRange.to) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setDateRange({ from: today, to: today });
    }
  }, []);

  const handleSearch = () => {
    // Always trigger a search, even if the query hasn't changed
    setIsSearchPerformed(true);
    
    // If search query is empty and no date range is selected and no status filter, clear results
    if (searchQuery.trim() === "" && !dateRange.from && !dateRange.to && 
        statusFilter === "" && searchColumn !== "application_type") {
      setSearchResults([]);
    }
    
    // Always call onSearch to trigger API call
    onSearch(searchColumn, searchQuery, dateRange, statusFilter);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchPerformed(false);
    
    // Set today's date as default when clearing search
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDateRange({ from: today, to: today });
    
    setStatusFilter("");
    setPreviousColumn(null);
    onSearch("", "", { from: today, to: today }, "");
  };

  // Add a new method to handle column changes properly
  const handleColumnChange = (newColumn: string) => {
    // Store the previous column before changing
    setPreviousColumn(searchColumn);
    
    // Update the column
    setSearchColumn(newColumn);
    
    // Reset the search query when switching from application_type to another field
    if (searchColumn === "application_type" && newColumn !== "application_type") {
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
    statusFilter,
    setStatusFilter
  };
};
