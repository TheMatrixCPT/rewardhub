import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { PrizeSelect } from "./PrizeSelect";
import { ActivitySelect } from "./ActivitySelect";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

interface SubmissionFormProps {
  control: Control<any>;
  activities: Tables<"activities">[];
  prizes: Tables<"prizes">[];
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const SubmissionForm = ({ control, activities, prizes, onSubmit, loading }: SubmissionFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PrizeSelect control={control} prizes={prizes} />
      <ActivitySelect control={control} activities={activities} />

      <FormField
        control={control}
        name="linkedinUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn Post URL (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://linkedin.com/post/..." {...field} />
            </FormControl>
            <FormDescription>
              Link to your LinkedIn post if applicable
            </FormDescription>
            <FormMessage />
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
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormDescription>
              Link to any proof of completion
            </FormDescription>
            <FormMessage />
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
              <Input placeholder="Company name" {...field} />
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
              <Input placeholder="Mentor name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Activity"}
      </Button>
    </form>
  );
};