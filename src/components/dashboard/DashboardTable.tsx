import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ApplicationData } from "@/types/dashboard";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState, useRef } from "react";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { Accordion } from "@/components/ui/accordion";
import { RejectDialog } from "./dialogs/RejectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  const [itrFlag, setItrFlag] = useState("false");
  const [lrsAmount, setLrsAmount] = useState("0");
  const [isEditing, setIsEditing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  };

  const conversations = [
    {
      text: "Return reason: To validate photo again",
      timestamp: "31 January 2025, 2:17 PM",
      author: "dinesh"
    },
    {
      text: "Return by dinesh",
      timestamp: "31 January 2025, 2:17 PM",
      author: "dinesh"
    },
    {
      text: "Reject for photo",
      timestamp: "31 January 2025, 2:17 PM",
      author: "muzzu"
    }
  ];

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

  const handleApprove = async () => {
    if (!selectedRow) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          itr_flag: itrFlag === "true",
          lrs_amount_consumed: parseFloat(lrsAmount),
          status: 'Initiated by maker'
        })
        .eq('id', selectedRow.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application has been approved",
      });

      setSheetOpen(false);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRow) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          itr_flag: itrFlag === "true",
          lrs_amount_consumed: parseFloat(lrsAmount),
          status: 'Rejected by Maker'
        })
        .eq('id', selectedRow.id);

      if (error) throw error;

      // Add rejection comment
      const { error: commentError } = await supabase
        .from('application_comments')
        .insert({
          application_id: selectedRow.id,
          comment: rejectMessage,
          type: 'rejection'
        });

      if (commentError) throw commentError;

      toast({
        title: "Success",
        description: "Application has been rejected",
      });

      setRejectDialogOpen(false);
      setSheetOpen(false);
      setRejectMessage("");
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
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
                    setItrFlag(row.itr_flag ? "true" : "false");
                    setLrsAmount(row.lrs_amount_consumed.toString());
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
        <SheetContent className="w-[400px] sm:w-[600px] p-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-black">Application Details</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <Accordion type="single" collapsible defaultValue="details" className="space-y-4">
                <DocumentsSection />
                <CustomerDetailsSection 
                  customerDetails={customerDetails}
                  itrFlag={itrFlag}
                  setItrFlag={setItrFlag}
                  lrsAmount={lrsAmount}
                  setLrsAmount={setLrsAmount}
                  setIsEditing={setIsEditing}
                />
                <CommentsSection 
                  conversations={conversations}
                  messagesEndRef={messagesEndRef}
                />
              </Accordion>
            </div>

            <div className="p-6 border-t bg-white mt-auto">
              <div className="flex justify-end gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]"
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100 rounded-[4px]"
                  onClick={() => setSheetOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        rejectMessage={rejectMessage}
        setRejectMessage={setRejectMessage}
        onConfirm={handleReject}
      />
    </div>
  );
};
