import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsGrid from "@/components/dashboard/StatsGrid";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  const queryClient = useQueryClient();
  
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

  // Fetch announcements with reactions
  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          announcement_reactions(reaction_type, user_id)
        `)
        .eq('active', true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Handle reaction
  const reactionMutation = useMutation({
    mutationFn: async ({ announcementId, reactionType }: { announcementId: string; reactionType: 'like' | 'dislike' }) => {
      if (!currentUser) return;

      // First, check if user has an existing reaction
      const { data: existingReaction } = await supabase
        .from("announcement_reactions")
        .select("*")
        .eq("announcement_id", announcementId)
        .eq("user_id", currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // If clicking the same reaction, remove it
          const { error } = await supabase
            .from("announcement_reactions")
            .delete()
            .eq("id", existingReaction.id);
          if (error) throw error;
          return "removed";
        } else {
          // If changing reaction, update it
          const { error } = await supabase
            .from("announcement_reactions")
            .update({ reaction_type: reactionType })
            .eq("id", existingReaction.id);
          if (error) throw error;
          return "updated";
        }
      } else {
        // If no existing reaction, create new one
        const { error } = await supabase
          .from("announcement_reactions")
          .insert({
            announcement_id: announcementId,
            user_id: currentUser.id,
            reaction_type: reactionType,
          });
        if (error) throw error;
        return "added";
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      if (result === "removed") {
        toast.success("Reaction removed");
      } else if (result === "updated") {
        toast.success("Reaction updated");
      } else {
        toast.success("Reaction added");
      }
    },
    onError: (error) => {
      console.error("Error handling reaction:", error);
      toast.error("Failed to update reaction");
    },
  });

  const handleReaction = (announcementId: string, reactionType: 'like' | 'dislike') => {
    reactionMutation.mutate({ announcementId, reactionType });
  };

  const getUserReaction = (announcementId: string, reactions: any[]) => {
    return reactions?.find(r => r.user_id === currentUser?.id)?.reaction_type;
  };

  const getReactionCount = (reactions: any[], type: 'like' | 'dislike') => {
    return reactions?.filter(r => r.reaction_type === type).length || 0;
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
          <h2 className="text-2xl font-bold mb-6 text-primary">Important Announcements</h2>
          <ScrollArea className="w-full whitespace-nowrap rounded-xl border">
            <div className="flex w-max space-x-4 p-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="w-[400px] bg-card">
                  <CardHeader className="space-y-1">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={getUserReaction(announcement.id, announcement.announcement_reactions) === 'like' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleReaction(announcement.id, 'like')}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {getReactionCount(announcement.announcement_reactions, 'like')}
                        </Button>
                        <Button
                          variant={getUserReaction(announcement.id, announcement.announcement_reactions) === 'dislike' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleReaction(announcement.id, 'dislike')}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          {getReactionCount(announcement.announcement_reactions, 'dislike')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground whitespace-normal">
                      {announcement.content}
                    </p>
                    {announcement.youtube_url && (
                      <a
                        href={announcement.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block"
                      >
                        Watch Video
                      </a>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Posted by: {announcement.posted_by} on{" "}
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
