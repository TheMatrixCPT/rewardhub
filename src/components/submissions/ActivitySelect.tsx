import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              {activities.map((activity) => (
                <SelectItem 
                  key={activity.id} 
                  value={activity.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {activity.name} ({activity.points} points)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};