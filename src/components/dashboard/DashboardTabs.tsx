
import { TabButton } from "@/components/dashboard/TabButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ApplicationData } from "@/types/dashboard";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabCounts: {
    pending: number;
    completed: number;
    reopened: number;
  };
  bulkFileCount: number;
  userRole: string | null;
  onRefresh: () => void;
  setSearchResults: (results: ApplicationData[]) => void;
}

export const DashboardTabs = ({
  activeTab,
  setActiveTab,
  tabCounts,
  bulkFileCount,
  userRole,
  onRefresh,
  setSearchResults
}: DashboardTabsProps) => {
  const isChecker = userRole === 'checker';

  return (
    <div className="border-b mb-8">
      <div className="flex justify-between items-center">
        <div className="flex gap-8">
          <TabButton
            isActive={activeTab === "pending"}
            label="Pending"
            count={tabCounts.pending}
            onClick={() => setActiveTab("pending")}
          />
          <TabButton
            isActive={activeTab === "completed"}
            label="Completed"
            count={tabCounts.completed}
            onClick={() => setActiveTab("completed")}
          />
          {!isChecker && (
            <TabButton
              isActive={activeTab === "reopened"}
              label="Returned By Checker"
              count={tabCounts.reopened}
              onClick={() => setActiveTab("reopened")}
            />
          )}
          <button
            className={activeTab === "search"
              ? "pb-4 px-1 relative text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
              : "pb-4 px-1 relative text-gray-500 hover:text-gray-800 transition-colors"}
            onClick={() => {
              setActiveTab("search");
              setSearchResults([]);
            }}
          >
            Search
          </button>
          <TabButton
            isActive={activeTab === "bulkData"}
            label="Bulk Data"
            count={bulkFileCount}
            onClick={() => setActiveTab("bulkData")}
          />
        </div>
        {activeTab !== "search" && activeTab !== "bulkData" && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="icon"
            className="mr-4"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
