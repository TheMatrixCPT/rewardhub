import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Submission } from "@/types/admin";

interface SubmissionsTableProps {
  submissions: Submission[];
}

const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    if (newStatus === 'rejected') {
      setSelectedSubmissionId(submissionId);
      setIsRejectDialogOpen(true);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (error) throw error;
      
      toast.success(`Submission ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmissionId || !rejectionReason.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: 'rejected',
          admin_comment: rejectionReason.trim()
        })
        .eq('id', selectedSubmissionId);

      if (error) throw error;
      
      toast.success("Submission rejected");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedSubmissionId(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>User</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center">Loading...</td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No submissions found</td>
              </tr>
            ) : (
              submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.activities?.name}</td>
                  <td>{submission.user_id}</td>
                  <td>{submission.status}</td>
                  <td>{format(new Date(submission.created_at), "PPP")}</td>
                  <td>
                    <Select
                      value={submission.status}
                      onValueChange={(value) => handleStatusChange(submission.id, value)}
                      disabled={submission.status !== 'pending'}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="text-yellow-500">Pending</SelectItem>
                        <SelectItem value="approved" className="text-green-500">Approve</SelectItem>
                        <SelectItem value="rejected" className="text-red-500">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectionReason("");
              setSelectedSubmissionId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject Submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubmissionsTable;