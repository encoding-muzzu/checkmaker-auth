
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
          {/* Always show the Bulk Data tab by removing the condition check */}
          <TabButton
            isActive={activeTab === "bulkData"}
            label="Bulk Data"
            count={bulkDataCount}
            onClick={() => setActiveTab("bulkData")}
            disabled={false}
            activeTab={activeTab}
            tabName="bulkData"
          />
        </div>
      </div>
    </div>
  );
};
