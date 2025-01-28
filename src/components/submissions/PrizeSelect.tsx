import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import type { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PrizeSelectProps {
  control: Control<any>;
  prizes: Tables<"prizes">[];
}

export const PrizeSelect = ({ control, prizes }: PrizeSelectProps) => {
  const [registeredPrizes, setRegisteredPrizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      console.log("Fetching prize registrations...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      const { data: registrations, error } = await supabase
        .from('prize_registrations')
        .select('prize_id')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching prize registrations:", error);
        return;
      }

      console.log("Fetched registrations:", registrations);
      setRegisteredPrizes(registrations.map(reg => reg.prize_id));
    };

    fetchRegistrations();
  }, [prizes]);

  // Filter prizes based on registration end date and user registration
  const availablePrizes = prizes.filter(prize => {
    const now = new Date();
    
    // Skip if deadline has passed
    if (prize.deadline && new Date(prize.deadline) < now) {
      return false;
    }

    // Skip if registration end date hasn't passed yet
    if (!prize.registration_end || new Date(prize.registration_end) > now) {
      return false;
    }

    // Only include prizes the user is registered for
    return registeredPrizes.includes(prize.id);
  });

  return (
    <FormField
      control={control}
      name="prizeId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Prize</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full bg-background border-input">
              <SelectValue placeholder="Select a prize" />
            </SelectTrigger>
            <SelectContent className="select-content z-50 bg-white dark:bg-gray-800 shadow-lg">
              {availablePrizes.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No prizes available. Make sure you're registered for a prize competition and the registration period has ended.
                </div>
              ) : (
                availablePrizes.map((prize) => (
                  <SelectItem 
                    key={prize.id} 
                    value={prize.id}
                    className="select-item hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {prize.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the prize you want to earn points for. Only prizes you're registered for and whose registration period has ended will appear here.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};