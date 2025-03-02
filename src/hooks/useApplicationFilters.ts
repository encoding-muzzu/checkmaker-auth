
import { useState } from "react";
import { ApplicationData } from "@/types/dashboard";

export const useApplicationFilters = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [userRole, setUserRole] = useState<string | null>(null);

  const getFilteredApplications = (applications?: ApplicationData[], searchResults?: ApplicationData[]) => {
    if (activeTab === "search" && searchResults) {
      return searchResults;
    }

    if (!applications) {
      return [];
    }

    if (activeTab === "pending") {
      if (userRole === "checker") {
        return applications.filter(app => app.status_id === 1 || app.status_id === 4);
      }
      return applications.filter(app => app.status_id === 0);
    }

    if (activeTab === "completed") {
      if (userRole === "checker") {
        return applications.filter(app => app.status_id === 2 || app.status_id === 3);
      }
      return applications.filter(app => app.status_id === 1 || app.status_id === 2 || app.status_id === 4);
    }

    if (activeTab === "reopened") {
      return applications.filter(app => app.status_id === 3);
    }

    if (activeTab === "discrepancy") {
      return applications.filter(app => app.status_id === 6);
    }

    if (activeTab === "bulk") {
      return applications.filter(app => app.status_id === 5);
    }

    return [];
  };

  return {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    getFilteredApplications
  };
};
