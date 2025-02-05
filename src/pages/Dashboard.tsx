
import { useState } from "react";
import { TabButton } from "@/components/dashboard/TabButton";
import { SearchControls } from "@/components/dashboard/SearchControls";
import { DashboardTable } from "@/components/dashboard/DashboardTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ApplicationData } from "@/types/dashboard";

const DUMMY_DATA: ApplicationData[] = [
  {
    workflow: "kycform",
    applicationId: "20250203114417182GT",
    status: "New",
    currentActivity: {
      name: "Form Task",
      status: "Initiated"
    },
    assignedTo: "superuser",
    createdAt: "Feb 3, 2025, 11:44:17 AM",
    updatedAt: "Feb 3, 2025, 11:44:17 AM"
  },
  {
    workflow: "Credit Card Application",
    applicationId: "CC789456123",
    status: "Completed",
    currentActivity: {
      name: "Income Verification",
      status: "Pending"
    },
    assignedTo: "verifier",
    createdAt: "Feb 1, 2025, 9:30:00 AM",
    updatedAt: "Feb 5, 2025, 3:15:00 PM",
    documents: [
      {
        name: "Photo ID",
        status: "Approved",
        type: "image/jpeg",
        uploadedAt: "Feb 1, 2025, 9:35:00 AM"
      },
      {
        name: "Proof of Income",
        status: "Pending Review",
        type: "application/pdf",
        uploadedAt: "Feb 1, 2025, 9:40:00 AM"
      },
      {
        name: "Bank Statements",
        status: "Approved",
        type: "application/pdf",
        uploadedAt: "Feb 1, 2025, 9:45:00 AM"
      },
      {
        name: "Employment Letter",
        status: "Rejected",
        type: "application/pdf",
        uploadedAt: "Feb 2, 2025, 10:15:00 AM"
      }
    ]
  },
  {
    workflow: "Personal Loan",
    applicationId: "PL456789012",
    status: "Rejected by Maker",
    currentActivity: {
      name: "Document Upload",
      status: "In Progress"
    },
    assignedTo: "processor",
    createdAt: "Feb 2, 2025, 2:45:00 PM",
    updatedAt: "Feb 5, 2025, 10:30:00 AM"
  },
  {
    workflow: "Home Loan",
    applicationId: "HL123456789",
    status: "Returned by Checker",
    currentActivity: {
      name: "Property Valuation",
      status: "Scheduled"
    },
    assignedTo: "evaluator",
    createdAt: "Jan 29, 2025, 11:20:00 AM",
    updatedAt: "Feb 5, 2025, 9:45:00 AM"
  },
  {
    workflow: "Auto Loan",
    applicationId: "AL987654321",
    status: "Rejected by Checker",
    currentActivity: {
      name: "Vehicle Inspection",
      status: "Pending"
    },
    assignedTo: "inspector",
    createdAt: "Feb 4, 2025, 3:30:00 PM",
    updatedAt: "Feb 5, 2025, 4:20:00 PM"
  },
  {
    workflow: "Business Loan",
    applicationId: "BL234567890",
    status: "Resubmitted to Checker",
    currentActivity: {
      name: "Business Verification",
      status: "Under Review"
    },
    assignedTo: "analyst",
    createdAt: "Feb 3, 2025, 1:15:00 PM",
    updatedAt: "Feb 5, 2025, 2:00:00 PM"
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchColumn, setSearchColumn] = useState("applicationId"); // Changed default value to applicationId
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = () => {
    console.log("Searching in column:", searchColumn, "for query:", searchQuery);
  };

  // Calculate pagination
  const pageSize = parseInt(entriesPerPage);
  const totalPages = Math.ceil(DUMMY_DATA.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = DUMMY_DATA.slice(startIndex, endIndex);

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

  // Reset to first page when entries per page changes
  const handleEntriesPerPageChange = (value: string) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Maker Dashboard</h1>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          <TabButton
            isActive={activeTab === "pending"}
            label="Pending"
            count={12}
            onClick={() => setActiveTab("pending")}
          />
          <TabButton
            isActive={activeTab === "completed"}
            label="Completed"
            count={11}
            onClick={() => setActiveTab("completed")}
          />
          <TabButton
            isActive={activeTab === "reopened"}
            label="Re-Opened"
            count={0}
            onClick={() => setActiveTab("reopened")}
          />
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border-b border-[#e0e0e0] mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
          {/* Show Entries Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="entries-per-page" className="text-sm text-gray-600 whitespace-nowrap">
                Show entries
              </Label>
              <Select value={entriesPerPage} onValueChange={handleEntriesPerPageChange}>
                <SelectTrigger className="w-[100px] bg-white border-gray-200">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SearchControls
            searchColumn={searchColumn}
            searchQuery={searchQuery}
            onSearchColumnChange={setSearchColumn}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <DashboardTable 
        data={currentData}
        isDense={false}
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
      />
    </div>
  );
};

export default Dashboard;
