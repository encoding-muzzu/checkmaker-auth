
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ApplicationData } from "@/types/dashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface DashboardTableProps {
  data: ApplicationData[];
  isDense: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    "New": "bg-[#E5DEFF] text-[#8B5CF6]",
    "Initiated by maker": "bg-[#D3E4FD] text-[#0EA5E9]",
    "Pending checker approval": "bg-[#FEF7CD] text-[#F97316]",
    "Completed": "bg-[#F2FCE2] text-green-600",
    "Rejected by Maker": "bg-[#FFDEE2] text-red-600",
    "Returned by Checker": "bg-[#FDE1D3] text-orange-600",
    "Rejected by Checker": "bg-[#FFDEE2] text-red-600",
    "Resubmitted to Checker": "bg-[#D3E4FD] text-[#0EA5E9]"
  };
  return statusColors[status] || "";
};

export const DashboardTable = ({ 
  data, 
  isDense,
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage
}: DashboardTableProps) => {
  const [selectedRow, setSelectedRow] = useState<ApplicationData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  };

  return (
    <div className="bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Created At</TableHead>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Application ID</TableHead>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Status</TableHead>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className={`border-b border-[rgb(224,224,224)] ${isDense ? 'py-6' : 'py-2'}`}>
              <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>
                {formatDate(row.created_at)}
              </TableCell>
              <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>
                {row.id}
              </TableCell>
              <TableCell className={`text-[0.8125rem] leading-[1.43] ${isDense ? 'py-6' : 'py-4'}`}>
                <span className={`px-[10px] py-[3px] rounded-[10px] ${getStatusColor(row.status)}`}>
                  {row.status}
                </span>
              </TableCell>
              <TableCell className={`text-[0.8125rem] leading-[1.43] ${isDense ? 'py-6' : 'py-4'}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 bg-transparent text-black hover:bg-transparent px-0 py-1 text-xs border-0"
                  onClick={() => {
                    setSelectedRow(row);
                    setSheetOpen(true);
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
            <TableCell colSpan={4}>
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
            <SheetDescription>
              View information about this application
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedRow && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">ARN</Label>
                  <div className="col-span-2 text-sm">{selectedRow.arn}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Kit No</Label>
                  <div className="col-span-2 text-sm">{selectedRow.kit_no}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                  <div className="col-span-2 text-sm">{selectedRow.customer_name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">PAN</Label>
                  <div className="col-span-2 text-sm">{selectedRow.pan_number}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Total Amount Loaded (USD)</Label>
                  <div className="col-span-2 text-sm">{selectedRow.total_amount_loaded.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Customer Type</Label>
                  <div className="col-span-2 text-sm">{selectedRow.customer_type}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Product Variant</Label>
                  <div className="col-span-2 text-sm">{selectedRow.product_variant}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Card Type</Label>
                  <div className="col-span-2 text-sm">{selectedRow.card_type}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">Processing Type</Label>
                  <div className="col-span-2 text-sm">{selectedRow.processing_type}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">ITR Flag</Label>
                  <div className="col-span-2 text-sm">{selectedRow.itr_flag ? "Yes" : "No"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-sm font-medium text-gray-500">LRS Amount Consumed</Label>
                  <div className="col-span-2 text-sm">{selectedRow.lrs_amount_consumed.toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
