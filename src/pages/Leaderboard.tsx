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
        // First get all points with user information
        const { data: pointsData, error: pointsError } = await supabase
          .from('points')
          .select(`
            points,
            user_id,
            profiles (
              email
            )
          `);

        if (pointsError) throw pointsError;

        // Process and aggregate points by user
        const userPoints = pointsData.reduce((acc: { [key: string]: any }, curr) => {
          const userId = curr.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              email: curr.profiles?.email,
              total_points: 0,
            };
          }
          acc[userId].total_points += curr.points;
          return acc;
        }, {});

        // Convert to array and add ranks
        const leaderboardData = Object.values(userPoints)
          .sort((a: any, b: any) => b.total_points - a.total_points)
          .map((entry: any, index) => ({
            ...entry,
            rank: index + 1,
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
  }, []);

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