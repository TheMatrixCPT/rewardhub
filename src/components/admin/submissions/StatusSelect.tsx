import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubmissionStatus } from "@/types/admin";

interface StatusSelectProps {
  status: SubmissionStatus;
  onStatusChange: (value: SubmissionStatus) => void;
}

const StatusSelect = ({ status, onStatusChange }: StatusSelectProps) => {
  return (
    <Select value={status} onValueChange={onStatusChange}>
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
  );
};

export default StatusSelect;