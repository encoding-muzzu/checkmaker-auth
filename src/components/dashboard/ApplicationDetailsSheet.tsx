
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ApplicationData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { RefObject, useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface ApplicationDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow: ApplicationData | null;
  customerDetails: {
    label: string;
    value: string | number;
  }[];
  itrFlag: string;
  setItrFlag: (value: string) => void;
  lrsAmount: string;
  setLrsAmount: (value: string) => void;
  setIsEditing: (value: boolean) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
  userRole: string | null;
  handleApprove: () => Promise<void>;
  handleReject: () => void;
  isSubmitting: boolean;
  activeTab: string;
}

export const ApplicationDetailsSheet = ({
  open,
  onOpenChange,
  selectedRow,
  customerDetails,
  itrFlag,
  setItrFlag,
  lrsAmount,
  setLrsAmount,
  setIsEditing,
  messagesEndRef,
  userRole,
  handleApprove,
  handleReject,
  isSubmitting,
  activeTab
}: ApplicationDetailsSheetProps) => {
  const isChecker = userRole === 'checker';
  const isCompleted = activeTab === 'completed';
  const showButtons = selectedRow && !isCompleted;
  const isEditable = !isChecker && (selectedRow?.status_id === 0 || selectedRow?.status_id === 3) && !isCompleted;
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectMessage, setRejectMessage] = useState('');

  useEffect(() => {
    if (selectedRow) {
      setItrFlag(selectedRow.itr_flag === null ? "false" : String(selectedRow.itr_flag));
      setLrsAmount(selectedRow.lrs_amount_consumed === null ? "0" : String(selectedRow.lrs_amount_consumed));
    }
  }, [selectedRow, setItrFlag, setLrsAmount]);

  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectMessage('');
  };

  const handleConfirmReject = () => {
    if (rejectMessage.trim()) {
      handleReject();
      setShowRejectForm(false);
      setRejectMessage('');
      onOpenChange(false); // Close the sheet after rejection
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="max-w-4xl rounded-xl h-[95vh] mt-[2%] mr-[2%] p-0 overflow-y-auto" 
        side="right"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-black">Application Details</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Accordion type="single" collapsible defaultValue="details" className="space-y-4">
              <DocumentsSection documents={selectedRow?.documents} />
              <CustomerDetailsSection 
                customerDetails={customerDetails} 
                itrFlag={itrFlag} 
                setItrFlag={setItrFlag} 
                lrsAmount={lrsAmount} 
                setLrsAmount={setLrsAmount} 
                setIsEditing={setIsEditing} 
                userRole={userRole} 
                isEditable={isEditable} 
              />
              <CommentsSection applicationId={selectedRow?.id || ''} messagesEndRef={messagesEndRef} />
            </Accordion>

            {showRejectForm && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-700">
                      {isChecker ? 'Return Application' : 'Reject Application'}
                    </h3>
                  </div>
                  <button onClick={handleCancelReject} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <Textarea
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  placeholder={`Enter your ${isChecker ? 'return' : 'rejection'} reason here...`}
                  className="min-h-[120px] resize-none border-red-200 focus:border-red-500 focus:ring-red-500 mb-3"
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelReject}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmReject}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={!rejectMessage.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : isChecker ? "Confirm Return" : "Confirm Reject"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {showButtons && !showRejectForm && (
            <div className="p-6 border-t bg-white mt-auto">
              <div className="flex justify-end gap-3">
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]" 
                  onClick={handleApprove} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Approve"}
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]" 
                  onClick={handleRejectClick}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : isChecker ? "Return" : "Reject"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
