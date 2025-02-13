
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReferralStats from "@/components/dashboard/ReferralStats";
import StatsGrid from "@/components/dashboard/StatsGrid";

const Dashboard = () => {
  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  // Fetch total points and activities count
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      if (!currentUser) throw new Error("No user found");

      const { data: points, error: pointsError } = await supabase
        .from("points")
        .select("points")
        .eq("user_id", currentUser.id);

      if (pointsError) throw pointsError;

      const totalPoints = points?.reduce((sum, point) => sum + point.points, 0) || 0;

      const { count: activitiesCount, error: activitiesError } = await supabase
        .from("submissions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", currentUser.id);

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
    enabled: !!currentUser?.id,
    queryFn: async () => {
      if (!currentUser) throw new Error("No user found");

      const { data: points, error } = await supabase
        .from("points")
        .select("user_id, points");

      if (error) throw error;

      const userTotals = points.reduce((acc, point) => {
        const userId = point.user_id;
        acc[userId] = (acc[userId] || 0) + point.points;
        return acc;
      }, {} as Record<string, number>);

      const sortedUsers = Object.entries(userTotals)
        .sort(([, a], [, b]) => b - a);

      const rank = sortedUsers.findIndex(([id]) => id === currentUser.id) + 1;
      return rank > 0 ? rank : "N/A";
    },
  });

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <StatsGrid 
        totalPoints={userStats?.totalPoints || 0}
        activitiesCount={userStats?.activitiesCount || 0}
        userRank={userRank || "N/A"}
      />

      {currentUser && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
          <ReferralStats userId={currentUser.id} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
