
import { useState } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useApplicationFilters = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Get status IDs for current tab and role
  const getStatusIdsForTab = (): number[] => {
    if (userRole === 'checker') {
      switch (activeTab) {
        case "pending":
          return [1, 4];
        case "completed":
          return [2, 3];
        case "search":
          return []; // No filter for search
        default:
          return [];
      }
    } else { // Maker role
      switch (activeTab) {
        case "pending":
          return [0];
        case "completed":
          return [1, 2, 4];
        case "reopened":
          return [3];
        case "search":
          return []; // No filter for search
        default:
          return [];
      }
    }
  };

  // Get count of applications for each tab
  const getTabCounts = (applications: ApplicationData[] | undefined) => {
    if (!applications || !userRole) {
      return {
        pending: 0,
        completed: 0,
        reopened: 0
      };
    }

    if (userRole === 'checker') {
      return {
        pending: applications.filter(app => app.status_id === 1 || app.status_id === 4).length,
        completed: applications.filter(app => app.status_id === 2 || app.status_id === 3).length,
        reopened: 0 // Not used for checker
      };
    } else { // Maker role
      return {
        pending: applications.filter(app => app.status_id === 0).length,
        completed: applications.filter(app => app.status_id === 1 || app.status_id === 2 || app.status_id === 4).length,
        reopened: applications.filter(app => app.status_id === 3).length
      };
    }
  };

  return {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    getStatusIdsForTab,
    getTabCounts
  };
};
