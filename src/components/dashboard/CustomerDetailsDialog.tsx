
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Accordion } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { RejectDialog } from "./dialogs/RejectDialog";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData: any;
}

export const CustomerDetailsDialog = ({ 
  open, 
  onOpenChange,
  customerData 
}: CustomerDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [itrFlag, setItrFlag] = useState("true");
  const [lrsAmount, setLrsAmount] = useState("2345");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const handleApprove = () => {
    console.log("Application approved");
    onOpenChange(false);
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    console.log("Application rejected with message:", rejectMessage);
    setShowRejectDialog(false);
    onOpenChange(false);
  };

  const totalAmount = parseFloat(customerDetails.find(detail => detail.label === "Total Amount Loaded (USD)")?.value || "0");
  const lrsAmountValue = parseFloat(lrsAmount);
  const shouldHideApprove = totalAmount + lrsAmountValue > 250000;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[4px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black">
              Application Details
            </DialogTitle>
          </DialogHeader>

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
              <Button 
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white rounded-[4px]"
              >
                Approve
              </Button>
            )}
            <Button 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]"
            >
              Reject
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="hover:bg-gray-100 rounded-[4px] border-black text-black"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RejectDialog 
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        rejectMessage={rejectMessage}
        setRejectMessage={setRejectMessage}
        onConfirm={confirmReject}
      />
    </>
  );
};
