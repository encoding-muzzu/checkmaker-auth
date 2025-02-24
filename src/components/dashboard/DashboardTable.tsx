
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ApplicationData } from "@/types/dashboard";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { TableSkeleton } from "./TableSkeleton";
import { ApplicationDetailsSheet } from "./ApplicationDetailsSheet";
import { useApplicationActions } from "@/hooks/useApplicationActions";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";

interface DashboardTableProps {
  data: ApplicationData[];
  isDense: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isLoading?: boolean;
  userRole: string | null;
  activeTab: string;
}

export const DashboardTable = ({ 
  data, 
  isDense,
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
  isLoading = false,
  userRole,
  activeTab
}: DashboardTableProps) => {
  const [selectedRow, setSelectedRow] = useState<ApplicationData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    itrFlag,
    setItrFlag,
    lrsAmount,
    setLrsAmount,
    isEditing,
    setIsEditing,
    isSubmitting,
    handleApprove,
    handleReject
  } = useApplicationActions(selectedRow);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  };

  const customerDetails = selectedRow ? [
    { label: "ARN", value: selectedRow.arn },
    { label: "Kit No", value: selectedRow.kit_no },
    { label: "Customer Name", value: selectedRow.customer_name },
    { label: "PAN", value: selectedRow.pan_number },
    { label: "Total Amount Loaded (USD)", value: selectedRow.total_amount_loaded.toFixed(2) },
    { label: "Customer Type", value: selectedRow.customer_type },
    { label: "Product Variant", value: selectedRow.product_variant },
    { label: "Card Type", value: selectedRow.card_type },
    { label: "Processing Type", value: selectedRow.processing_type }
  ] : [];

  const handleApproveClick = async () => {
    const success = await handleApprove();
    if (success) {
      setSheetOpen(false);
    }
  };

  return (
    <div className="bg-white">
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Application ID</TableHead>
              <TableHead className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">ARN</TableHead>
              <TableHead className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Customer Name</TableHead>
              <TableHead className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Created At</TableHead>
              <TableHead className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Status</TableHead>
              <TableHead className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow 
                key={row.id}
                className="border-b border-[rgb(224,224,224)]"
              >
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.id}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.arn}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{row.customer_name}</TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{formatDate(row.created_at)}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status_id)}`}
                  >
                    {getStatusText(row.status_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRow(row);
                      setSheetOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex items-center justify-between px-2">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPreviousPage}
                      disabled={currentPage === 1}
                      className="rounded-[4px]"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNextPage}
                      disabled={currentPage === totalPages}
                      className="rounded-[4px]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}

      <ApplicationDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedRow={selectedRow}
        customerDetails={customerDetails}
        itrFlag={itrFlag}
        setItrFlag={setItrFlag}
        lrsAmount={lrsAmount}
        setLrsAmount={setLrsAmount}
        setIsEditing={setIsEditing}
        messagesEndRef={messagesEndRef}
        userRole={userRole}
        handleApprove={handleApproveClick}
        handleReject={handleReject}
        isSubmitting={isSubmitting}
        activeTab={activeTab}
      />
    </div>
  );
};
