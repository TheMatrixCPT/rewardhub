import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import type { Tables } from "@/integrations/supabase/types";

interface ActivitySelectProps {
  control: Control<any>;
  activities: Tables<"activities">[];
}

export const ActivitySelect = ({ control, activities }: ActivitySelectProps) => {
  return (
    <FormField
      control={control}
      name="activityId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Activity Type</FormLabel>
          <select
            {...field}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select an activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name} ({activity.points} points)
              </option>
            ))}
          </select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};