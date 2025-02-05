
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ApplicationData } from "@/types/dashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useRef } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { RejectDialog } from "./dialogs/RejectDialog";

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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [itrFlag, setItrFlag] = useState("true");
  const [lrsAmount, setLrsAmount] = useState("2345");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState([
    {
      text: "asdfasdf",
      timestamp: "05 February 2025, 1:28 PM",
      author: "checker"
    },
    {
      text: "Return reason: To validate photo again",
      timestamp: "31 January 2025, 2:17 PM",
      author: "checker"
    },
    {
      text: "Return by checker",
      timestamp: "31 January 2025, 2:17 PM",
      author: "checker"
    },
    {
      text: "Reject for photo",
      timestamp: "31 January 2025, 2:16 PM",
      author: "maker"
    }
  ]);

  const customerDetails = [
    { label: "ARN", value: "1895637456" },
    { label: "Kit No", value: "6670000033" },
    { label: "Customer Name", value: "GrupoHoteleroCubanacan" },
    { label: "PAN", value: "QDDBW1536A" },
    { label: "Total Amount Loaded (USD)", value: "200000.00" },
    { label: "Customer Type", value: "ETB" },
    { label: "Product Variant", value: "PRD8001" },
    { label: "Card Type", value: "Perso" },
    { label: "Processing Type", value: "Online" }
  ];

  const handleApprove = () => {
    console.log("Application approved");
    setSheetOpen(false);
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    console.log("Application rejected with message:", rejectMessage);
    setShowRejectDialog(false);
    setSheetOpen(false);
  };

  const totalAmount = parseFloat(customerDetails.find(detail => detail.label === "Total Amount Loaded (USD)")?.value || "0");
  const lrsAmountValue = parseFloat(lrsAmount);
  const shouldHideApprove = totalAmount + lrsAmountValue > 250000;

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
          {data.map((row, index) => (
            <TableRow key={index} className={`border-b border-[rgb(224,224,224)] ${isDense ? 'py-6' : 'py-2'}`}>
              <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>{row.createdAt}</TableCell>
              <TableCell className={`text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)] ${isDense ? 'py-6' : 'py-4'}`}>{row.applicationId}</TableCell>
              <TableCell className={`text-[0.8125rem] leading-[1.43] ${isDense ? 'py-6' : 'py-4'}`}>
                <span className={`px-[33px] py-[5px] rounded-[10px] ${getStatusColor(row.status)}`}>
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
        <SheetContent className="w-[60%] h-screen max-h-screen overflow-y-auto border-l">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
          </SheetHeader>
          
          <Accordion type="multiple" defaultValue={["documents", "details", "notes"]} className="space-y-4">
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

          <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
            {!shouldHideApprove && (
              <ShadcnButton 
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white rounded-[4px]"
              >
                Approve
              </ShadcnButton>
            )}
            <ShadcnButton 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]"
            >
              Reject
            </ShadcnButton>
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

      <RejectDialog 
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        rejectMessage={rejectMessage}
        setRejectMessage={setRejectMessage}
        onConfirm={confirmReject}
      />
    </div>
  );
};
