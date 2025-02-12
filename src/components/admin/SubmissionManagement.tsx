
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
        
        // First, fetch submissions with activities
        let query = supabase
          .from('submissions')
          .select(`
            *,
            activities (
              name,
              points
            )
          `)
          .order('created_at', { ascending: false });

        // Apply filters
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

        const { data: submissionsData, error: submissionsError } = await query;
        
        if (submissionsError) {
          console.error("Error fetching submissions:", submissionsError);
          toast.error("Failed to fetch submissions");
          throw submissionsError;
        }

        // Get unique user IDs from submissions
        const userIds = [...new Set(submissionsData?.map(s => s.user_id) || [])];

        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, company, first_name, last_name')
          .in('id', userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          toast.error("Failed to fetch user profiles");
          throw profilesError;
        }

        // Create a map of user profiles for easy lookup
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

        // Combine submissions with their corresponding profiles
        const transformedData = (submissionsData || []).map(submission => ({
          ...submission,
          profiles: profilesMap[submission.user_id] || {
            email: 'No Value',
            company: 'No Company',
            first_name: null,
            last_name: null
          },
          activities: submission.activities || {
            name: 'No Value',
            points: 0
          },
          company_tag: submission.company_tag || 'No Value',
          mentor_tag: submission.mentor_tag || 'No Value',
          admin_comment: submission.admin_comment || 'No Value',
          post_content: submission.post_content || 'No Value',
          linkedin_url: submission.linkedin_url || 'No Value',
          proof_url: submission.proof_url || 'No Value'
        })) as Submission[];

        console.log("Processed submissions data:", transformedData);
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
