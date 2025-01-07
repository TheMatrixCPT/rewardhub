import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import PrizeCard from "./PrizeCard";

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
      return data;
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

      const { data: existingReg, error: checkError } = await supabase
        .from("prize_registrations")
        .select("id")
        .eq("prize_id", prizeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking registration:", checkError);
        throw checkError;
      }

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

      if (insertError) {
        console.error("Error inserting registration:", insertError);
        throw insertError;
      }
      
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
                <PrizeCard
                  prize={prize}
                  registration={registration}
                  onRegister={handleRegister}
                  registering={registering}
                />
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