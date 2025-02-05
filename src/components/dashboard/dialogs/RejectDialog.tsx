
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectMessage: string;
  setRejectMessage: (message: string) => void;
  onConfirm: () => void;
}

export const RejectDialog = ({
  open,
  onOpenChange,
  rejectMessage,
  setRejectMessage,
  onConfirm
}: RejectDialogProps) => {
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Application</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejection:
            <Input
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              className="mt-2"
              placeholder="Enter rejection reason..."
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Confirm Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
