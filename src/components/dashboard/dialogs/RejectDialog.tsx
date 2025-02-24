
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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()} className="z-[100]">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Application</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejection:
            <Input
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              className="mt-2"
              placeholder="Enter rejection reason..."
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }} className="bg-red-600 hover:bg-red-700">
            Confirm Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
