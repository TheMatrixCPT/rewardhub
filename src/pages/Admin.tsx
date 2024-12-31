import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, Users } from "lucide-react";

interface DailyStats {
  pending_reviews: number;
  approved_today: number;
  rejected_today: number;
  active_users: number;
}

interface Submission {
  id: string;
  user_id: string;
  activity_id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  linkedin_url: string | null;
  proof_url: string | null;
  company_tag: string | null;
  mentor_tag: string | null;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(data);
    };

    checkAdmin();
  }, []);

  // Fetch daily stats
  const { data: stats } = useQuery<DailyStats>({
    queryKey: ['dailyStats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.rpc('get_daily_stats', {
        check_date: today
      });

      if (error) throw error;
      return data[0] as DailyStats;
    },
  });

  // Fetch recent submissions
  const { data: submissions, refetch: refetchSubmissions } = useQuery({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Submission[];
    },
  });

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
    refetchSubmissions();
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
    refetchSubmissions();
  };

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage submissions and user activities
          </p>
        </div>
        <Button onClick={() => {}} className="bg-primary">
          Export Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="text-2xl font-bold">{stats?.pending_reviews || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Approved Today</p>
              <p className="text-2xl font-bold">{stats?.approved_today || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Rejected Today</p>
              <p className="text-2xl font-bold">{stats?.rejected_today || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{stats?.active_users || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Recent Submissions</h2>
        </div>
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
      </Card>
    </div>
  );
};

export default Admin;