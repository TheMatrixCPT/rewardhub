import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Trophy, Linkedin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RecentActivities = () => {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["recent-submissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          activities (
            name,
            type,
            points
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "hackathon":
        return Trophy;
      case "linkedin_post":
        return Linkedin;
      case "networking_event":
        return Users;
      default:
        return Trophy;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Recent Activities
      </h2>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 bg-gray-100 rounded-lg animate-pulse"
            />
          ))
        ) : submissions?.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-gray-500">No recent activities</p>
          </Card>
        ) : (
          submissions?.map((submission) => {
            const Icon = getActivityIcon(submission.activities?.type || "");
            return (
              <Card
                key={submission.id}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.activities?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(submission.created_at), "PPP")}
                      </p>
                      {submission.status === "rejected" && submission.admin_comment && (
                        <p className="text-sm text-red-600 mt-1">
                          Rejection reason: {submission.admin_comment}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {submission.status === "approved" ? (
                      <span className="font-semibold text-primary">
                        +{submission.activities?.points + (submission.bonus_points || 0)} pts
                      </span>
                    ) : (
                      <span className={`text-sm ${
                        submission.status === "pending" ? "text-yellow-500" : "text-red-500"
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivities;