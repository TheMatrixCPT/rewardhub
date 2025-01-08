import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import type { Tables } from "@/integrations/supabase/types";

interface PrizeSelectProps {
  control: Control<any>;
  prizes: Tables<"prizes">[];
}

export const PrizeSelect = ({ control, prizes }: PrizeSelectProps) => {
  // Filter prizes based on registration period and deadline
  const availablePrizes = prizes.filter(prize => {
    const now = new Date();
    
    // Skip if registration end date hasn't passed yet
    if (prize.registration_end && new Date(prize.registration_end) > now) {
      return false;
    }

    // Skip if deadline has passed
    if (prize.deadline && new Date(prize.deadline) < now) {
      return false;
    }

    return true;
  });

  return (
    <FormField
      control={control}
      name="prizeId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Prize</FormLabel>
          <select
            {...field}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a prize</option>
            {availablePrizes.map((prize) => (
              <option key={prize.id} value={prize.id}>
                {prize.name}
              </option>
            ))}
          </select>
          <FormDescription>
            Select the prize you want to earn points for
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};