
import { useState } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApplicationData[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

  const handleSearch = () => {
    setIsSearchPerformed(true);
    
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      onSearch(searchColumn, "");
      return;
    }
    
    onSearch(searchColumn, searchQuery);
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
    handleSearch
  };
};
