import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsGrid from "@/components/dashboard/StatsGrid";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";

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

  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          profiles(first_name, last_name),
          announcement_reactions(reaction_type)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Handle reaction
  const handleReaction = async (announcementId: string) => {
    try {
      const { error } = await supabase.from("announcement_reactions").upsert({
        announcement_id: announcementId,
        user_id: currentUser?.id,
        reaction_type: "like",
      });

      if (error) throw error;
      toast.success("Reaction added!");
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <StatsGrid 
        totalPoints={userStats?.totalPoints || 0}
        activitiesCount={userStats?.activitiesCount || 0}
        userRank={userRank || "N/A"}
        referralStats={referralStats}
      />

      {announcements && announcements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Announcements</h2>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-4 space-y-2 bg-card"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(announcement.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {announcement.announcement_reactions?.length || 0}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {announcement.content}
                </p>
                {announcement.youtube_url && (
                  <a
                    href={announcement.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Watch Video
                  </a>
                )}
                <div className="text-xs text-muted-foreground">
                  Posted by: {announcement.profiles?.first_name}{" "}
                  {announcement.profiles?.last_name} on{" "}
                  {new Date(announcement.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
