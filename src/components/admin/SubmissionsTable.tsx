import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table } from "@/components/ui/table";
import { format } from "date-fns";
import { ExternalLink, AlertTriangle } from "lucide-react";
import StatusSelect from "./submissions/StatusSelect";
import RejectionDialog from "./submissions/RejectionDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Submission, SubmissionStatus } from "@/types/admin";

interface SubmissionsTableProps {
  submissions: Submission[];
}

interface DuplicateInfo {
  id: string;
  similarity: number;
  created_at: string;
  user_id: string;
  status: SubmissionStatus;
}

const SubmissionsTable = ({ submissions: initialSubmissions }: SubmissionsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(initialSubmissions);
  const [duplicateSubmissions, setDuplicateSubmissions] = useState<Record<string, DuplicateInfo[]>>({});

  useEffect(() => {
    checkForDuplicates();
  }, [initialSubmissions]);

  const checkForDuplicates = async () => {
    for (const submission of initialSubmissions) {
      if (submission.post_content) {
        const { data, error } = await supabase.rpc('find_similar_submissions', {
          check_content: submission.post_content,
          similarity_threshold: 0.8
        });

        if (error) {
          console.error('Error checking for duplicates:', error);
          continue;
        }

        // Filter out the current submission and store others
        const similarPosts = data.filter(post => post.id !== submission.id);
        if (similarPosts.length > 0) {
          setDuplicateSubmissions(prev => ({
            ...prev,
            [submission.id]: similarPosts
          }));
        }
      }
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: SubmissionStatus) => {
    if (newStatus === 'rejected') {
      setSelectedSubmissionId(submissionId);
      // Pre-fill rejection reason if duplicates found
      if (duplicateSubmissions[submissionId]?.length > 0) {
        const duplicateInfo = duplicateSubmissions[submissionId];
        const similarity = Math.round(duplicateInfo[0].similarity * 100);
        setRejectionReason(`Submission rejected due to duplicate content. Similar content found from ${format(new Date(duplicateInfo[0].created_at), "PPP")} with ${similarity}% similarity.`);
      } else {
        setRejectionReason("");
      }
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
              <th>LinkedIn Post</th>
              <th>Post Content</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">Loading...</td>
              </tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">No submissions found</td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.activities?.name}</td>
                  <td>
                    {submission.profiles ? (
                      <div className="flex flex-col">
                        <span>
                          {submission.profiles.first_name || ''} {submission.profiles.last_name || ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          {submission.profiles.email || submission.user_id}
                        </span>
                      </div>
                    ) : (
                      submission.user_id
                    )}
                  </td>
                  <td>
                    {submission.linkedin_url ? (
                      <a 
                        href={submission.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        View Post <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">No URL provided</span>
                    )}
                  </td>
                  <td className="max-w-md">
                    <div className="flex items-start gap-2">
                      <div className="truncate">
                        {submission.post_content || "No content provided"}
                      </div>
                      {duplicateSubmissions[submission.id] && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-2">
                              <div className="text-sm">
                                <p className="font-semibold mb-1">Potential Duplicate Posts Found:</p>
                                {duplicateSubmissions[submission.id].map((dup, idx) => (
                                  <div key={idx} className="mb-1">
                                    <p>Similarity: {Math.round(dup.similarity * 100)}%</p>
                                    <p>Date: {format(new Date(dup.created_at), "PPP")}</p>
                                    <p>Status: {dup.status}</p>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
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
