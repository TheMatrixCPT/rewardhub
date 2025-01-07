import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import type { Tables } from "@/integrations/supabase/types";

type FormData = {
  activityId: string;
  prizeId: string;
  linkedinUrl?: string;
  proofUrl?: string;
  companyTag?: string;
  mentorTag?: string;
};

const Submit = () => {
  const [activities, setActivities] = useState<Tables<"activities">[]>([]);
  const [prizes, setPrizes] = useState<Tables<"prizes">[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<FormData>();

  useEffect(() => {
    const fetchData = async () => {
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

      setActivities(activitiesData || []);
      setPrizes(prizesData || []);
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      console.log("Starting submission process...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      console.log("Checking prize registration for user:", user.id, "prize:", data.prizeId);
      
      // First check if user is registered for the selected prize
      const { data: registration, error: registrationError } = await supabase
        .from("prize_registrations")
        .select("*")
        .eq('user_id', user.id)
        .eq('prize_id', data.prizeId)
        .maybeSingle();

      if (registrationError) {
        console.error("Error checking prize registration:", registrationError);
        throw new Error("Failed to check prize registration");
      }

      if (!registration) {
        console.log("No registration found for prize");
        toast({
          title: "Registration Required",
          description: "You must be registered for this prize to submit activities for it. Please register for the prize first.",
          variant: "destructive",
        });
        return;
      }

      console.log("Registration found, proceeding with submission");

      const { error: submissionError } = await supabase
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

      if (submissionError) {
        console.error("Error creating submission:", submissionError);
        throw submissionError;
      }

      console.log("Submission created successfully");
      toast({
        title: "Success!",
        description: "Your activity has been submitted for review.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting activity:", error);
      toast({
        title: "Error",
        description: "Failed to submit activity. Please try again.",
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
            <SubmissionForm
              control={form.control}
              activities={activities}
              prizes={prizes}
              onSubmit={form.handleSubmit(onSubmit)}
              loading={loading}
            />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Submit;