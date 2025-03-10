
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ApplicationData } from "@/types/dashboard";
import { Accordion } from "@/components/ui/accordion";
import { DocumentsSection } from "./dialogs/DocumentsSection";
import { CustomerDetailsSection } from "./dialogs/CustomerDetailsSection";
import { CommentsSection } from "./dialogs/CommentsSection";
import { RefObject, useEffect, useState } from "react";
import { SheetHeader } from "./sheet/SheetHeader";
import { RejectForm } from "./sheet/RejectForm";
import { ActionButtons } from "./sheet/ActionButtons";

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

  // Check if total amount plus LRS consumed exceeds limit
  const totalAmountLoaded = selectedRow?.total_amount_loaded || 0;
  const lrsAmountValue = parseFloat(lrsAmount) || 0;
  const totalAmount = totalAmountLoaded + lrsAmountValue;
  const exceedsLimit = totalAmount >= 250000;

  // Reset states when sheet is opened or closed
  useEffect(() => {
    if (!open) {
      setViewedDocuments(new Set());
      setShowRejectForm(false);
      setRejectMessage('');
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
  };

  const handleConfirmReject = () => {
    if (rejectMessage.trim()) {
      handleReject();
      setShowRejectForm(false);
      setRejectMessage('');
      onOpenChange(false);
    }
  };

  const onDocumentView = (documentPath: string) => {
    setViewedDocuments(prev => new Set([...prev, documentPath]));
  };

  const allDocumentsViewed = selectedRow?.documents?.every(doc => 
    viewedDocuments.has(doc.path)
  ) ?? true;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="max-w-4xl rounded-xl h-[95vh] mt-[2%] mr-[2%] p-0 overflow-y-auto" 
        side="right"
      >
        <div className="flex flex-col h-full">
          <SheetHeader title="Application Details" />

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

            {showRejectForm && (
              <RejectForm
                isChecker={isChecker}
                isSubmitting={isSubmitting}
                rejectMessage={rejectMessage}
                setRejectMessage={setRejectMessage}
                onCancel={handleCancelReject}
                onConfirm={handleConfirmReject}
              />
            )}

            {!showRejectForm && (
              <ActionButtons 
                showButtons={showButtons}
                isSubmitting={isSubmitting}
                exceedsLimit={exceedsLimit}
                totalAmount={totalAmount}
                documentsExist={!!selectedRow?.documents?.length}
                allDocumentsViewed={allDocumentsViewed}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                isChecker={isChecker}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
