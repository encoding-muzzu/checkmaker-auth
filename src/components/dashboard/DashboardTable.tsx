
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
  isSearchPerformed?: boolean;
  showPagination?: boolean;
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
  activeTab,
  isSearchPerformed = false,
  showPagination = true
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
    handleReject,
    rejectMessage,
    setRejectMessage
  } = useApplicationActions(selectedRow);

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

  const handleRejectConfirm = async () => {
    const success = await handleReject();
    if (success) {
      setSheetOpen(false);
    }
  };

  const handleRejectClick = () => {
    handleRejectConfirm();
  };

  const showNoRecordsMessage = isSearchPerformed && data.length === 0 && !isLoading;

  return (
    <div className="bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Created At</TableHead>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Application Number</TableHead>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Status</TableHead>
            <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : showNoRecordsMessage ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No records found. Please try a different search.
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No records available.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className={`border-b border-[rgb(224,224,224)] ${isDense ? 'py-6' : 'py-2'}`}>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>
                  {format(new Date(row.created_at), 'MMM d, yyyy, h:mm a')}
                </TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>
                  {row.application_number || '-'}
                </TableCell>
                <TableCell className={`text-[0.8125rem] leading-[1.43] ${isDense ? 'py-6' : 'py-4'}`}>
                  <span className={`px-[10px] py-[3px] rounded-[10px] ${getStatusColor(row.status_id)}`}>
                    {getStatusText(row.status_id, row.status_name)}
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
            ))
          )}
        </TableBody>
        {showPagination && (
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
                    {currentPage} of {totalPages || 1}
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
        )}
      </Table>

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
        handleReject={handleRejectClick}
        isSubmitting={isSubmitting}
        activeTab={activeTab}
        rejectMessage={rejectMessage}
        setRejectMessage={setRejectMessage}
      />
    </div>
  );
};
