import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsGrid from "@/components/dashboard/StatsGrid";
import { PointsAdjustmentDialog } from "@/components/admin/PointsAdjustmentDialog";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

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

  // Fetch referral stats
  const { data: referralStats } = useQuery({
    queryKey: ['referral-stats', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      if (!currentUser) throw new Error("No user found");

      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', currentUser.id);

      if (referralsError) throw referralsError;

      const pending = referrals?.filter(r => r.status === 'pending').length || 0;
      const converted = referrals?.filter(r => r.status === 'converted').length || 0;

      return {
        totalReferrals: referrals?.length || 0,
        pendingReferrals: pending,
        convertedReferrals: converted
      };
    }
  });

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {isAdmin && user && (
          <PointsAdjustmentDialog currentUserId={user.id} />
        )}
      </div>
      
      <StatsGrid 
        totalPoints={userStats?.totalPoints || 0}
        activitiesCount={userStats?.activitiesCount || 0}
        userRank={userRank || "N/A"}
        referralStats={referralStats}
      />
    </div>
  );
};

export default Dashboard;
