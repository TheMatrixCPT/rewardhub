import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { format } from "date-fns";

type PrizeLeaderboardEntry = {
  points: number;
  user_id: string;
  profiles: {
    email: string | null;
  } | null;
};

type Prize = {
  id: string;
  name: string;
  points_required: number;
  deadline: string | null;
};

const Leaderboard = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<string, PrizeLeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        console.log("Fetching prizes...");
        const { data: prizesData, error: prizesError } = await supabase
          .from('prizes')
          .select('id, name, points_required, deadline')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (prizesError) throw prizesError;
        
        if (prizesData && prizesData.length > 0) {
          console.log("Prizes fetched successfully:", prizesData);
          setPrizes(prizesData);
          setActiveTab(prizesData[0].id);
          
          const leaderboardsData: Record<string, PrizeLeaderboardEntry[]> = {};
          
          for (const prize of prizesData) {
            console.log(`Fetching registrations for prize ${prize.id}...`);
            const { data: registrations, error: registrationsError } = await supabase
              .from('prize_registrations')
              .select(`
                points,
                user_id,
                user:profiles!inner(email)
              `)
              .eq('prize_id', prize.id)
              .order('points', { ascending: false });

            if (registrationsError) {
              console.error("Error fetching registrations:", registrationsError);
              continue;
            }

            if (registrations) {
              console.log(`Registrations fetched for prize ${prize.id}:`, registrations);
              const formattedRegistrations: PrizeLeaderboardEntry[] = registrations.map(reg => ({
                points: reg.points || 0,
                user_id: reg.user_id,
                profiles: {
                  email: reg.user?.email
                }
              }));
              leaderboardsData[prize.id] = formattedRegistrations;
            }
          }
          
          setLeaderboards(leaderboardsData);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, [toast]);

  if (loading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (!prizes.length) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No active prize competitions at the moment.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle>Prize Competitions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {prizes.map((prize) => (
                <TabsTrigger key={prize.id} value={prize.id}>
                  {prize.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {prizes.map((prize) => (
              <TabsContent key={prize.id} value={prize.id}>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {prize.points_required} points required
                    </Badge>
                    {prize.deadline && (
                      <Badge variant="outline">
                        Ends {format(new Date(prize.deadline), "MMM d, yyyy")}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Rank</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboards[prize.id]?.map((entry, index) => (
                      <TableRow key={`${prize.id}-${index}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{entry.profiles?.email || 'Unknown'}</TableCell>
                        <TableCell className="text-right">{entry.points}</TableCell>
                      </TableRow>
                    ))}
                    {(!leaderboards[prize.id] || leaderboards[prize.id].length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No participants yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;