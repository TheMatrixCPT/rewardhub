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

const Leaderboard = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [registeredPrizes, setRegisteredPrizes] = useState<string[]>([]);
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
          
          // Fetch user's registrations
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: registrations, error: regError } = await supabase
              .from('prize_registrations')
              .select('prize_id')
              .eq('user_id', user.id);

            if (regError) throw regError;
            
            console.log("Fetched registrations:", registrations);
            const registeredIds = registrations?.map(reg => reg.prize_id) || [];
            setRegisteredPrizes(registeredIds);
            
            // Set active tab to first registered prize if available
            if (registeredIds.length > 0) {
              const firstRegisteredPrize = prizesData.find(p => registeredIds.includes(p.id));
              if (firstRegisteredPrize) {
                setActiveTab(firstRegisteredPrize.id);
              }
            }
          }
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

  const registeredPrizesData = prizes.filter(prize => registeredPrizes.includes(prize.id));

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
            {registeredPrizesData.length > 0 ? (
              <>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a prize competition" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredPrizesData.map((prize) => (
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
                      isRegistered={registeredPrizes.includes(prize.id)}
                    />
                  )
                ))}
              </>
            ) : (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <p className="text-center text-yellow-800">
                  You haven't registered for any prize competitions yet.
                </p>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;