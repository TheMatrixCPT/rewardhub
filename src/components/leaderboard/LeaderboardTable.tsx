import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type PrizeLeaderboardEntry = {
  points: number;
  user_id: string;
  profile?: {
    email: string | null;
  } | null;
};

type LeaderboardTableProps = {
  entries: PrizeLeaderboardEntry[];
  pointsRequired: number;
};

export function LeaderboardTable({ entries, pointsRequired }: LeaderboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Rank</TableHead>
          <TableHead>Participant</TableHead>
          <TableHead className="text-right">Points</TableHead>
          <TableHead className="text-right">Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries?.map((entry, index) => (
          <TableRow key={`${entry.user_id}-${index}`}>
            <TableCell className="font-medium">
              {index + 1}
              {index === 0 && " 🏆"}
              {index === 1 && " 🥈"}
              {index === 2 && " 🥉"}
            </TableCell>
            <TableCell>{entry.profile?.email || 'Anonymous'}</TableCell>
            <TableCell className="text-right">{entry.points}</TableCell>
            <TableCell className="text-right">
              {Math.min(100, Math.round((entry.points / pointsRequired) * 100))}%
            </TableCell>
          </TableRow>
        ))}
        {(!entries || entries.length === 0) && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No participants yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}