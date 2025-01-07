import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { format } from "date-fns";
import type { Submission } from "@/types/admin";

interface SubmissionsTableProps {
  submissions: Submission[];
}

const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  const [loading, setLoading] = useState(false);

  const handleReject = async (submissionId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User cancelled

    try {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: 'rejected',
          admin_comment: reason || 'No reason provided'
        })
        .eq('id', submissionId);

      if (error) throw error;
      
      toast.success("Submission rejected");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
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
                  <Button onClick={() => handleReject(submission.id)} variant="destructive">
                    Reject
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default SubmissionsTable;