
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ApplicationData } from "@/types/dashboard";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { useState } from "react";

interface DashboardTableProps {
  data: ApplicationData[];
  isDense: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const DashboardTable = ({ 
  data, 
  isDense,
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage
}: DashboardTableProps) => {
  const [selectedRow, setSelectedRow] = useState<ApplicationData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
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
          {data.map((row, index) => (
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
                  className="flex items-center gap-1 bg-white text-black hover:bg-gray-100 rounded-full border border-black px-2 py-1 text-xs"
                  onClick={() => {
                    setSelectedRow(row);
                    setDialogOpen(true);
                  }}
                >
                  <Eye className="h-3 w-3" />
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
                <button 
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  onClick={onPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded">
                  {currentPage} of {totalPages}
                </span>
                <button 
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  onClick={onNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <CustomerDetailsDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerData={selectedRow}
      />
    </div>
  );
};

