import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { PrizeLeaderboard } from "@/components/leaderboard/PrizeLeaderboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          .select('id, name, points_required, deadline, registration_start, registration_end')
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
                profile:profiles!prize_registrations_user_id_fkey(email)
              `)
              .eq('prize_id', prize.id)
              .order('points', { ascending: false });

            if (registrationsError) {
              console.error("Error fetching registrations:", registrationsError);
              continue;
            }

            if (registrations) {
              console.log(`Registrations fetched for prize ${prize.id}:`, registrations);
              leaderboardsData[prize.id] = registrations;
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
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading leaderboards...
          </CardContent>
        </Card>
      </div>
    );
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
            <CardTitle>Prize Competition Rankings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a prize competition" />
              </SelectTrigger>
              <SelectContent>
                {prizes.map((prize) => (
                  <SelectItem key={prize.id} value={prize.id}>
                    {prize.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {prizes.map((prize) => (
              prize.id === activeTab && (
                <PrizeLeaderboard
                  key={prize.id}
                  prize={prize}
                  entries={leaderboards[prize.id] || []}
                />
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;