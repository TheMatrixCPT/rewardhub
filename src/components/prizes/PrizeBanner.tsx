import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isPast, isFuture } from "date-fns";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface PrizeBannerProps {
  prizes?: Tables<"prizes">[];
}

const PrizeBanner = ({ prizes: propPrizes }: PrizeBannerProps) => {
  const [registering, setRegistering] = useState(false);

  const { data: prizes } = useQuery({
    queryKey: ["active-prizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !propPrizes,
  });

  const { data: registrations, refetch: refetchRegistrations } = useQuery({
    queryKey: ["prize-registrations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("prize_registrations")
        .select("prize_id, points")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const handleRegister = async (prizeId: string) => {
    setRegistering(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data: existingReg, error: checkError } = await supabase
        .from("prize_registrations")
        .select("id")
        .eq("prize_id", prizeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingReg) {
        toast.error("You are already registered for this prize");
        return;
      }

      const { error: insertError } = await supabase
        .from("prize_registrations")
        .insert([{ 
          prize_id: prizeId,
          user_id: user.id,
          points: 0
        }]);

      if (insertError) throw insertError;
      
      toast.success("Successfully registered for the prize!");
      refetchRegistrations();
    } catch (error: any) {
      console.error("Error registering for prize:", error);
      toast.error("Failed to register for the prize");
    } finally {
      setRegistering(false);
    }
  };

  const categorizedPrizes = (prizes || []).reduce((acc, prize) => {
    const now = new Date();
    const registrationStart = prize.registration_start ? new Date(prize.registration_start) : null;
    
    if (!registrationStart) {
      // If no registration start date is set, consider it as active
      acc.active.push(prize);
    } else if (now < registrationStart) {
      // If current date is before registration start, it's upcoming
      acc.upcoming.push(prize);
    } else {
      // If current date is after or equal to registration start, it's active
      acc.active.push(prize);
    }
    
    return acc;
  }, { active: [] as Tables<"prizes">[], upcoming: [] as Tables<"prizes">[] });

  const renderPrizeSection = (title: string, prizes: Tables<"prizes">[]) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {prizes.map((prize) => {
            const registration = registrations?.find(
              (r) => r.prize_id === prize.id
            );
            const registrationOpen = prize.registration_start && prize.registration_end && 
              new Date() >= new Date(prize.registration_start) && 
              new Date() <= new Date(prize.registration_end);
            
            return (
              <CarouselItem key={prize.id} className="md:basis-1/2 lg:basis-1/3">
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
                        onClick={() => handleRegister(prize.id)}
                        disabled={registering}
                      >
                        Register to Compete
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="w-full mt-4">
                        Registration {isPast(new Date(prize.registration_end || '')) ? 'Closed' : 'Not Started'}
                      </Badge>
                    )}
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );

  if (!prizes?.length) return null;

  return (
    <div>
      {categorizedPrizes.active.length > 0 && renderPrizeSection("Active Prizes", categorizedPrizes.active)}
      {categorizedPrizes.upcoming.length > 0 && renderPrizeSection("Upcoming Prizes", categorizedPrizes.upcoming)}
    </div>
  );
};

export default PrizeBanner;