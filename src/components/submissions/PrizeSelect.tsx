import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import type { Tables } from "@/integrations/supabase/types";

interface PrizeSelectProps {
  control: Control<any>;
  prizes: Tables<"prizes">[];
}

export const PrizeSelect = ({ control, prizes }: PrizeSelectProps) => {
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
            {prizes.map((prize) => (
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