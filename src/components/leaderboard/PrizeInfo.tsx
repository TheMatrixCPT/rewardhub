import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

type Prize = {
  id: string;
  name: string;
  points_required: number;
  deadline: string | null;
  registration_start: string | null;
  registration_end: string | null;
};

const getRegistrationStatus = (prize: Prize) => {
  const now = new Date();
  const registrationStart = prize.registration_start ? new Date(prize.registration_start) : null;
  const registrationEnd = prize.registration_end ? new Date(prize.registration_end) : null;
  const deadline = prize.deadline ? new Date(prize.deadline) : null;

  if (deadline && now > deadline) {
    return "Competition ended";
  }
  if (!registrationStart || !registrationEnd) {
    return "Registration open";
  }
  if (now < registrationStart) {
    return "Registration not started";
  }
  if (now > registrationEnd) {
    return "Registration closed";
  }
  return "Registration open";
};

export function PrizeInfo({ prize }: { prize: Prize }) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          {prize.points_required} points required
        </Badge>
        {prize.deadline && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Ends {format(new Date(prize.deadline), "MMM d, yyyy")}
          </Badge>
        )}
        <Badge 
          variant="secondary"
          className="flex items-center gap-1"
        >
          <Users className="h-4 w-4" />
          {getRegistrationStatus(prize)}
        </Badge>
      </div>
    </div>
  );
}