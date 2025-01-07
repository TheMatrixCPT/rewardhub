import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table } from "@/components/ui/table";
import { format } from "date-fns";
import StatusSelect from "./submissions/StatusSelect";
import RejectionDialog from "./submissions/RejectionDialog";
import type { Submission, SubmissionStatus } from "@/types/admin";

interface SubmissionsTableProps {
  submissions: Submission[];
}

const SubmissionsTable = ({ submissions: initialSubmissions }: SubmissionsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(initialSubmissions);

  const handleStatusChange = async (submissionId: string, newStatus: SubmissionStatus) => {
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
      const updatedSubmissions = filteredSubmissions.map(s => 
        s.id === submissionId ? { ...s, status: newStatus } : s
      );
      setFilteredSubmissions(updatedSubmissions);
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
          status: 'rejected' as SubmissionStatus,
          admin_comment: rejectionReason.trim()
        })
        .eq('id', selectedSubmissionId);

      if (error) throw error;
      
      toast.success("Submission rejected");
      const updatedSubmissions = filteredSubmissions.map(s =>
        s.id === selectedSubmissionId 
          ? { ...s, status: 'rejected' as SubmissionStatus, admin_comment: rejectionReason.trim() }
          : s
      );
      setFilteredSubmissions(updatedSubmissions);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedSubmissionId(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return '';
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
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No submissions found</td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.activities?.name}</td>
                  <td>{submission.user_id}</td>
                  <td className={getStatusColor(submission.status)}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </td>
                  <td>{format(new Date(submission.created_at), "PPP")}</td>
                  <td>
                    <StatusSelect
                      status={submission.status}
                      onStatusChange={(value) => handleStatusChange(submission.id, value)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <RejectionDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onConfirm={handleReject}
        onCancel={() => {
          setRejectionReason("");
          setSelectedSubmissionId(null);
        }}
      />
    </>
  );
};

export default SubmissionsTable;