```typescript
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Eye, Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const DUMMY_DATA = [
  {
    workflow: "kycform",
    applicationId: "20250203114417182GT",
    status: "Initiated (0 Steps Done)",
    currentActivity: {
      name: "Form Task",
      status: "Initiated"
    },
    assignedTo: "superuser",
    createdAt: "Feb 3, 2025, 11:44:17 AM",
    updatedAt: "Feb 3, 2025, 11:44:17 AM"
  },
  {
    workflow: "HDFC DBOPS",
    applicationId: "871307",
    status: "Initiated (1 Step Done)",
    currentActivity: {
      name: "Customer Details",
      status: "Under Approval"
    },
    assignedTo: "maker",
    createdAt: "Jan 30, 2025, 7:11:08 PM",
    updatedAt: "Feb 5, 2025, 12:06:14 PM"
  },
  {
    workflow: "HDFC DBOPS",
    applicationId: "1895637456",
    status: "Initiated (1 Step Done)",
    currentActivity: {
      name: "Customer Details",
      status: "Initiated"
    },
    assignedTo: "maker",
    createdAt: "Jan 28, 2025, 1:53:36 PM",
    updatedAt: "Feb 5, 2025, 11:50:54 AM"
  },
  {
    workflow: "Credit Card Application",
    applicationId: "CC789456123",
    status: "Initiated (2 Steps Done)",
    currentActivity: {
      name: "Income Verification",
      status: "Pending"
    },
    assignedTo: "verifier",
    createdAt: "Feb 1, 2025, 9:30:00 AM",
    updatedAt: "Feb 5, 2025, 3:15:00 PM"
  },
  {
    workflow: "Personal Loan",
    applicationId: "PL456789012",
    status: "Initiated (1 Step Done)",
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
    status: "Initiated (3 Steps Done)",
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
    status: "Initiated (2 Steps Done)",
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
    status: "Initiated (1 Step Done)",
    currentActivity: {
      name: "Business Verification",
      status: "Under Review"
    },
    assignedTo: "analyst",
    createdAt: "Feb 3, 2025, 1:15:00 PM",
    updatedAt: "Feb 5, 2025, 2:00:00 PM"
  },
  {
    workflow: "Education Loan",
    applicationId: "EL345678901",
    status: "Initiated (2 Steps Done)",
    currentActivity: {
      name: "Institution Verification",
      status: "In Progress"
    },
    assignedTo: "verifier",
    createdAt: "Feb 2, 2025, 10:00:00 AM",
    updatedAt: "Feb 5, 2025, 11:30:00 AM"
  },
  {
    workflow: "Gold Loan",
    applicationId: "GL456789012",
    status: "Initiated (1 Step Done)",
    currentActivity: {
      name: "Gold Evaluation",
      status: "Scheduled"
    },
    assignedTo: "appraiser",
    createdAt: "Feb 1, 2025, 4:45:00 PM",
    updatedAt: "Feb 5, 2025, 1:15:00 PM"
  },
  {
    workflow: "Small Business Loan",
    applicationId: "SB567890123",
    status: "Initiated (2 Steps Done)",
    currentActivity: {
      name: "Financial Assessment",
      status: "Under Review"
    },
    assignedTo: "analyst",
    createdAt: "Feb 5, 2025, 8:30:00 AM",
    updatedAt: "Feb 5, 2025, 5:15:00 PM"
  },
  {
    workflow: "Mortgage Refinance",
    applicationId: "MR678901234",
    status: "Initiated (1 Step Done)",
    currentActivity: {
      name: "Property Assessment",
      status: "Scheduled"
    },
    assignedTo: "evaluator",
    createdAt: "Feb 4, 2025, 11:45:00 AM",
    updatedAt: "Feb 5, 2025, 6:30:00 PM"
  },
  {
    workflow: "Vehicle Leasing",
    applicationId: "VL789012345",
    status: "Initiated (3 Steps Done)",
    currentActivity: {
      name: "Vehicle Verification",
      status: "In Progress"
    },
    assignedTo: "inspector",
    createdAt: "Feb 3, 2025, 2:15:00 PM",
    updatedAt: "Feb 5, 2025, 7:45:00 PM"
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchColumn, setSearchColumn] = useState("workflow");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDense, setIsDense] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState("10");

  const handleSearch = () => {
    console.log("Searching in column:", searchColumn, "for query:", searchQuery);
    // Implement search logic here
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Maker Dashboard</h1>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          <button
            className={`pb-4 px-1 relative ${
              activeTab === "pending"
                ? "text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "text-gray-500 hover:text-gray-800 transition-colors"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending (12)
          </button>
          <button
            className={`pb-4 px-1 relative ${
              activeTab === "completed"
                ? "text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "text-gray-500 hover:text-gray-800 transition-colors"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed (11)
          </button>
          <button
            className={`pb-4 px-1 relative ${
              activeTab === "reopened"
                ? "text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "text-gray-500 hover:text-gray-800 transition-colors"
            }`}
            onClick={() => setActiveTab("reopened")}
          >
            Re-Opened (0)
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6">
          {/* Show Entries Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="entries-per-page" className="text-sm text-gray-600 whitespace-nowrap">
                Show entries
              </Label>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
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

            <div className="flex items-center gap-2 ml-6">
              <Label htmlFor="dense-mode" className="text-sm text-gray-600 whitespace-nowrap">
                Dense Padding
              </Label>
              <Switch
                id="dense-mode"
                checked={isDense}
                onCheckedChange={setIsDense}
              />
            </div>
          </div>

          {/* Search Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <Select value={searchColumn} onValueChange={setSearchColumn}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="applicationId">Application ID</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="currentActivity">Current Activity</SelectItem>
                  <SelectItem value="assignedTo">Assigned To</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 bg-white border-gray-200 w-full sm:w-[240px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-black text-white hover:bg-black/90 px-4"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Created At</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Workflow</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Application ID</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Status</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Current Activity</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Updated At</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_DATA.map((row, index) => (
              <TableRow key={index} className={`border-b border-[rgb(224,224,224)] ${isDense ? 'py-6' : 'py-2'}`}>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>{row.createdAt}</TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>{row.workflow}</TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>{row.applicationId}</TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-blue-500 ${isDense ? 'py-6' : 'py-4'}`}>{row.status}</TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>
                  {row.currentActivity.name}
                  <br />
                  <span className="text-gray-500">Status: {row.currentActivity.status}</span>
                </TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>{row.updatedAt}</TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] ${isDense ? 'py-6' : 'py-4'}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex items-center justify-center gap-4 py-2">
                  <button className="text-gray-500 hover:text-gray-700">Previous</button>
                  <span className="px-3 py-1 bg-gray-100 rounded">1</span>
                  <button className="text-gray-500 hover:text-gray-700">Next</button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
```
