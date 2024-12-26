import { useState } from "react";
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
  linkedinUrl?: string;
  proofUrl?: string;
  companyTag?: string;
  mentorTag?: string;
};

const Submit = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<FormData>();

  // Fetch activities on component mount
  useState(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*");
      
      if (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      setActivities(data);
    };

    fetchActivities();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .insert({
          activity_id: data.activityId,
          linkedin_url: data.linkedinUrl,
          proof_url: data.proofUrl,
          company_tag: data.companyTag,
          mentor_tag: data.mentorTag,
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