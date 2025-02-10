
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { PrizeSelect } from "./PrizeSelect";
import { ActivitySelect } from "./ActivitySelect";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import * as z from "zod";

// Define the form validation schema
const formSchema = z.object({
  activityId: z.string({
    required_error: "Please select an activity type",
  }),
  prizeId: z.string({
    required_error: "Please select a prize",
  }),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
  proofUrl: z.string().url("Please enter a valid URL").optional(),
  companyTag: z.string().optional(),
  mentorTag: z.string().optional(),
});

interface SubmissionFormProps {
  control: Control<any>;
  activities: Tables<"activities">[];
  prizes: Tables<"prizes">[];
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const SubmissionForm = ({ control, activities, prizes, onSubmit, loading }: SubmissionFormProps) => {
  // Filter out prizes that have passed their deadline
  const activePrizes = prizes.filter(prize => {
    if (!prize.deadline) return true;
    const deadline = new Date(prize.deadline);
    return deadline > new Date();
  });

  // Check if there are any available prizes and if a prize is selected
  const hasAvailablePrizes = activePrizes.length > 0;
  const selectedPrize = control._formValues?.prizeId;
  const isPrizeSelected = Boolean(selectedPrize);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ActivitySelect control={control} activities={activities} />
      <PrizeSelect control={control} prizes={activePrizes} />

      <FormField
        control={control}
        name="linkedinUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn Post URL</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://linkedin.com/post/..." 
                {...field} 
                className="focus:ring-2 focus:ring-primary focus:border-primary invalid:border-red-500 invalid:ring-red-500"
              />
            </FormControl>
            <FormDescription>
              Link to your LinkedIn post (required)
            </FormDescription>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="proofUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proof URL (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://..." 
                {...field} 
                className="focus:ring-2 focus:ring-primary focus:border-primary invalid:border-red-500 invalid:ring-red-500"
              />
            </FormControl>
            <FormDescription>
              Link to any additional proof of completion (optional)
            </FormDescription>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="companyTag"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Tag (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Company name" 
                {...field} 
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="mentorTag"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mentor Tag (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Mentor name" 
                {...field} 
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button 
        type="submit" 
        disabled={loading || !hasAvailablePrizes || !isPrizeSelected} 
        className={`w-full ${!hasAvailablePrizes || !isPrizeSelected ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}
      >
        {loading ? "Submitting..." : !hasAvailablePrizes ? "No Prizes Available" : !isPrizeSelected ? "Select a Prize" : "Submit Activity"}
      </Button>
    </form>
  );
};
