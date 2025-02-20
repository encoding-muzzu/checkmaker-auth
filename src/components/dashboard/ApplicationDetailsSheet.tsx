
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ApplicationData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { RefObject, useEffect } from "react";

interface ApplicationDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow: ApplicationData | null;
  customerDetails: { label: string; value: string | number }[];
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
  rejectMessage: string;
  setRejectMessage: (value: string) => void;
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
  activeTab,
  rejectMessage = "", // Provide default value
  setRejectMessage
}: ApplicationDetailsSheetProps) => {
  const isChecker = userRole === 'checker';
  const isCompleted = activeTab === 'completed';
  const showButtons = selectedRow && !isCompleted;
  const isEditable = 
    !isChecker && 
    (selectedRow?.status_id === 0 || selectedRow?.status_id === 3) &&
    !isCompleted;

  useEffect(() => {
    if (selectedRow) {
      setItrFlag(selectedRow.itr_flag?.toString() || "false");
      setLrsAmount(selectedRow.lrs_amount_consumed?.toString() || "0");
    }
  }, [selectedRow, setItrFlag, setLrsAmount]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[80%] h-[94vh] mt-[2%] mr-[2%] p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-black">Application Details</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Accordion type="single" collapsible defaultValue="details" className="space-y-4">
              <AccordionItem value="documents" className="border rounded-[4px] shadow-sm">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-black">Documents</h2>
                    <FileText className="h-5 w-5 text-emerald-500" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <DocumentsSection documents={selectedRow?.documents} />
                </AccordionContent>
              </AccordionItem>
              
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
              <CommentsSection 
                applicationId={selectedRow?.id || ''}
                messagesEndRef={messagesEndRef}
              />
            </Accordion>
          </div>

          {showButtons && (
            <div className="p-6 border-t bg-white mt-auto">
              <div className="flex justify-end gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Approve"}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : isChecker ? "Return" : "Reject"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{isChecker ? "Return Application" : "Reject Application"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="remarks" className="text-sm font-medium">
                          Please provide a reason
                        </label>
                        <Textarea
                          id="remarks"
                          value={rejectMessage}
                          onChange={(e) => setRejectMessage(e.target.value)}
                          placeholder="Enter your remarks..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={handleReject}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={!rejectMessage || !rejectMessage.trim() || isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Confirm"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
