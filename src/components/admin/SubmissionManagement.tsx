
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import SubmissionsTable from "./SubmissionsTable";
import type { Submission } from "@/types/admin";

const SubmissionManagement = () => {
  const [filter, setFilter] = useState<string>("all");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['recentSubmissions', filter],
    queryFn: async () => {
      try {
        console.log("Fetching submissions with filter:", filter);
        let query = supabase
          .from('submissions')
          .select(`
            id,
            created_at,
            status,
            linkedin_url,
            proof_url,
            company_tag,
            mentor_tag,
            admin_comment,
            post_content,
            activity_id,
            activities (
              name,
              points
            ),
            user_id,
            profiles (
              email,
              company
            )
          `)
          .order('created_at', { ascending: false });

        switch (filter) {
          case 'pending':
            query = query.eq('status', 'pending');
            break;
          case 'approved':
            query = query.eq('status', 'approved');
            break;
          case 'rejected':
            query = query.eq('status', 'rejected');
            break;
          case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query = query.gte('created_at', today.toISOString());
            break;
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching submissions:", error);
          toast.error("Failed to fetch submissions");
          throw error;
        }

        console.log("Fetched submissions:", data);
        
        // Transform the data to include default values for null fields
        const transformedData = (data || []).map(submission => ({
          ...submission,
          activity_id: submission.activity_id,
          profiles: {
            email: submission.profiles?.email || 'No Value',
            company: submission.profiles?.company || 'No Company',
          },
          activities: {
            name: submission.activities?.name || 'No Value',
            points: submission.activities?.points || 0
          },
          company_tag: submission.company_tag || 'No Value',
          mentor_tag: submission.mentor_tag || 'No Value',
          admin_comment: submission.admin_comment || 'No Value',
          post_content: submission.post_content || 'No Value',
          linkedin_url: submission.linkedin_url || 'No Value',
          proof_url: submission.proof_url || 'No Value'
        })) as Submission[];
        
        return transformedData;
      } catch (error) {
        console.error("Error in query function:", error);
        return [];
      }
    },
  });

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <Card>
      <div className="px-6 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Submission Management</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter submissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="approved">Approved Only</SelectItem>
                <SelectItem value="rejected">Rejected Only</SelectItem>
                <SelectItem value="today">Today's Submissions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <SubmissionsTable submissions={submissions || []} />
    </Card>
  );
};

export default SubmissionManagement;
