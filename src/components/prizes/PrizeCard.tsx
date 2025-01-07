import { format, isPast, isFuture } from "date-fns";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prize, PrizeRegistration } from "@/types/prizes";
import { supabase } from "@/integrations/supabase/client";

interface PrizeCardProps {
  prize: Prize;
  registration?: PrizeRegistration;
  onRegister: (prizeId: string) => Promise<void>;
  registering: boolean;
}

const PrizeCard = ({ prize, registration, onRegister, registering }: PrizeCardProps) => {
  const isRegistrationOpen = (prize: Prize) => {
    const now = new Date();
    const start = prize.registration_start ? new Date(prize.registration_start) : null;
    const end = prize.registration_end ? new Date(prize.registration_end) : null;
    
    if (!start || !end) return true;
    return !isPast(end) && !isFuture(start);
  };

  const registrationOpen = isRegistrationOpen(prize);

  return (
    <Card className="p-4">
      {prize.image_url && (
        <img
          src={prize.image_url}
          alt={prize.name}
          className="w-full h-32 object-cover rounded-md mb-4"
        />
      )}
      <div className="space-y-2">
        <h3 className="font-semibold">{prize.name}</h3>
        <p className="text-sm text-muted-foreground">
          {prize.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {prize.points_required} points required
          </Badge>
          {prize.deadline && (
            <Badge variant="outline">
              Competition ends {format(new Date(prize.deadline), "MMM d, yyyy")}
            </Badge>
          )}
        </div>
        {prize.registration_start && prize.registration_end && (
          <div className="text-sm text-muted-foreground mt-2">
            <p>Registration period:</p>
            <p>
              {format(new Date(prize.registration_start), "MMM d, yyyy")} -{" "}
              {format(new Date(prize.registration_end), "MMM d, yyyy")}
            </p>
          </div>
        )}
        {registration ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">Enrolled</Badge>
              <p className="text-sm text-muted-foreground">
                Competition Points: {registration.points}
              </p>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full mt-1">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (registration.points / prize.points_required) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : registrationOpen ? (
          <Button
            className="w-full mt-4"
            onClick={() => onRegister(prize.id)}
            disabled={registering}
          >
            Register to Compete
          </Button>
        ) : (
          <Badge 
            variant="destructive" 
            className="w-full mt-4"
          >
            Registration {isPast(new Date(prize.registration_end || '')) ? 'Closed' : 'Not Started'}
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default PrizeCard;