import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import RecentActivities from "@/components/dashboard/RecentActivities";
import { useAuth } from "@/hooks/useAuth";
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

type FormData = z.infer<typeof formSchema>;

const Activities = () => {
  const [activities, setActivities] = useState<Tables<"activities">[]>([]);
  const [prizes, setPrizes] = useState<Tables<"prizes">[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityId: "",
      prizeId: "",
      linkedinUrl: "",
      proofUrl: "",
      companyTag: "",
      mentorTag: "",
    }
  });

  useEffect(() => {
    console.log("Activities page mounted, auth loading:", authLoading, "session:", session ? "exists" : "none");
    
    // If auth is not loading and there's no session, redirect to login
    if (!authLoading && !session) {
      console.log("No session found, redirecting to login");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
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
      } catch (error) {
        console.error("Error in fetchData:", error);
        toast.error("Failed to load data");
      } finally {
        setPageLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [navigate, session, authLoading]);

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
      
      form.reset({
        activityId: "",
        prizeId: "",
        linkedinUrl: "",
        proofUrl: "",
        companyTag: "",
        mentorTag: "",
      });
    } catch (error: any) {
      console.error("Error submitting activity:", error);
      toast.error(error.message || "Failed to submit activity");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || authLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="space-y-8">
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

        <div>
          <h2 className="text-2xl font-bold mb-8">Recent Activities</h2>
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Activities;
