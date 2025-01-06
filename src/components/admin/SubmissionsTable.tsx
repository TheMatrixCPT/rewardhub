import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Submission } from "@/types/admin";
import { useQueryClient } from "@tanstack/react-query";

interface SubmissionsTableProps {
  submissions: Submission[] | undefined;
}

const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  const queryClient = useQueryClient();

  const handleApprove = async (submissionId: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    if (error) {
      toast.error('Failed to approve submission');
      return;
    }

    toast.success('Submission approved');
    queryClient.invalidateQueries({ queryKey: ['recentSubmissions'] });
  };

  const handleReject = async (submissionId: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', submissionId);

    if (error) {
      toast.error('Failed to reject submission');
      return;
    }

    toast.success('Submission rejected');
    queryClient.invalidateQueries({ queryKey: ['recentSubmissions'] });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions?.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell>{submission.user_id}</TableCell>
            <TableCell>{submission.activity_id}</TableCell>
            <TableCell>
              {format(new Date(submission.created_at), 'MM/dd/yyyy')}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  submission.status === 'pending'
                    ? 'default'
                    : submission.status === 'approved'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {submission.status}
              </Badge>
            </TableCell>
            <TableCell>
              {submission.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(submission.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(submission.id)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubmissionsTable;