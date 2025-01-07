import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Submission, SubmissionStatus } from "@/types/admin";

interface SubmissionsTableProps {
  submissions: Submission[];
}

const SubmissionsTable = ({ submissions: initialSubmissions }: SubmissionsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(initialSubmissions);

  const applyFilters = () => {
    let filtered = [...initialSubmissions];

    if (activeFilters.includes("pending")) {
      filtered = filtered.filter(s => s.status === "pending");
    }
    if (activeFilters.includes("approved")) {
      filtered = filtered.filter(s => s.status === "approved");
    }
    if (activeFilters.includes("rejected")) {
      filtered = filtered.filter(s => s.status === "rejected");
    }

    if (activeFilters.includes("today")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => new Date(s.created_at) >= today);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredSubmissions(filtered);
  };

  const handleFilterChange = (value: string) => {
    let newFilters: string[];
    if (activeFilters.includes(value)) {
      newFilters = activeFilters.filter(f => f !== value);
    } else {
      newFilters = [...activeFilters, value];
    }
    setActiveFilters(newFilters);
    setTimeout(applyFilters, 0);
  };

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
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => {
          setSortOrder(value);
          setTimeout(applyFilters, 0);
        }}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 items-center">
          {["pending", "approved", "rejected", "today"].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleFilterChange(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {activeFilters.includes(filter) && (
                <X className="ml-1 h-3 w-3" onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange(filter);
                }} />
              )}
            </Badge>
          ))}
        </div>
      </div>

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
                    <Select
                      value={submission.status}
                      onValueChange={(value: SubmissionStatus) => 
                        handleStatusChange(submission.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px] bg-white border-gray-200 shadow-sm">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-lg">
                        <SelectItem value="pending" className="text-yellow-500 hover:bg-gray-100">
                          Pending
                        </SelectItem>
                        <SelectItem value="approved" className="text-green-500 hover:bg-gray-100">
                          Approve
                        </SelectItem>
                        <SelectItem value="rejected" className="text-red-500 hover:bg-gray-100">
                          Reject
                        </SelectItem>
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