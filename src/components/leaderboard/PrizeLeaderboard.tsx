import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PrizeInfo } from "./PrizeInfo";
import { LeaderboardTable } from "./LeaderboardTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PrizeLeaderboardEntry = {
  points: number;
  user_id: string;
  profiles?: {
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
  isRegistered: boolean;
};

export function PrizeLeaderboard({ prize, isRegistered }: PrizeLeaderboardProps) {
  const isCompetitionEnded = prize.deadline && new Date(prize.deadline) < new Date();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['prize-leaderboard', prize.id],
    queryFn: async () => {
      console.log("Fetching leaderboard entries for prize:", prize.id);
      
      const { data: registrations, error } = await supabase
        .from('leaderboard_view')
        .select(`
          points,
          user_id,
          email
        `)
        .eq('prize_id', prize.id)
        .order('points', { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard entries:", error);
        throw error;
      }

      const transformedData: PrizeLeaderboardEntry[] = registrations.map(reg => ({
        points: reg.points || 0,
        user_id: reg.user_id || '',
        profiles: {
          email: reg.email
        }
      }));

      console.log("Fetched leaderboard entries:", transformedData);
      return transformedData;
    },
    enabled: !!prize.id && isRegistered,
  });

  if (!isRegistered) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-200">Not Registered</Badge>
          <span className="text-sm text-yellow-800">
            You need to register for this prize to view the leaderboard.
          </span>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <Tabs value={prize.id} defaultValue={prize.id}>
      <TabsContent value={prize.id}>
        {isCompetitionEnded && (
          <Card className="mb-4 p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-200">Competition Ended</Badge>
              <span className="text-sm text-yellow-800">
                This competition has ended. Final rankings are displayed below.
              </span>
            </div>
          </Card>
        )}
        <PrizeInfo prize={prize} />
        <LeaderboardTable 
          entries={entries} 
          pointsRequired={prize.points_required}
          isCompetitionEnded={isCompetitionEnded}
          prizeId={prize.id}
        />
      </TabsContent>
    </Tabs>
  );
}