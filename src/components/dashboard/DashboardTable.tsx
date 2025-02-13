
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ApplicationData } from "@/types/dashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
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

  const applicationDetails = selectedRow ? [
    { label: "ARN", value: selectedRow.arn },
    { label: "Kit No", value: selectedRow.kit_no },
    { label: "Customer Name", value: selectedRow.customer_name },
    { label: "PAN", value: selectedRow.pan_number },
    { label: "Total Amount Loaded (USD)", value: selectedRow.total_amount_loaded.toFixed(2) },
    { label: "Customer Type", value: selectedRow.customer_type },
    { label: "Product Variant", value: selectedRow.product_variant },
    { label: "Card Type", value: selectedRow.card_type },
    { label: "Processing Type", value: selectedRow.processing_type },
    { label: "ITR Flag", value: selectedRow.itr_flag ? "Yes" : "No" },
    { label: "LRS Amount Consumed", value: selectedRow.lrs_amount_consumed.toFixed(2) }
  ] : [];

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
        <SheetContent className="w-[500px] sm:w-[700px]">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <div className="space-y-4">
              {applicationDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                  <Label className="text-sm font-medium text-gray-500">{detail.label}</Label>
                  <div className="text-sm text-gray-900">{detail.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <ShadcnButton
              onClick={() => setSheetOpen(false)}
              variant="outline"
              className="hover:bg-gray-100 rounded-[4px] border-black text-black"
            >
              Close
            </ShadcnButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
