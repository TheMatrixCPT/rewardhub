import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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

interface Prize {
  id: string;
  name: string;
  description: string;
  points_required: number;
  deadline: string | null;
  image_url: string | null;
}

const PrizeBanner = () => {
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
      return data as Prize[];
    },
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

      // Check if user is already registered
      const { data: existingReg, error: checkError } = await supabase
        .from("prize_registrations")
        .select("id")
        .eq("prize_id", prizeId)
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingReg) {
        toast.error("You are already registered for this prize");
        return;
      }

      const { error } = await supabase
        .from("prize_registrations")
        .insert([{ 
          prize_id: prizeId,
          user_id: user.id,
          points: 0 // Start with 0 points for the competition
        }]);

      if (error) throw error;
      
      toast.success("Successfully registered for the prize!");
      refetchRegistrations();
    } catch (error) {
      console.error("Error registering for prize:", error);
      toast.error("Failed to register for the prize");
    } finally {
      setRegistering(false);
    }
  };

  if (!prizes?.length) return null;

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Active Prizes</h2>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent>
          {prizes.map((prize) => {
            const registration = registrations?.find(
              (r) => r.prize_id === prize.id
            );
            
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
                          Ends {format(new Date(prize.deadline), "MMM d, yyyy")}
                        </Badge>
                      )}
                    </div>
                    {registration ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="success">Enrolled</Badge>
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
                    ) : (
                      <Button
                        className="w-full mt-4"
                        onClick={() => handleRegister(prize.id)}
                        disabled={registering}
                      >
                        Register to Compete
                      </Button>
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
};

export default PrizeBanner;