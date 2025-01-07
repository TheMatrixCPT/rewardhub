import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];

type FormData = {
  activityId: string;
  prizeId: string;
  linkedinUrl?: string;
  proofUrl?: string;
  companyTag?: string;
  mentorTag?: string;
};

const Submit = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<FormData>();

  // Fetch activities and prizes on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*");
      
      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      // Fetch active prizes
      const { data: prizesData, error: prizesError } = await supabase
        .from("prizes")
        .select("*")
        .eq('active', true);

      if (prizesError) {
        console.error("Error fetching prizes:", prizesError);
        toast({
          title: "Error",
          description: "Failed to load prizes",
          variant: "destructive",
        });
        return;
      }

      setActivities(activitiesData);
      setPrizes(prizesData);
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // First check if user is registered for the selected prize
      const { data: registration, error: registrationError } = await supabase
        .from("prize_registrations")
        .select("*")
        .eq('user_id', user.id)
        .eq('prize_id', data.prizeId)
        .single();

      if (!registration) {
        toast({
          title: "Error",
          description: "You must be registered for this prize to submit activities for it",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("submissions")
        .insert({
          activity_id: data.activityId,
          prize_id: data.prizeId,
          linkedin_url: data.linkedinUrl,
          proof_url: data.proofUrl,
          company_tag: data.companyTag,
          mentor_tag: data.mentorTag,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your activity has been submitted for review.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting activity:", error);
      toast({
        title: "Error",
        description: "Failed to submit activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submit Activity</CardTitle>
          <CardDescription>
            Submit your completed activity for review and earn points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Submit;