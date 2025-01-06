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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Submission } from "@/types/admin";
import { useQueryClient } from "@tanstack/react-query";

interface SubmissionsTableProps {
  submissions: Submission[] | undefined;
}

type SubmissionStatus = "pending" | "approved" | "rejected";

const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (submissionId: string, newStatus: SubmissionStatus) => {
    console.log(`Updating submission ${submissionId} to status: ${newStatus}`);
    
    const { error } = await supabase
      .from('submissions')
      .update({ status: newStatus })
      .eq('id', submissionId);

    if (error) {
      console.error('Error updating submission status:', error);
      toast.error('Failed to update submission status');
      return;
    }

    toast.success(`Submission ${newStatus}`);
    queryClient.invalidateQueries({ queryKey: ['recentSubmissions'] });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return '';
    }
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
                variant={getStatusBadgeVariant(submission.status)}
                className={getStatusBadgeClass(submission.status)}
              >
                {submission.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Select
                value={submission.status}
                onValueChange={(value: SubmissionStatus) => handleStatusChange(submission.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubmissionsTable;