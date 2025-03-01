
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ApplicationData } from "@/types/dashboard";
import { Accordion } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { RefObject, useEffect, useState } from "react";
import { RejectFormSection } from "./dialogs/RejectFormSection";
import { ActionButtonsSection } from "./dialogs/ActionButtonsSection";
import { LrsLimitWarning } from "./dialogs/LrsLimitWarning";

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
  rejectMessage,
  setRejectMessage
}: ApplicationDetailsSheetProps) => {
  const isChecker = userRole === 'checker';
  const isCompleted = activeTab === 'completed';
  const showButtons = selectedRow && !isCompleted;
  const isEditable = !isChecker && (selectedRow?.status_id === 0 || selectedRow?.status_id === 3) && !isCompleted;
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [viewedDocuments, setViewedDocuments] = useState<Set<string>>(new Set());
  const [charCount, setCharCount] = useState(0);
  const [exceedsLimit, setExceedsLimit] = useState(false);
  const maxCharLimit = 200;

  // Reset states when sheet is opened or closed
  useEffect(() => {
    if (!open) {
      setViewedDocuments(new Set());
      setShowRejectForm(false);
      setRejectMessage('');
      setCharCount(0);
      setExceedsLimit(false);
      // Reset to initial values from selectedRow
      if (selectedRow) {
        setItrFlag(selectedRow.itr_flag === null ? "N" : String(selectedRow.itr_flag));
        setLrsAmount(selectedRow.lrs_amount_consumed === null ? "0" : String(selectedRow.lrs_amount_consumed));
      }
    }
  }, [open, selectedRow, setItrFlag, setLrsAmount, setRejectMessage]);

  // Update initial values when selectedRow changes
  useEffect(() => {
    if (selectedRow) {
      setItrFlag(selectedRow.itr_flag === null ? "N" : String(selectedRow.itr_flag));
      setLrsAmount(selectedRow.lrs_amount_consumed === null ? "0" : String(selectedRow.lrs_amount_consumed));
    }
  }, [selectedRow, setItrFlag, setLrsAmount]);

  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectMessage('');
    setCharCount(0);
    setExceedsLimit(false);
  };

  const handleConfirmReject = () => {
    if (rejectMessage.trim() && !exceedsLimit) {
      handleReject();
      setShowRejectForm(false);
      setRejectMessage('');
      setCharCount(0);
      onOpenChange(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRejectMessage(value);
    setCharCount(value.length);
    setExceedsLimit(value.length > maxCharLimit);
  };

  const onDocumentView = (documentPath: string) => {
    setViewedDocuments(prev => new Set([...prev, documentPath]));
  };

  const allDocumentsViewed = selectedRow?.documents?.every(doc => 
    viewedDocuments.has(doc.path)
  ) ?? true;
  
  // Calculate if LRS amount would exceed limit
  const totalAmountLoaded = selectedRow?.total_amount_loaded ? parseFloat(String(selectedRow.total_amount_loaded)) : 0;
  const lrsAmountValue = parseFloat(lrsAmount || "0");
  const lrsLimitExceeded = totalAmountLoaded + lrsAmountValue > 250000;

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
              <DocumentsSection 
                documents={selectedRow?.documents} 
                onDocumentView={onDocumentView}
                viewedDocuments={viewedDocuments}
              />
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

            {lrsLimitExceeded && (
              <LrsLimitWarning 
                totalAmountLoaded={totalAmountLoaded} 
                lrsAmountValue={lrsAmountValue} 
              />
            )}

            {showRejectForm && (
              <RejectFormSection 
                isChecker={isChecker}
                rejectMessage={rejectMessage}
                handleMessageChange={handleMessageChange}
                charCount={charCount}
                exceedsLimit={exceedsLimit}
                maxCharLimit={maxCharLimit}
                handleCancelReject={handleCancelReject}
                handleConfirmReject={handleConfirmReject}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {showButtons && !showRejectForm && (
            <ActionButtonsSection 
              allDocumentsViewed={allDocumentsViewed}
              documentsExist={Boolean(selectedRow?.documents?.length)}
              isSubmitting={isSubmitting}
              handleApprove={handleApprove}
              handleRejectClick={handleRejectClick}
              isChecker={isChecker}
              lrsLimitExceeded={lrsLimitExceeded}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
