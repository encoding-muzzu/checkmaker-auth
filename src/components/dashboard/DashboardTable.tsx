
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
      {renderTable()}

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
