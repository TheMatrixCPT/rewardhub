
import { isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { PrizeProgress } from "./PrizeProgress";

interface PrizeRegistrationProps {
  prize: Tables<"prizes">;
  registration?: { prize_id: string; points: number } | undefined;
  onRegister: (prizeId: string) => Promise<void>;
  isRegistering: boolean;
}

export const PrizeRegistration = ({
  prize,
  registration,
  onRegister,
  isRegistering,
}: PrizeRegistrationProps) => {
  if (registration) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">Enrolled</Badge>
          <p className="text-sm text-muted-foreground">
            Competition Points: {registration.points}
          </p>
        </div>
        <PrizeProgress 
          current={registration.points} 
          required={prize.points_required} 
        />
      </div>
    );
  }

  const registrationClosed = prize.registration_end && isPast(new Date(prize.registration_end));
  const registrationNotStarted = prize.registration_start && isPast(new Date(prize.registration_start));

  if (registrationClosed || registrationNotStarted) {
    return (
      <Badge variant="secondary" className="w-full mt-4">
        Registration {registrationClosed ? 'Closed' : 'Not Started'}
      </Badge>
    );
  }

  return (
    <Button
      className="w-full mt-4"
      onClick={() => onRegister(prize.id)}
      disabled={isRegistering}
    >
      Register to Compete
    </Button>
  );
};
