import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type LeaderboardEntry = {
  user_id: string;
  email: string;
  total_points: number;
  rank: number;
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // First get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');

        if (profilesError) throw profilesError;

        // Then get points for each user
        const { data: pointsData, error: pointsError } = await supabase
          .from('points')
          .select('user_id, points')
          .order('created_at', { ascending: false });

        if (pointsError) throw pointsError;

        // Process and aggregate points by user
        const userPoints = pointsData.reduce((acc: { [key: string]: number }, curr) => {
          const userId = curr.user_id;
          if (!acc[userId]) {
            acc[userId] = 0;
          }
          acc[userId] += curr.points;
          return acc;
        }, {});

        // Combine profiles with points and create leaderboard entries
        const leaderboardData = profiles
          .map(profile => ({
            user_id: profile.id,
            email: profile.email || 'Unknown',
            total_points: userPoints[profile.id] || 0
          }))
          .sort((a, b) => b.total_points - a.total_points)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast]);

  if (loading) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            See who's leading in points and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.user_id}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell className="text-right">{entry.total_points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;