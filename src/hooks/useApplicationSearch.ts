
import { useState } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApplicationData[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  // Add a lastSearchParams state to track the last search parameters
  const [lastSearchParams, setLastSearchParams] = useState({ column: "", query: "" });

  const handleSearch = () => {
    setIsSearchPerformed(true);
    
    // Always call onSearch to trigger the API call, regardless of whether the query has changed
    onSearch(searchColumn, searchQuery);
    
    // Update the last search parameters
    setLastSearchParams({ column: searchColumn, query: searchQuery });
  };

  return {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearchPerformed,
    setIsSearchPerformed,
    handleSearch,
    lastSearchParams
  };
};
