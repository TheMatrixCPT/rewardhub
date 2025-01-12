import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentActivities from "@/components/dashboard/RecentActivities";

const Home = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user found");

      // Get total points
      const { data: pointsData } = await supabase
        .from("points")
        .select("points")
        .eq("user_id", user.id);

      const totalPoints = pointsData?.reduce((sum, record) => sum + record.points, 0) || 0;

      // Get activities count
      const { count: activitiesCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get user rank
      const { data: rankings } = await supabase
        .rpc('get_user_rankings');

      const userRanking = rankings?.find(r => r.user_id === user.id)?.rank || 0;

      return {
        totalPoints,
        activitiesCount: activitiesCount || 0,
        userRank: userRanking
      };
    },
    enabled: !!user
  });

  if (!user) return null;

  return (
    <div className="container py-8 space-y-8">
      <StatsGrid 
        totalPoints={stats?.totalPoints || 0}
        activitiesCount={stats?.activitiesCount || 0}
        userRank={stats?.userRank || '-'}
      />
      <RecentActivities />
    </div>
  );
};

export default Home;