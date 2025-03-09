
import { useState } from "react";

export const useApplicationSearch = (onSearch: (searchColumn: string, searchQuery: string) => void) => {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = () => {
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
    handleSearch
  };
};
