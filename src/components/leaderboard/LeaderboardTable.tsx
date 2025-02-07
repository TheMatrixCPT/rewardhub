import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PrizeLeaderboardEntry = {
  points: number;
  user_id: string;
  profiles?: {
    email: string | null;
  } | null;
};

type LeaderboardTableProps = {
  entries: PrizeLeaderboardEntry[];
  pointsRequired: number;
  isCompetitionEnded?: boolean;
  prizeId: string;
};

export function LeaderboardTable({ entries, pointsRequired, isCompetitionEnded, prizeId }: LeaderboardTableProps) {
  const { data: isRegistered } = useQuery({
    queryKey: ["prize-registration", prizeId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("prize_registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("prize_id", prizeId)
        .single();

      return !!data;
    },
  });

  if (!isRegistered) {
    return (
      <div className="text-center py-8 text-gray-500">
        You need to register for this prize to view the leaderboard.
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => b.points - a.points);
  const winners = isCompetitionEnded ? sortedEntries.filter(entry => entry.points >= pointsRequired) : [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Rank</TableHead>
          <TableHead>Participant</TableHead>
          <TableHead className="text-right">Points</TableHead>
          <TableHead className="text-right">Progress</TableHead>
          {isCompetitionEnded && <TableHead className="text-right">Status</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedEntries.map((entry, index) => (
          <TableRow key={`${entry.user_id}-${index}`}>
            <TableCell className="font-medium">
              {index + 1}
              {index === 0 && " 🏆"}
              {index === 1 && " 🥈"}
              {index === 2 && " 🥉"}
            </TableCell>
            <TableCell>{entry.profiles?.email || 'Anonymous'}</TableCell>
            <TableCell className="text-right">{entry.points}</TableCell>
            <TableCell className="text-right">
              {Math.min(100, Math.round((entry.points / pointsRequired) * 100))}%
            </TableCell>
            {isCompetitionEnded && (
              <TableCell className="text-right">
                {entry.points >= pointsRequired ? (
                  <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                    <Trophy className="h-4 w-4" />
                    Winner
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Did not qualify
                  </span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
        {(!entries || entries.length === 0) && (
          <TableRow>
            <TableCell colSpan={isCompetitionEnded ? 5 : 4} className="text-center text-muted-foreground">
              No participants yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}