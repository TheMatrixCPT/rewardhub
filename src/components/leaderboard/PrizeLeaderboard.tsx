import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PrizeInfo } from "./PrizeInfo";
import { LeaderboardTable } from "./LeaderboardTable";

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

export function PrizeLeaderboard({ prize, entries }: PrizeLeaderboardProps) {
  return (
    <Tabs value={prize.id} defaultValue={prize.id}>
      <TabsContent value={prize.id}>
        <PrizeInfo prize={prize} />
        <LeaderboardTable entries={entries} pointsRequired={prize.points_required} />
      </TabsContent>
    </Tabs>
  );
}