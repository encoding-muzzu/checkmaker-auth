
import { TabButton } from "@/components/dashboard/TabButton";
import { ApplicationData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applications: ApplicationData[] | undefined;
  userRole: string | null;
  onRefresh: () => void;
  setSearchResults: (results: ApplicationData[]) => void;
  bulkDataCount: number;
  totalCount: number;
  isBulkDataDisabled: boolean;
}

export const DashboardTabs = ({
  activeTab,
  setActiveTab,
  applications,
  userRole,
  onRefresh,
  setSearchResults,
  bulkDataCount,
  totalCount,
  isBulkDataDisabled
}: DashboardTabsProps) => {
  const isChecker = userRole === 'checker';

  // Calculate counts for each tab based on status_id
  const pendingCount = isChecker
    ? (applications?.filter(app => app.status_id === 1 || app.status_id === 4).length || 0)
    : (applications?.filter(app => app.status_id === 0).length || 0);

  const completedCount = isChecker
    ? (applications?.filter(app => app.status_id === 2 || app.status_id === 3).length || 0)
    : (applications?.filter(app => app.status_id === 1 || app.status_id === 2 || app.status_id === 4).length || 0);

  const reopenedCount = applications?.filter(app => app.status_id === 3).length || 0;

  // Check if the current tab should show the refresh button
  const shouldShowRefreshButton = activeTab !== "search" && activeTab !== "bulkData";

  // Get bulk data disabled status from environment variable
  const isBulkDataTabDisabled = isBulkDataDisabled;

  return (
    <div className="border-b mb-8 border-[rgb(224, 224, 224)]">
      <div className="flex justify-between items-center">
        <div className="flex gap-8">
          <TabButton
            isActive={activeTab === "pending"}
            label="Pending"
            count={pendingCount}
            totalCount={totalCount}
            onClick={() => setActiveTab("pending")}
            activeTab={activeTab}
            tabName="pending"
          />
          <TabButton
            isActive={activeTab === "completed"}
            label="Completed"
            count={completedCount}
            totalCount={totalCount}
            onClick={() => setActiveTab("completed")}
            activeTab={activeTab}
            tabName="completed"
          />
          {!isChecker && (
            <TabButton
              isActive={activeTab === "reopened"}
              label="Returned By Checker"
              count={reopenedCount}
              totalCount={totalCount}
              onClick={() => setActiveTab("reopened")}
              activeTab={activeTab}
              tabName="reopened"
            />
          )}
          <TabButton
            isActive={activeTab === "search"}
            label="Search"
            onClick={() => {
              setActiveTab("search");
              setSearchResults([]);
            }}
            activeTab={activeTab}
            tabName="search"
          />
          {/* Render Bulk Data tab only if it's not disabled */}
          {!isBulkDataTabDisabled && (
            <TabButton
              isActive={activeTab === "bulkData"}
              label="Bulk Data"
              count={bulkDataCount}
              onClick={() => setActiveTab("bulkData")}
              disabled={false}
              activeTab={activeTab}
              tabName="bulkData"
            />
          )}
        </div>
        
        {/* Add refresh button for non-search/bulk tabs */}
        {shouldShowRefreshButton && (
          <Button 
            onClick={onRefresh}
            variant="outline" 
            size="sm"
            className="flex gap-2 items-center border-gray-200"
          >
            <RefreshCcw size={16} />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
};
