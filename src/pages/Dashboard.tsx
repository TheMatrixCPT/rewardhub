
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Activity, Medal } from "lucide-react";
import ReferralStats from "@/components/dashboard/ReferralStats";

const Dashboard = () => {
  // Fetch total points and activities count
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get all points from approved submissions
      const { data: points, error: pointsError } = await supabase
        .from("points")
        .select("points")
        .eq("user_id", user.id);

      if (pointsError) throw pointsError;

      const totalPoints = points?.reduce((sum, point) => sum + point.points, 0) || 0;

      const { count: activitiesCount, error: activitiesError } = await supabase
        .from("submissions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      if (activitiesError) throw activitiesError;

      return {
        totalPoints,
        activitiesCount: activitiesCount || 0,
      };
    },
  });

  // Fetch user rank
  const { data: userRank } = useQuery({
    queryKey: ["user-rank"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get all points per user
      const { data: points, error } = await supabase
        .from("points")
        .select("user_id, points");

      if (error) throw error;

      // Calculate total points per user
      const userTotals = points.reduce((acc, point) => {
        const userId = point.user_id;
        acc[userId] = (acc[userId] || 0) + point.points;
        return acc;
      }, {} as Record<string, number>);

      const sortedUsers = Object.entries(userTotals)
        .sort(([, a], [, b]) => b - a);

      const rank = sortedUsers.findIndex(([id]) => id === user.id) + 1;
      return rank > 0 ? rank : "N/A";
    },
  });

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Points</p>
            <h2 className="text-3xl font-bold">{userStats?.totalPoints || 0}</h2>
          </div>
        </Card>

        <Card className="p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Activities</p>
            <h2 className="text-3xl font-bold">{userStats?.activitiesCount || 0}</h2>
          </div>
        </Card>

        <Card className="p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-primary/10">
            <Medal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rank</p>
            <h2 className="text-3xl font-bold">#{userRank || "N/A"}</h2>
          </div>
        </Card>
      </div>

      {user && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
          <ReferralStats userId={user.id} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
