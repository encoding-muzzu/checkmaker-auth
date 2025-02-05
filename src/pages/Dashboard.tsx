
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Eye } from "lucide-react";

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
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Maker Dashboard</h1>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-8">
          <button
            className={`pb-4 px-1 relative ${
              activeTab === "pending"
                ? "text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending (12)
          </button>
          <button
            className={`pb-4 px-1 relative ${
              activeTab === "completed"
                ? "text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed (11)
          </button>
          <button
            className={`pb-4 px-1 relative ${
              activeTab === "reopened"
                ? "text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("reopened")}
          >
            Re-Opened (0)
          </button>
        </div>
      </div>

      {/* Search and Dense Toggle */}
      <div className="flex justify-between items-center mb-6">
        <Input
          type="search"
          placeholder="Search..."
          className="max-w-md bg-white"
        />
        <span className="text-sm text-gray-600">Dense</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Workflow</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Application ID</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Status</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Current Activity</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Assigned To</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Created At</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Updated At</TableHead>
              <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_DATA.map((row, index) => (
              <TableRow key={index} className="border-b border-[rgb(224,224,224)]">
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.workflow}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.applicationId}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-blue-500">{row.status}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                  {row.currentActivity.name}
                  <br />
                  <span className="text-gray-500">Status: {row.currentActivity.status}</span>
                </TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.assignedTo}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.createdAt}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.updatedAt}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43]">
                  <button className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
                    <Eye className="h-4 w-4" />
                    View
                  </button>
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
