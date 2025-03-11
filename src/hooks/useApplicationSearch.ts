
import { useState, useEffect } from "react";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string, dateRange: {from: Date | undefined, to: Date | undefined}, status?: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  const [status, setStatus] = useState<string>("");
  // Track if application type was previously selected
  const [previousColumn, setPreviousColumn] = useState<string | null>(null);

  // Set default date to today
  useEffect(() => {
    if (!dateRange.from) {
      setDateRange({
        from: new Date(),
        to: undefined
      });
    }
  }, []);

  const handleSearch = () => {
    // Always trigger a search, even if the query hasn't changed
    setIsSearchPerformed(true);
    
    // If search query is empty and no date range is selected, clear results
    if (searchQuery.trim() === "" && !dateRange.from && !dateRange.to && searchColumn !== "application_type" && !status) {
      setSearchResults([]);
    }
    
    // Always call onSearch to trigger API call
    onSearch(searchColumn, searchQuery, dateRange, status);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchPerformed(false);
    setDateRange({ from: new Date(), to: undefined });
    setStatus("");
    setPreviousColumn(null);
    onSearch("", "", { from: new Date(), to: undefined }, "");
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
    status,
    setStatus
  };
};
