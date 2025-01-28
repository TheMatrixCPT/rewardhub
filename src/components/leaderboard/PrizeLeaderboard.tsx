import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PrizeInfo } from "./PrizeInfo";
import { LeaderboardTable } from "./LeaderboardTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PrizeLeaderboardEntry = {
  points: number;
  user_id: string;
  profile?: {
    email: string | null;
  } | null;
};

type Prize = {
  id: string;
  name: string;
  points_required: number;
  deadline: string | null;
  registration_start: string | null;
  registration_end: string | null;
};

type PrizeLeaderboardProps = {
  prize: Prize;
  entries: PrizeLeaderboardEntry[];
};

export function PrizeLeaderboard({ prize }: PrizeLeaderboardProps) {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['prize-leaderboard', prize.id],
    queryFn: async () => {
      console.log("Fetching leaderboard entries for prize:", prize.id);
      
      // Get registered users within the registration period
      const { data: registrations, error } = await supabase
        .from('prize_registrations')
        .select(`
          points,
          user_id,
          profiles!prize_registrations_user_id_fkey (
            email
          )
        `)
        .eq('prize_id', prize.id)
        .gte('registered_at', prize.registration_start || '1970-01-01')
        .lte('registered_at', prize.registration_end || '2999-12-31')
        .order('points', { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard entries:", error);
        throw error;
      }

      console.log("Fetched leaderboard entries:", registrations);
      return registrations as PrizeLeaderboardEntry[];
    },
    enabled: !!prize.id,
  });

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <Tabs value={prize.id} defaultValue={prize.id}>
      <TabsContent value={prize.id}>
        <PrizeInfo prize={prize} />
        <LeaderboardTable entries={entries} pointsRequired={prize.points_required} />
      </TabsContent>
    </Tabs>
  );
}