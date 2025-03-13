
import { DashboardTable } from "./DashboardTable";
import { ApplicationData } from "@/types/dashboard";
import { useState } from "react";

interface ApplicationTableProps {
  applications: ApplicationData[] | undefined;
  userRole: string | null;
  activeTab: string;
}

export const ApplicationTable = ({ 
  applications = [], 
  userRole, 
  activeTab 
}: ApplicationTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Filter applications based on activeTab and userRole
  const getFilteredData = () => {
    if (!applications) return [];
    
    if (userRole === 'checker') {
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 1 || app.status_id === 4);
        case "completed":
          return applications.filter(app => app.status_id === 2 || app.status_id === 3);
        default:
          return applications;
      }
    } else { // Maker role
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 0);
        case "completed":
          return applications.filter(app => app.status_id === 1 || app.status_id === 2 || app.status_id === 4);
        case "reopened":
          return applications.filter(app => app.status_id === 3);
        default:
          return applications;
      }
    }
  };
  
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <DashboardTable
      data={getCurrentPageData()}
      isDense={false}
      currentPage={currentPage}
      totalPages={totalPages}
      onNextPage={handleNextPage}
      onPreviousPage={handlePreviousPage}
      userRole={userRole}
      activeTab={activeTab}
    />
  );
};
