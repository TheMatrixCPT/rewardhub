import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const RejectionDialog = ({
  isOpen,
  onOpenChange,
  rejectionReason,
  onReasonChange,
  onConfirm,
  onCancel,
}: RejectionDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Submission</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this submission. This will be shared with the user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <Textarea
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={!rejectionReason.trim()}>
            Reject Submission
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectionDialog;