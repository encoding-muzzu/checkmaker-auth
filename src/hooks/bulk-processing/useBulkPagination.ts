
import { useState } from "react";

export const useBulkPagination = (totalCount: number, pageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    pageSize
  };
};
