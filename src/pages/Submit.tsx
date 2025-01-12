import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const form = useForm<FormData>();

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching activities and prizes...");
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*");
      
      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
        toast.error("Failed to load activities");
        return;
      }

      const { data: prizesData, error: prizesError } = await supabase
        .from("prizes")
        .select("*")
        .eq('active', true);

      if (prizesError) {
        console.error("Error fetching prizes:", prizesError);
        toast.error("Failed to load prizes");
        return;
      }

      console.log("Fetched activities:", activitiesData);
      console.log("Fetched prizes:", prizesData);
      setActivities(activitiesData || []);
      setPrizes(prizesData || []);
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log("Submitting form data:", data);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      console.log("Creating submission for user:", user.id);
      
      const { error: submissionError } = await supabase
        .from("submissions")
        .insert({
          activity_id: data.activityId,
          prize_id: data.prizeId,
          linkedin_url: data.linkedinUrl,
          proof_url: data.proofUrl,
          company_tag: data.companyTag,
          mentor_tag: data.mentorTag,
          user_id: user.id,
          status: 'pending'
        });

      if (submissionError) {
        console.error("Error creating submission:", submissionError);
        throw submissionError;
      }

      console.log("Submission created successfully");
      toast.success("Your activity has been submitted for review");
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting activity:", error);
      toast.error(error.message || "Failed to submit activity");
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