import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PrizeBanner from "@/components/prizes/PrizeBanner";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentActivities from "@/components/dashboard/RecentActivities";

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

  return (
    <div className="min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track your progress and recent activities
        </p>
      </div>

      <StatsGrid
        totalPoints={userStats?.totalPoints || 0}
        activitiesCount={userStats?.activitiesCount || 0}
        userRank={userRank || "N/A"}
      />

      <PrizeBanner />

      <RecentActivities />
    </div>
  );
};

export default Dashboard;