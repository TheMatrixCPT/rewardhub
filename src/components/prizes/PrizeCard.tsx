
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { PrizeRegistration } from "./PrizeRegistration";

interface PrizeCardProps {
  prize: Tables<"prizes">;
  registration?: { prize_id: string; points: number } | undefined;
  onRegister: (prizeId: string) => Promise<void>;
  isRegistering: boolean;
}

export const PrizeCard = ({
  prize,
  registration,
  onRegister,
  isRegistering,
}: PrizeCardProps) => {
  return (
    <Card className="p-4">
      {prize.image_url && (
        <div className="relative w-full h-32 mb-4">
          <img
            src={prize.image_url}
            alt={prize.name}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              console.error("Failed to load image:", prize.image_url);
            }}
          />
        </div>
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
        <PrizeRegistration
          prize={prize}
          registration={registration}
          onRegister={onRegister}
          isRegistering={isRegistering}
        />
      </div>
    </Card>
  );
};
