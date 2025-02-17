
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ApplicationData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { RefObject } from "react";

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
  const showButtons = (
    selectedRow && (
      (userRole === 'maker' && (selectedRow.status_id === 0 || selectedRow.status_id === 3)) || 
      (userRole === 'checker' && selectedRow.status_id === 1) ||
      (activeTab === 'reopened')
    )
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        id="application-details-sheet"
        className="w-[80%] h-[94vh] mt-[2%] mr-[2%] p-0 overflow-y-auto"
        side="right"
        onClick={(e) => e.stopPropagation()}
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
              />
              <CommentsSection 
                applicationId={selectedRow?.id || ''}
                messagesEndRef={messagesEndRef}
              />
            </Accordion>
          </div>

          <div className="p-6 border-t bg-white mt-auto">
            <div className="flex justify-end gap-3">
              {showButtons && (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white rounded-[4px]"
                    onClick={handleReject}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Rejecting..." : "Reject"}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="border-black text-black hover:bg-gray-100 rounded-[4px]"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
