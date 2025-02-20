import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useRef } from "react";
import { ApplicationData } from "@/types/dashboard";
import { getStatusColor } from "@/utils/statusUtils";
import { ApplicationDetailsSheet } from "./ApplicationDetailsSheet";
import { TableSkeleton } from "./TableSkeleton";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface DashboardTableProps {
  data: ApplicationData[];
  isDense?: boolean;
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ApplicationData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [itrFlag, setItrFlag] = useState("false");
  const [lrsAmount, setLrsAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleRowClick = (row: ApplicationData) => {
    setSelectedRow(row);
    setIsSheetOpen(true);
    setRejectMessage(""); // Reset reject message when opening new application
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      if (!selectedRow) {
        console.error("No row selected for approval.");
        return;
      }

      const { error } = await supabase
        .from('applications')
        .update({ status_id: 1 })
        .eq('id', selectedRow.id);

      if (error) {
        console.error("Error updating application status:", error);
        // Optionally, display an error message to the user
      } else {
        // Optionally, display a success message to the user
        console.log("Application approved successfully!");
      }
    } catch (error) {
      console.error("Unexpected error during approval:", error);
      // Optionally, display an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    setIsSubmitting(true);
    try {
      if (!selectedRow) {
        console.error("No row selected for rejection.");
        return;
      }
  
      // Ensure rejectMessage is not undefined before trimming
      const trimmedRejectMessage = rejectMessage ? rejectMessage.trim() : "";
  
      const { error } = await supabase
        .from('applications')
        .update({ status_id: 2, remarks: trimmedRejectMessage })
        .eq('id', selectedRow.id);
  
      if (error) {
        console.error("Error updating application status:", error);
        // Optionally, display an error message to the user
      } else {
        // Optionally, display a success message to the user
        console.log("Application rejected successfully!");
      }
    } catch (error) {
      console.error("Unexpected error during rejection:", error);
      // Optionally, display an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerDetails = selectedRow ? [
    { label: "Customer Name", value: selectedRow.customer_name || "" },
    { label: "PAN", value: selectedRow.pan_number || "" },
    { label: "ARN", value: selectedRow.arn || "" },
    { label: "Kit No", value: selectedRow.kit_no || "" },
    { label: "Created At", value: selectedRow.created_at ? format(new Date(selectedRow.created_at), 'dd/MM/yyyy HH:mm:ss') : "" },
    { label: "Product Variant", value: selectedRow.product_variant || "" },
    { label: "Customer Type", value: selectedRow.customer_type || "" },
    { label: "Card Type", value: selectedRow.card_type || "" },
    { label: "Processing Type", value: selectedRow.processing_type || "" }
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
          {isLoading ? (
            <TableSkeleton />
          ) : (
            data.map((row) => (
              <TableRow 
                key={row.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(row)}
              >
                <TableCell className="text-[0.8125rem] leading-[1.43]">
                  {row.created_at ? format(new Date(row.created_at), 'dd/MM/yyyy HH:mm:ss') : ''}
                </TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43]">{row.id}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      row.status_id
                    )}`}
                  >
                    {row.status_name}
                  </span>
                </TableCell>
                <TableCell className="text-[0.8125rem] leading-[1.43]">View</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ApplicationDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedRow={selectedRow}
        customerDetails={customerDetails}
        itrFlag={itrFlag}
        setItrFlag={setItrFlag}
        lrsAmount={lrsAmount}
        setLrsAmount={setLrsAmount}
        setIsEditing={setIsEditing}
        messagesEndRef={messagesEndRef}
        userRole={userRole}
        handleApprove={handleApprove}
        handleReject={handleReject}
        isSubmitting={isSubmitting}
        activeTab={activeTab}
        rejectMessage={rejectMessage}
        setRejectMessage={setRejectMessage}
      />
    </div>
  );
};
