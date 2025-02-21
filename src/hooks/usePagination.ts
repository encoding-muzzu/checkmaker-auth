
import { useState } from "react";

export const usePagination = () => {
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  return {
    entriesPerPage,
    setEntriesPerPage,
    currentPage,
    setCurrentPage
  };
};
