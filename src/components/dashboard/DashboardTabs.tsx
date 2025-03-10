
import { TabButton } from "@/components/dashboard/TabButton";
import { ApplicationData } from "@/types/dashboard";

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

  return (
    <div className="border-b mb-8">
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
          {!isBulkDataDisabled && (
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
      </div>
    </div>
  );
};
