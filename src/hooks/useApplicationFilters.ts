
import { useState } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useApplicationFilters = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [userRole, setUserRole] = useState<string | null>(null);

  const getFilteredApplications = (applications: ApplicationData[] | undefined, searchResults: ApplicationData[]) => {
    if (!applications || !userRole) return [];

    if (activeTab === "search") {
      return searchResults;
    }
    
    if (userRole === 'checker') {
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 1 || app.status_id === 4);
        case "completed":
          return applications.filter(app => app.status_id === 2 || app.status_id === 3);
        default:
          return [];
      }
    } else {
      switch (activeTab) {
        case "pending":
          return applications.filter(app => app.status_id === 0);
        case "completed":
          return applications.filter(app => app.status_id === 1 || app.status_id === 2 || app.status_id === 4);
        case "reopened":
          return applications.filter(app => app.status_id === 3);
        default:
          return [];
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    getFilteredApplications
  };
};
