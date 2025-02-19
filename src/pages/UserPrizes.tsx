
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay } from "date-fns";
import { Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import PrizeBanner from "@/components/prizes/PrizeBanner";

const UserPrizes = () => {
  const [activeTab, setActiveTab] = useState("active");

  const { data: prizes } = useQuery({
    queryKey: ["all-prizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const now = startOfDay(new Date());

  // Completed prizes are those that have passed their deadline
  const completedPrizes = prizes?.filter(
    (prize) =>
      prize.deadline && startOfDay(new Date(prize.deadline)) < now
  );

  // Upcoming prizes are those where registration hasn't started yet
  const upcomingPrizes = prizes?.filter(
    (prize) =>
      prize.active &&
      prize.registration_start &&
      startOfDay(new Date(prize.registration_start)) > now
  );

  // Active prizes are those within their registration period and before deadline
  const activePrizes = prizes?.filter(
    (prize) =>
      prize.active &&
      prize.registration_start &&
      prize.registration_end &&
      prize.deadline &&
      startOfDay(new Date(prize.registration_start)) <= now &&
      startOfDay(new Date(prize.deadline)) > now
  );

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Prizes & Competitions</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Prizes</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activePrizes?.length ? (
            <PrizeBanner prizes={activePrizes} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No active prizes at the moment.
            </p>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcomingPrizes?.length ? (
            <div className="grid gap-6">
              {upcomingPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <h3 className="text-xl font-semibold">{prize.name}</h3>
                  <p className="text-muted-foreground">{prize.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {prize.points_required} points required
                    </Badge>
                  </div>
                  {prize.registration_start && prize.registration_end && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>Registration period:</p>
                      <p>
                        {format(new Date(prize.registration_start), "MMM d, yyyy")} -{" "}
                        {format(new Date(prize.registration_end), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                  {prize.deadline && (
                    <div className="text-sm text-muted-foreground">
                      <p>Competition ends:</p>
                      <p>{format(new Date(prize.deadline), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No upcoming prizes at the moment.
            </p>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedPrizes?.length ? (
            <div className="grid gap-6">
              {completedPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className="border rounded-lg p-6 space-y-4 opacity-75"
                >
                  <h3 className="text-xl font-semibold">{prize.name}</h3>
                  <p className="text-muted-foreground">{prize.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {prize.points_required} points required
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Status: Completed</p>
                    <p>Competition ended on {format(new Date(prize.deadline), "MMM d, yyyy")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No completed prizes to show.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPrizes;
